import { Injectable } from "@angular/core";
import { of, defer } from 'rxjs';
import { Actions, Effect} from '@ngrx/effects';

@Injectable()
export class AppEffects {
    constructor(private actions$: Actions) { };

    @Effect() init$ = defer(() => {
        return of({ type: '[accounts] query' });
    });
}