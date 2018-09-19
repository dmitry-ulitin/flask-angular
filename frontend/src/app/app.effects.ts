import { Injectable } from "@angular/core";
import { Observable, of, defer } from 'rxjs';
import { filter, map } from 'rxjs/operators';
import { Actions, Effect} from '@ngrx/effects';
import { AlertifyService } from './alertify.service';

@Injectable()
export class AppEffects {
    constructor(private actions$: Actions<any>, private notify: AlertifyService) {};

    @Effect() fail$: Observable<any> = this.actions$.pipe(
        filter(action => action.type.endsWith('fail')),
        map(action => {
            console.log(action.payload);
            this.notify.error(action.type);
            return {type: 'empty action'};
        })
    );

    @Effect() init$ = defer(() => {
        return of({ type: '[accounts] query' }, { type: '[transactions] query' },
         { type: '[categories] query expenses' }, { type: '[categories] query income' });
    });
}