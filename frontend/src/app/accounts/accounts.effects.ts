import { Injectable } from "@angular/core";
import { Observable, of } from 'rxjs';
import { switchMap, map } from 'rxjs/operators';
import { Actions, Effect, ofType } from '@ngrx/effects';
import { BackendService } from '../backend.service'

@Injectable()
export class AccountsEffects {
    constructor(private actions$: Actions, private backend: BackendService) { };

    @Effect()
    getAccounts$: Observable<any> = this.actions$.pipe(
        ofType('[accounts] query'),
        switchMap(action => this.backend.getAccounts().pipe(
            map(data => { return { type: '[accounts] query success', payload: data }; })
        ))
    );
}