import { Account } from '../models/account';
import { Group } from '../models/group';
import { Transaction } from '../models/transaction';
import { Balance, Total } from '../models/balance';

export interface State {
    groups: Group[],
    accounts: Account[],
    total: Balance,
    sgrp: Group,
    sacc: Account
}

export const initialState: State = {
    groups: [],
    accounts: [],
    total: {},
    sgrp: null,
    sacc: null
};

export function reducer(state: State = initialState, action: any): State {
    switch(action.type) {        
        case '[groups] query success' : {
            let groups = (action.payload as Group[])
            let sgrp = state.sgrp ? groups.find(a => a.id == state.sgrp.id) : null;
            let sacc = sgrp ? sgrp.accounts[0] : null;
            return {groups: groups, total: Total.total(groups), accounts: getAccounts(groups), sgrp: sgrp, sacc: sacc};
        }
        case '[groups] select': {
            let sgrp = action.payload as Group;
            let sacc = sgrp ? sgrp.accounts[0] : null;
            return {...state, sgrp: sgrp, sacc: sacc};
        }
        case '[group] query id success':
        case '[group] save success': {
            let sgrp = action.payload as Group;
            let sacc = sgrp ? sgrp.accounts[0] : null;
            let groups = [...state.groups];
            let index = groups.findIndex(a => a.id == sgrp.id);
            if (index<0) {
                groups.push(sgrp);
            } else {
                groups[index] = sgrp;
            }
            return {groups: groups, total: Total.total(groups), accounts: getAccounts(groups), sgrp: sgrp, sacc: sacc};
        }
        case '[groups] delete success': {
            let groups = [...state.groups];
            let index = groups.findIndex(a => a.id == state.sgrp.id);
            if (index>=0) {
                groups.splice(index, 1);
            }
            return {groups: groups, accounts: getAccounts(groups), total: Total.total(groups), sgrp: null, sacc: null};
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
    return {groups: groups, accounts: getAccounts(groups), total: Total.total(groups), sgrp: sgrp, sacc: sacc};
}

function getAccounts(groups: Group[]) {
    let accounts = [];
    for (let g of groups) {
        accounts = accounts.concat(g.accounts);
    }
    return accounts;
}
