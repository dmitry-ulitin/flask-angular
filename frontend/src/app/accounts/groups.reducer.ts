import { Account } from '../models/account';
import { Group } from '../models/group';
import { Transaction } from '../models/transaction';
import { Balance, Total } from '../models/balance';
import { Filter } from '../models/filter';

export interface State {
    groups: Group[],
    accounts: Account[],
    total: Balance,
    sgrp: Group,
    sacc: Account,
    extended: boolean
}

export const initialState: State = {
    groups: [],
    accounts: [],
    total: {},
    sgrp: null,
    sacc: null,
    extended: false
};

export function reducer(state: State = initialState, action: any): State {
    switch(action.type) {        
        case '[groups] query success' : {
            let groups = (action.payload as Group[])
            let sgrp = groups.find(g => state.sgrp && state.sgrp.id == g.id);
            let sacc = sgrp ? (sgrp.accounts.find(a => state.sacc && state.sacc.id == a.id) || sgrp.accounts[0]) : null;
            return {groups: groups, total: Total.total(groups), accounts: getAccounts(groups), sgrp: sgrp, sacc: sacc, extended: false};
        }
        case '[transactions] set filter': {
            let accs = (action.payload as Filter).accounts;
            if (!accs.length) {
                return state;
            }
            let sacc = accs.find(a => state.sacc && state.sacc.id == a.id) || accs[0];
            let sgrp = state.groups.find(g => g.id == sacc.group_id);
            return {...state, sgrp: sgrp, sacc: sacc};
        }
        case '[groups] select': {
            let sgrp = action.payload as Group;
            let extended = sgrp == state.sgrp ? !state.extended : false;
            let sacc = sgrp ? (sgrp.accounts.find(a => state.sacc && state.sacc.id == a.id) || sgrp.accounts.filter(a => !a.deleted)[0]) : null;
            return {...state, extended: extended, sgrp: sgrp, sacc: sacc};
        }
        case '[group] query id success':
        case '[group] save success': {
            let sgrp = action.payload as Group;
            let sacc = sgrp ? (sgrp.accounts.find(a => state.sacc && state.sacc.id == a.id) || sgrp.accounts[0]) : null;
            let groups = [...state.groups];
            let index = groups.findIndex(a => a.id == sgrp.id);
            if (index<0) {
                groups.push(sgrp);
            } else {
                groups[index] = sgrp;
            }
            return {groups: groups, total: Total.total(groups), accounts: getAccounts(groups), sgrp: sgrp, sacc: sacc, extended: state.extended};
        }
        case '[groups] delete success': {
            let groups = [...state.groups];
            let index = groups.findIndex(a => a.id == state.sgrp.id);
            if (index>=0) {
                groups.splice(index, 1);
            }
            return {groups: groups, accounts: getAccounts(groups), total: Total.total(groups), sgrp: null, sacc: null, extended: false};
        }
        case '[groups] add transaction': {
            return addTransaction(state, action.payload as Transaction, true);
        }
        case '[groups] delete transaction': {
            return addTransaction(state, action.payload as Transaction, false);
        }
        default: {
            return state;
        }
    }
}

function addTransaction(state: State, transaction: Transaction, add: boolean) {
    if (!transaction || !transaction.id) {
        return state;
    }
    let groups = [...state.groups];
    let sacc = state.sacc;
    if (transaction.recipient) {
        sacc = state.accounts.find(a => a.id == transaction.recipient.id)
        if (sacc) {
            sacc.balance += add ? transaction.debit : -transaction.debit;
        }
    }
    if (transaction.account) {
        sacc = state.accounts.find(a => a.id == transaction.account.id)
        if (sacc) {
            sacc.balance += add ? -transaction.credit : transaction.credit;
        }
    }
    let sgrp = groups.find(g => g.id == sacc.group_id);
    return {groups: groups, accounts: getAccounts(groups), total: Total.total(groups), sgrp: sgrp, sacc: sacc, extended: state.extended};
}

function getAccounts(groups: Group[]) {
    let accounts = [];
    for (let g of groups) {
        accounts = accounts.concat(g.accounts);
    }
    return accounts;
}
