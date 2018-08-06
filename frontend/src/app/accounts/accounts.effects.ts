import { Injectable } from "@angular/core";
import { Router } from '@angular/router'
import { Observable, of } from 'rxjs';
import { switchMap, concatMap, map, withLatestFrom, filter } from 'rxjs/operators';
import { Actions, Effect, ofType } from '@ngrx/effects';
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

    @Effect() getAccounts$: Observable<any> = this.actions$.ofType('[accounts] query').pipe(
        switchMap(action => this.backend.getAccounts().pipe(
            map(data => { return { type: '[accounts] query success', payload: data }; })
        ))
    );

    @Effect() saveAccount$: Observable<any> = this.actions$.ofType('[account] save').pipe(
        switchMap(action => this.backend.saveAccount(action.payload).pipe(
            map(data => {
                this.notify.success('New account added');
                this.router.navigate(['/accounts']);
                return { type: '[account] save success', payload: data };
            })
        ))
    );

    @Effect() deleteAccount$: Observable<any> = this.actions$.ofType('[accounts] delete').pipe(
        withLatestFrom(this.store),
        filter(([action, state]) => state.accounts.selected != null),
        concatMap(([action, state]) => this.notify.confirm('Delete?').pipe(
            filter(c => c),
            switchMap(() => this.backend.deleteAccount(state.accounts.selected.id).pipe(
                map(data => {
                    this.notify.success('Account removed');
                    this.router.navigate(['/accounts']);
                    return { type: '[accounts] delete success' };
                })
            ))
        ))
    );
}