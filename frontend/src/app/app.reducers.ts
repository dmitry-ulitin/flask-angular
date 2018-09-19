import { ActionReducerMap } from '@ngrx/store';
import * as fromAccounts from './accounts/accounts.reducer';
import * as fromCategories from './categories/categories.reducer';
import * as fromTransactions from './transactions/transactions.reducer';

export interface State {
    accounts: fromAccounts.State;
    categories: fromCategories.State;
    transactions: fromTransactions.State;
}

export const reducers: ActionReducerMap<State> = {
    accounts: fromAccounts.reducer,
    categories: fromCategories.reducer,
    transactions: fromTransactions.reducer
};
