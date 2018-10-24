import { Injectable } from "@angular/core";
import { Router } from '@angular/router'
import { Observable, of } from 'rxjs';
import { switchMap, map, withLatestFrom, filter, tap, catchError } from 'rxjs/operators';
import { Actions, Effect, ofType } from '@ngrx/effects';
import { Store } from '@ngrx/store';
import { State } from '../app.reducers'
import { BackendService } from '../backend.service'
import { AlertifyService } from '../alertify.service'

@Injectable()
export class TransactionsEffects {
    constructor(private actions$: Actions<any>,
        private store: Store<State>,
        private backend: BackendService,
        private notify: AlertifyService,
        private router: Router) { };

    @Effect() getTransactions$: Observable<any> = this.actions$.ofType('[transactions] query').pipe(
        switchMap(action => this.backend.getTransactions().pipe(
            map(data => { return { type: '[transactions] query success', payload: data }; }),
            catchError(error => of({ type: '[transactions] query fail', payload: error }))
        ))
    );

    @Effect() createTransaction$: Observable<any> = this.actions$.ofType('[transactions] create').pipe(
        map(action => {
            this.router.navigate(['/transactions/create']);
            return {type: '[transactions] select'};
        })
    );

}