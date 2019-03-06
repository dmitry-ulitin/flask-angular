import { Injectable } from "@angular/core";
import { Router } from '@angular/router'
import { Location } from '@angular/common'
import { Observable, of } from 'rxjs';
import { switchMap, concatMap, map, withLatestFrom, filter, tap, catchError } from 'rxjs/operators';
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
        private router: Router,
        private location: Location) { };

    @Effect() getTransactions$: Observable<any> = this.actions$.pipe(
        ofType('[transactions] query', '[transactions] filter accounts'),
        withLatestFrom(this.store),
        switchMap(([action, state]) => this.backend.getTransactions(state.transactions.filter).pipe(
            map(data => { return { type: '[transactions] query success', payload: data }; }),
            catchError(error => of({ type: '[transactions] query fail', payload: error }))
        ))
    );

//    @Effect() setAccount$: Observable<any> = this.actions$.ofType('[transaction] account').pipe(map(action => { return { type: '[transactions] query'};}));

    @Effect() getTransaction$: Observable<any> = this.actions$.pipe(
        ofType<any>('[transaction] query id'),
        switchMap(action => this.backend.getTransaction(action.payload).pipe(
            map(data => { return { type: '[transaction] query id success', payload: data }; }),
            catchError(error => of({ type: '[transaction] query id fail', payload: error }))
        ))
    );

    @Effect() createTransaction$: Observable<any> = this.actions$.pipe(
        ofType<any>('[transactions] create'),
        withLatestFrom(this.store),
        map(([action, state]) => {
            if (state.accounts.selected) {
                action.payload.account = action.payload.ttype == 1 ? null : state.accounts.selected;
                action.payload.recipient = action.payload.ttype == 2 ? null : state.accounts.selected;
            }
            this.router.navigate(['/transactions/create']);
            return { type: '[transactions] edit', payload: action.payload };
        })
    );

    @Effect() saveTransaction$: Observable<any> = this.actions$.pipe(
        ofType<any>('[transaction] save'),
        withLatestFrom(this.store),
        switchMap(([action, state]) => this.backend.saveTransaction(action.payload).pipe(
            concatMap(data => {
                this.notify.success('Transaction saved');
                this.location.back();
                return of({ type: '[accounts] delete transaction', payload: state.transactions.form}, { type: '[accounts] add transaction', payload: data }, { type: '[transaction] save success', payload: data }, { type: '[transaction] query id', payload: data.id });
            }),
            catchError(error => of({ type: '[transactions] save fail', payload: error }))
        ))
    );

    @Effect() deleteTransaction$: Observable<any> = this.actions$.pipe(
        ofType('[transactions] delete'),
        withLatestFrom(this.store),
        filter(([action, state]) => state.transactions.selected != null),
        switchMap(([action, state]) => this.notify.confirm('Delete transaction #' + state.transactions.selected.id + '?').pipe(
            filter(c => c),
            switchMap(() => this.backend.deleteTransaction(state.transactions.selected.id).pipe(
                concatMap(data => {
                    this.notify.success('Transaction removed');
                    this.router.navigate(['/transactions']);
                    return of({ type: '[accounts] delete transaction', payload: state.transactions.selected },{ type: '[transactions] delete success'});
                })
            )),
            catchError(error => of({ type: '[transactions] delete fail', payload: error }))
        ))
    );
}