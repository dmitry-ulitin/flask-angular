import { Transaction } from '../models/transaction';

export interface State {
    transactions: Transaction[],
    selected: Transaction
}

export const initialState: State = {
    transactions: [],
    selected: null
};

export function reducer(state: State = initialState, action: any): State {
    switch(action.type) {        
        case '[transactions] query success' : {
            let transactions = action.payload as Transaction[];
            return {...state, transactions: transactions, selected: null};
        }
        case '[transactions] select': {
            return {...state, selected: action.payload};
        }
        case '[transaction] query id success':
        case '[transaction] save success': {
            let selected = action.payload;
            let transactions = [...state.transactions];
            let index = transactions.findIndex(a => a.id == selected.id);
            if (index<0) {
                transactions.push(selected);
            } else {
                transactions[index] = selected;
            }
            return {...state, transactions: transactions, selected: selected};
        }
        case '[transactions] delete success': {
            let transactions = [...state.transactions];
            let index = transactions.findIndex(a => a.id == state.selected.id);
            if (index>=0) {
                transactions.splice(index, 1);
            } 
            return {...state, transactions: transactions, selected: null};
        }
        default: {
            return state;
        }
    }
}