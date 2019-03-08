import { ActionReducerMap } from '@ngrx/store';
import * as fromGroups from './accounts/groups.reducer';
import * as fromCategories from './categories/categories.reducer';
import * as fromTransactions from './transactions/transactions.reducer';

export interface State {
    groups: fromGroups.State;
    categories: fromCategories.State;
    transactions: fromTransactions.State;
}

export const reducers: ActionReducerMap<State> = {
    groups: fromGroups.reducer,
    categories: fromCategories.reducer,
    transactions: fromTransactions.reducer
};
