import { Injectable } from "@angular/core";
import { Observable, of, defer } from 'rxjs';
import { filter, map, switchMap, catchError } from 'rxjs/operators';
import { Actions, Effect} from '@ngrx/effects';
import { AlertifyService } from './alertify.service';
import { AuthService } from "./auth.service";
import { Router } from "@angular/router";

@Injectable()
export class AppEffects {
    constructor(private actions$: Actions<any>, private notify: AlertifyService, private auth: AuthService, private router: Router) {};

    @Effect() fail$: Observable<any> = this.actions$.pipe(
        filter(action => action.type.endsWith('fail')),
        map(action => {
            console.log(action.payload);
            this.notify.error(action.type);
            return {type: 'empty action'};
        })
    );

    @Effect() login$: Observable<any> = this.actions$.ofType('[app] login').pipe(
        switchMap((action) => this.auth.login(action.payload.email, action.payload.password).pipe(
            map(response => {
                if (response) {
                    this.router.navigate(action.payload.returnUrl);
                } else {
                    this.notify.error('Invalid login name or password');
                }
                return { type: '[app] login success', payload: response.success };
            }),
            catchError(error => of({ type: '[app] login fail', payload: error })))
        )
    );

    @Effect() init$ = defer(() => {
        return of({ type: '[accounts] query' }, { type: '[transactions] query' },
         { type: '[categories] query expenses' }, { type: '[categories] query income' });
    });
}