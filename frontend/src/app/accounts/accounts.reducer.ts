import { Account } from '../models/account';

export interface State {
    accounts: Account[],
    total: {balance: number, currency: string}[],
    selected: Account
}

export const initialState: State = {
    accounts: [],
    total: [],
    selected: null
};

export function reducer(state: State = initialState, action: any): State {
    switch(action.type) {        
        case '[accounts] query success' : {
            let accounts = (action.payload as Account[])
            return {...state, accounts: accounts, total: getTotal(accounts), selected: null};
        }
        case '[accounts] select': {
            return {...state, selected: action.payload};
        }
        case '[account] query id success':
        case '[account] save success': {
            let selected = action.payload;
            let accounts = [...state.accounts];
            let index = accounts.findIndex(a => a.id == selected.id);
            if (index<0) {
                accounts.push(selected);
            } else {
                accounts[index] = selected;
            }
            return {...state, accounts: accounts, total: getTotal(accounts), selected: selected};
        }
        case '[accounts] delete success': {
            let accounts = [...state.accounts];
            let index = accounts.findIndex(a => a.id == state.selected.id);
            if (index>=0) {
                accounts.splice(index, 1);
            }
            return {...state, accounts: accounts, total: getTotal(accounts), selected: null};
        }
        case '[accounts] add transaction': {
            let accounts = [...state.accounts];
            if (action.payload.account) {
                let account = accounts.find(a => a.id == action.payload.account.id);
                if (account) {
                    account.balance -= action.payload.credit;
                }     
            }
            if (action.payload.recipient) {
                let recipient = accounts.find(a => a.id == action.payload.recipient.id);
                if (recipient) {
                    recipient.balance += action.payload.debit;
                }     
            }
            let selected = state.selected ? accounts.find(a => a.id == state.selected.id) : null;
            return {...state, accounts: accounts, total: getTotal(accounts), selected: selected};
        }
        case '[accounts] delete transaction': {
            let accounts = [...state.accounts];
            if (action.payload && action.payload.id && action.payload.account) {
                let account = accounts.find(a => a.id == action.payload.account.id);
                if (account) {
                    account.balance += action.payload.credit;
                }     
            }
            if (action.payload && action.payload.id && action.payload.recipient) {
                let recipient = accounts.find(a => a.id == action.payload.recipient.id);
                if (recipient) {
                    recipient.balance -= action.payload.debit;
                }     
            }
            let selected = state.selected ? accounts.find(a => a.id == state.selected.id) : null;
            return {...state, accounts: accounts, total: getTotal(accounts), selected: selected};
        }
        default: {
            return state;
        }
    }
}

function getTotal(accounts: Account[]) {
    let total: { [id: string] : {balance: number, currency: string}} = {};
    for (let a of accounts) {
        let balance = total[a.currency] || { balance:0, currency: a.currency};
        balance.balance += a.balance;
        total[a.currency] = balance;
    }
    return Object.values(total);
}