import { Injectable } from "@angular/core";
import { Router } from '@angular/router'
import { Observable, of } from 'rxjs';
import { switchMap, map, withLatestFrom, filter, tap, catchError } from 'rxjs/operators';
import { Actions, Effect, ofType  } from '@ngrx/effects';
import { Store } from '@ngrx/store';
import { State } from '../app.reducers'
import { BackendService } from '../backend.service'
import { AlertifyService } from '../alertify.service'

@Injectable()
export class AccountsEffects {
    constructor(private actions$: Actions<any>,
        private store: Store<State>,
        private backend: BackendService,
        private notify: AlertifyService,
        private router: Router) { };

    @Effect() getAccounts$: Observable<any> = this.actions$.pipe(
        ofType('[accounts] query'),
        switchMap(action => this.backend.getAccounts().pipe(
            map(data => { return { type: '[accounts] query success', payload: data }; }),
            catchError(error => of({type:'[accounts] query fail', payload: error}))
        ))
    );

    @Effect() getAccount$: Observable<any> = this.actions$.pipe(
        ofType<any>('[account] query id'),
        filter(action => action.payload),
        switchMap(action => this.backend.getAccount(action.payload).pipe(
            map(data => { return { type: '[account] query id success', payload: data }; }),
            catchError(error => of({type:'[accounts] query id fail', payload: error}))
        ))
    );

    @Effect() clearAccount$: Observable<any> = this.actions$.pipe(
        ofType<any>('[account] query id'),
        filter(action => !action.payload),
        map(action => { return {type: '[accounts] select'};})
    );

    @Effect() createAccount$: Observable<any> = this.actions$.pipe(
        ofType('[accounts] create'),
        map(action => {
            this.router.navigate(['/accounts/create']);
            return {type: '[accounts] select'};
        })
    );

    @Effect() saveAccount$: Observable<any> = this.actions$.pipe(
        ofType<any>('[account] save'),
        switchMap(action => this.backend.saveAccount(action.payload).pipe(
            map(data => {
                this.notify.success('Account saved');
                this.router.navigate(['/accounts']);
                return { type: '[account] save success', payload: data };
            }),
            catchError(error => of({type:'[accounts] save fail', payload: error}))
        ))
    );

    @Effect() deleteAccount$: Observable<any> = this.actions$.pipe(
        ofType('[accounts] delete'),
        withLatestFrom(this.store),
        filter(([action, state]) => state.accounts.selected != null),
        switchMap(([action, state]) => this.notify.confirm('Delete?').pipe(
            filter(c => c),
            switchMap(() => this.backend.deleteAccount(state.accounts.selected.id).pipe(
                map(data => {
                    this.notify.success('Account removed');
                    this.router.navigate(['/accounts']);
                    return { type: '[accounts] delete success' };
                })
            )),
            catchError(error => of({type:'[accounts] delete fail', payload: error}))
        ))
    );
}