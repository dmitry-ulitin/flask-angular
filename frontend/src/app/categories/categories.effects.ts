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
export class CategoriesEffects {
    constructor(private actions$: Actions<any>,
        private store: Store<State>,
        private backend: BackendService,
        private notify: AlertifyService,
        private router: Router) { };

        @Effect() getExpenses$: Observable<any> = this.actions$.ofType('[categories] query expenses').pipe(
            switchMap(action => this.backend.getExpenses().pipe(
                map(data => { return { type: '[categories] query expenses success', payload: data }; }),
                catchError(error => of({type:'[categories] query expenses fail', payload: error}))
            ))
        );
    
        @Effect() getIncome$: Observable<any> = this.actions$.ofType('[categories] query income').pipe(
            switchMap(action => this.backend.getIncome().pipe(
                map(data => { return { type: '[categories] query income success', payload: data }; }),
                catchError(error => of({type:'[categories] query income fail', payload: error}))
            ))
        );
    }