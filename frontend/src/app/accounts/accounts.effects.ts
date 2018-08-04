import { Injectable } from "@angular/core";
import { Router } from '@angular/router'
import { Observable, of } from 'rxjs';
import { switchMap, map } from 'rxjs/operators';
import { Actions, Effect, ofType } from '@ngrx/effects';
import { BackendService } from '../backend.service'

@Injectable()
export class AccountsEffects {
    constructor(private actions$: Actions<any>, private backend: BackendService, private router: Router) { };

    @Effect() getAccounts$: Observable<any> = this.actions$.ofType('[accounts] query').pipe(
        switchMap(action => this.backend.getAccounts().pipe(
            map(data => { return { type: '[accounts] query success', payload: data }; })
        ))
    );
    @Effect() saveAccount$: Observable<any> = this.actions$.ofType('[account] save').pipe(
        switchMap(action => this.backend.saveAccount(action.payload).pipe(
            map(data => {
                this.router.navigate(['/accounts']);
                return { type: '[account] save success', payload: data };
            })
        ))
    );
}