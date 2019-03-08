import { Account } from '../models/account';
import { Group } from '../models/group';

export interface State {
    groups: Group[],
    accounts: Account[],
    total: {balance: number, currency: string}[],
    selected: Group
}

export const initialState: State = {
    groups: [],
    accounts: [],
    total: [],
    selected: null
};

export function reducer(state: State = initialState, action: any): State {
    switch(action.type) {        
        case '[groups] query success' : {
            let groups = (action.payload as Group[])
            let selected = state.selected ? groups.find(a => a.id == state.selected.id) : null;
            return {groups: groups, total: getGTotal(groups), accounts: getAccounts(groups), selected: selected};
        }
        case '[groups] select': {
            return {...state, selected: action.payload};
        }
        case '[group] query id success':
        case '[group] save success': {
            let selected = action.payload as Group;
            let groups = [...state.groups];
            let index = groups.findIndex(a => a.id == selected.id);
            if (index<0) {
                groups.push(selected);
            } else {
                groups[index] = selected;
            }
            return {groups: groups, total: getGTotal(groups), accounts: getAccounts(groups), selected: selected};
        }
        case '[groups] delete success': {
            let groups = [...state.groups];
            let index = groups.findIndex(a => a.id == state.selected.id);
            if (index>=0) {
                groups.splice(index, 1);
            }
            return {groups: groups, accounts: getAccounts(groups), total: getGTotal(groups), selected: null};
        }
        case '[groups] add transaction': {
            let groups = [...state.groups];
            let total = state.total;
            if (action.payload && action.payload.id) {
                if (action.payload.account) {
                    total = add2balance(groups, action.payload.account.id, -action.payload.credit);
                }
                if (action.payload.recipient) {
                    total = add2balance(groups, action.payload.recipient.id, action.payload.debit);
                }
            }
            let selected = state.selected ? groups.find(a => a.id == state.selected.id) : null;
            return {groups: groups, accounts: getAccounts(groups), total: total, selected: selected};
        }
        case '[groups] delete transaction': {
            let groups = [...state.groups];
            let total = state.total;
            if (action.payload && action.payload.id) {
                if (action.payload.account) {
                    total = add2balance(groups, action.payload.account.id, action.payload.credit);
                }
                if (action.payload.recipient) {
                    total = add2balance(groups, action.payload.recipient.id, -action.payload.debit);
                }
            }
            let selected = state.selected ? groups.find(a => a.id == state.selected.id) : null;
            return {groups: groups, accounts: getAccounts(groups), total: total, selected: selected};
        }
        default: {
            return state;
        }
    }
}

function add2balance(groups: Group[], id: number, amount: number) {
    let gtotal: { [id: string] : {balance: number, currency: string}} = {};
    for (let g of groups) {
        let atotal: { [id: string] : {balance: number, currency: string}} = {};
        for (let a of g.accounts) {
            if (a.id == id) {
                a.balance += amount;
            }
            let balance = gtotal[a.currency] || { balance:0, currency: a.currency};
            balance.balance += a.balance;
            gtotal[a.currency] = balance;
            balance = atotal[a.currency] || { balance:0, currency: a.currency};
            balance.balance += a.balance;
            atotal[a.currency] = balance;
        }
        g.balances = Object.values(atotal);
    }
    return Object.values(gtotal);
}

function getGTotal(groups: Group[]) {
    let total: { [id: string] : {balance: number, currency: string}} = {};
    for (let g of groups) {
        for (let a of g.accounts) {
            let balance = total[a.currency] || { balance:0, currency: a.currency};
            balance.balance += a.balance;
            total[a.currency] = balance;
        }
    }
    return Object.values(total);
}

function getAccounts(groups: Group[]) {
    let accounts = [];
    for (let g of groups) {
        accounts = accounts.concat(g.accounts);
    }
    return accounts;
}
