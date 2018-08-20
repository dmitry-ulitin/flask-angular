import { ActionReducerMap } from '@ngrx/store';
import * as fromAccounts from './accounts/accounts.reducer';
import * as fromCategories from './categories/categories.reducer';

export interface State {
    accounts: fromAccounts.State;
    categories: fromCategories.State;
}

export const reducers: ActionReducerMap<State> = {
    accounts: fromAccounts.reducer,
    categories: fromCategories.reducer
};
