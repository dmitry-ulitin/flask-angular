import { Transaction } from '../models/transaction';
import { Account } from '../models/account';
import { Filter, Filters } from '../models/filter';

export interface State {
    transactions: Transaction[],
    filters: Filters,
    selected: Transaction,
    form:  Transaction
}

export const initialState: State = {
    transactions: [],
    filters: { filters: []},
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
        case '[transactions] add filter': {
            let filter = action.payload as Filter;
            let filters = state.filters.filters;
            if (filter.accounts || filter.scope) {
                filters = [...filters.filter(f => !(f.accounts || f.scope)), filter]
            }
            if (filter.categories) {
                filters = [...filters.filter(f => !f.categories), filter]
            }
            return {...state, filters: { filters: filters}, selected: null};
        }
        case '[transactions] clear filter': {
            let filter = action.payload as Filter;
            let filters = state.filters.filters.filter(f => f.name != filter.name);
            return {...state, filters: { filters: filters}, selected: null};
        }
        case '[transactions] set filter': {
            return {...state, filters: { filters: (action.payload ? [action.payload]:[])}, selected: null};
        }
        case '[transactions] summary success': {
            return {...state, filters: {...state.filters, summary: action.payload}};
        }
        case '[transactions] edit': {
            return {...state, form: action.payload};
        }
        case '[transactions] delete success': {
            let transactions = [...state.transactions];
            let index = transactions.findIndex(a => a.id == state.selected.id);
            if (index>=0) {
                if (transactions[index].account && transactions[index].account.balance) {
                    transactions[index].account.balance += transactions[index].credit;
                }
                if (transactions[index].recipient && transactions[index].recipient.balance) {
                    transactions[index].recipient.balance -= transactions[index].debit;
                }
                fixBalance(transactions, index)
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
            fixBalance(transactions, index)
            return {...state, transactions: transactions, selected: selected, form: selected};
        }
        default: {
            return state;
        }
    }
}
function fixBalance(transactions: Transaction[], index: number) {
    let account = null;
    let recipient = null;
    if (transactions[index].account && transactions[index].account.balance) {
        account = transactions[index].account;
    }
    if (transactions[index].recipient && transactions[index].recipient.balance) {
        recipient = transactions[index].recipient;
    }
    for(let i = index - 1; i>=0; i--) {
        if (account) {
            if (transactions[i].account && transactions[i].account.id == account.id) {
                transactions[i].account.balance = account.balance - transactions[i].credit;
                account = transactions[i].account;
            }
            if (transactions[i].recipient && transactions[i].recipient.id == account.id) {
                transactions[i].recipient.balance = account.balance + transactions[i].debit;
                account = transactions[i].recipient;
            }
        }
        if (recipient) {
            if (transactions[i].account && transactions[i].account.id == recipient.id) {
                transactions[i].account.balance = recipient.balance - transactions[i].credit;
                recipient = transactions[i].account;
            }
            if (transactions[i].recipient && transactions[i].recipient.id == recipient.id) {
                transactions[i].recipient.balance = recipient.balance + transactions[i].debit;
                recipient = transactions[i].recipient;
            }
        }
    }
}