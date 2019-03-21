import { Category } from '../models/category';
import { Transaction } from '../models/transaction';

export interface State {
    expenses: Category[],
    income: Category[]
}

export const initialState: State = {
    expenses: [],
    income: []
};

export function reducer(state: State = initialState, action: any): State {
    switch(action.type) {        
        case '[categories] query expenses success' : {
            return {...state, expenses: action.payload};
        }
        case '[categories] query income success' : {
            return {...state, income: action.payload};
        }
        case '[transaction] query id success': {
            let transaction = action.payload as Transaction;
            if (transaction.category) {
                let categories = transaction.account ? [...state.expenses] : [...state.income];
                if (!categories.some(c => c.id == transaction.category.id)) {
                    let index = categories.findIndex(c => c.parent_id == transaction.category.parent_id && c.name>transaction.category.name)
                    if (index<0) {
                        categories.push(transaction.category);
                    } else {
                        categories.splice(index,0, transaction.category);
                    }
                    return {...state, expenses: transaction.account ? categories : state.expenses, income: transaction.account ? state.income : categories};
                }
            }
            return state;
        }
        default: {
            return state;
        }
    }
}