import { Transaction } from '../models/transaction';

export interface State {
    transactions: Transaction[],
    selected: Transaction,
    form:  Transaction
}

export const initialState: State = {
    transactions: [],
    selected: null,
    form: null
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
        case '[transactions] edit': {
            return {...state, form: action.payload};
        }
        case '[transactions] delete success': {
            let transactions = [...state.transactions];
            let index = transactions.findIndex(a => a.id == state.selected.id);
            if (index>=0) {
                transactions.splice(index, 1);
            } 
            return {...state, transactions: transactions, selected: null};
        }
        case '[transaction] query id success':
        case '[transaction] save success': {
            let selected = action.payload;
            let transactions = [...state.transactions];
            let index = transactions.findIndex(t => t.id == selected.id);
            if (index>=0) {
                transactions.splice(index, 1);
            }
            index = transactions.filter(t => t.opdate>selected.opdate).length;
            transactions.splice( index, 0, selected);
            return {...state, transactions: transactions, selected: selected, form: selected};
        }
        default: {
            return state;
        }
    }
}