import { Injectable } from "@angular/core";
import { Observable, of, defer } from 'rxjs';
import { filter, map, switchMap, catchError, mergeMap } from 'rxjs/operators';
import { Actions, Effect, ofType } from '@ngrx/effects';
import { AlertifyService } from './alertify.service';
import { AuthService } from "./auth.service";
import { Router } from "@angular/router";
import { Filter } from "./models/filter";

@Injectable()
export class AppEffects {
    constructor(private actions$: Actions<any>, private notify: AlertifyService, private auth: AuthService, private router: Router) { };

    @Effect() fail$: Observable<any> = this.actions$.pipe(
        filter(action => action.type.endsWith('fail')),
        map(action => {
            console.log(action.payload);
            this.notify.error(action.payload || action.type);
            return { type: 'empty action' };
        })
    );

    @Effect() login$: Observable<any> = this.actions$.pipe(
        ofType<any>('[app] login'),
        switchMap((action) => this.auth.login(action.payload.email, action.payload.password).pipe(
            map(response => {
                this.router.navigate([action.payload.returnUrl]);
                return { type: '[app] load' };
            }),
            catchError(error => of({ type: '[app] login fail', payload: error })))
        )
    );

    @Effect() loadData$: Observable<any> = this.actions$.pipe(
        ofType('[app] load'),
        filter(action => this.auth.currentToken != null),
        mergeMap(action => of({ type: '[groups] query' }, { type: '[transactions] query' }, { type: '[categories] query expenses' }, { type: '[categories] query income' }, {type:'[transactions] filter', payload: <Filter>{name: '', accounts: [], categories:[]}}))
    );

    @Effect() init$ = defer(() => {
        return of({ type: '[app] load' });
    });
}