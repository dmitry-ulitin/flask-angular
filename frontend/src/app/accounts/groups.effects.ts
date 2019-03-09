import { Injectable } from "@angular/core";
import { Router } from '@angular/router'
import { Observable, of } from 'rxjs';
import { switchMap, map, withLatestFrom, filter, catchError } from 'rxjs/operators';
import { Actions, Effect, ofType  } from '@ngrx/effects';
import { Store } from '@ngrx/store';
import { State } from '../app.reducers'
import { BackendService } from '../backend.service'
import { AlertifyService } from '../alertify.service'

@Injectable()
export class GroupsEffects {
    constructor(private actions$: Actions<any>,
        private store: Store<State>,
        private backend: BackendService,
        private notify: AlertifyService,
        private router: Router) { };

    @Effect() getGroups$: Observable<any> = this.actions$.pipe(
        ofType('[groups] query'),
        switchMap(action => this.backend.getGroups().pipe(
            map(data => { return { type: '[groups] query success', payload: data }; }),
            catchError(error => of({type:'[groups] query fail', payload: error}))
        ))
    );

    @Effect() getGroup$: Observable<any> = this.actions$.pipe(
        ofType<any>('[group] query id'),
        filter(action => action.payload),
        switchMap(action => this.backend.getGroup(action.payload).pipe(
            map(data => { return { type: '[group] query id success', payload: data }; }),
            catchError(error => of({type:'[group] query id fail', payload: error}))
        ))
    );

    @Effect() clearGroup$: Observable<any> = this.actions$.pipe(
        ofType<any>('[group] query id'),
        filter(action => !action.payload),
        map(action => { return {type: '[groups] select'};})
    );

    @Effect() createGroup$: Observable<any> = this.actions$.pipe(
        ofType('[groups] create'),
        map(action => {
            this.router.navigate(['/accounts/create']);
            return {type: '[groups] select'};
        })
    );

    @Effect() saveGroup$: Observable<any> = this.actions$.pipe(
        ofType<any>('[group] save'),
        switchMap(action => this.backend.saveGroup(action.payload).pipe(
            map(data => {
                this.notify.success('Group saved');
                this.router.navigate(['/accounts']);
                return { type: '[group] save success', payload: data };
            }),
            catchError(error => of({type:'[group] save fail', payload: error}))
        ))
    );

    @Effect() deleteGroup$: Observable<any> = this.actions$.pipe(
        ofType('[groups] delete'),
        withLatestFrom(this.store),
        filter(([action, state]) => state.groups.selected != null),
        switchMap(([action, state]) => this.notify.confirm('Delete group?').pipe(
            filter(c => c),
            switchMap(() => this.backend.deleteGroup(state.groups.selected.id).pipe(
                map(data => {
                    this.notify.success('Group removed');
                    this.router.navigate(['/accounts']);
                    return { type: '[groups] delete success' };
                })
            )),
            catchError(error => of({type:'[groups] delete fail', payload: error}))
        ))
    );
}