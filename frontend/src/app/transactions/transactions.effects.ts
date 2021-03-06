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
import { Filter } from "../models/filter";

@Injectable()
export class TransactionsEffects {
    constructor(private actions$: Actions<any>,
        private store: Store<State>,
        private backend: BackendService,
        private notify: AlertifyService,
        private router: Router,
        private location: Location) { };

    @Effect() getTransactions$: Observable<any> = this.actions$.pipe(
        ofType('[transactions] query'),
        withLatestFrom(this.store),
        switchMap(([action, state]) => this.backend.getTransactions(state.transactions.filters, 0, state.transactions.limit).pipe(
            map(data => { return { type: '[transactions] query success', payload: data }; }),
            catchError(error => of({ type: '[transactions] query fail', payload: error }))
        ))
    );


    @Effect() appendTransactions$: Observable<any> = this.actions$.pipe(
        ofType('[transactions] append'),
        withLatestFrom(this.store),
        switchMap(([action, state]) => this.backend.getTransactions(state.transactions.filters, state.transactions.transactions.length, state.transactions.limit).pipe(
            map(data => { return { type: '[transactions] append success', payload: data }; }),
            catchError(error => of({ type: '[transactions] append fail', payload: error }))
        ))
    );

    @Effect() filter$: Observable<any> = this.actions$.pipe(
        ofType('[transactions] set filter', '[transactions] add filter', '[transactions] clear filter'),
        map(action => { return { type: '[transactions] query' }; })
    );

    @Effect() getSummary$: Observable<any> = this.actions$.pipe(
        ofType('[transactions] set filter', '[transactions] add filter', '[transactions] clear filter'),
        withLatestFrom(this.store),
        switchMap(([action, state]) => this.backend.getSummary(state.transactions.filters).pipe(
            map(data => { return { type: '[transactions] summary success', payload: data }; }),
            catchError(error => of({ type: '[transactions] summary fail', payload: error }))
        ))
    );

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
            if (state.groups.sacc) {
                action.payload.account = action.payload.ttype == 2 ? null : state.groups.sacc;
                action.payload.recipient = action.payload.ttype == 1 ? null : state.groups.sacc;
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
                return of({ type: '[groups] delete transaction', payload: state.transactions.form }, { type: '[groups] add transaction', payload: data }, { type: '[transaction] save success', payload: data }, { type: '[transaction] query id', payload: data.id });
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
                    return of({ type: '[groups] delete transaction', payload: state.transactions.selected }, { type: '[transactions] delete success' });
                })
            )),
            catchError(error => of({ type: '[transactions] delete fail', payload: error }))
        ))
    );

    @Effect() filterSelectedCategory$: Observable<any> = this.actions$.pipe(
        ofType('[transactions] add filter selected category'),
        withLatestFrom(this.store),
        map(([a, s]) => { return { type: '[transactions] add filter', payload: { name: s.transactions.selected.category.name, categories: [s.transactions.selected.category] } }; })
    );
}