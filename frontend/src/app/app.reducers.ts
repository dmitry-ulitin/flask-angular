import { ActionReducerMap } from '@ngrx/store';
import * as fromAccounts from './accounts/accounts.reducer';

export interface State {
    accounts: fromAccounts.State;
}

export const reducers: ActionReducerMap<State> = {
    accounts: fromAccounts.reducer,
};
