import { Account } from '../models/account';
import { Group } from '../models/group';
import { Transaction } from '../models/transaction';

export interface State {
    groups: Group[],
    accounts: Account[],
    total: {balance: number, currency: string}[],
    sgrp: Group,
    sacc: Account
}

export const initialState: State = {
    groups: [],
    accounts: [],
    total: [],
    sgrp: null,
    sacc: null
};

export function reducer(state: State = initialState, action: any): State {
    switch(action.type) {        
        case '[groups] query success' : {
            let groups = (action.payload as Group[])
            let sgrp = state.sgrp ? groups.find(a => a.id == state.sgrp.id) : null;
            let sacc = sgrp ? sgrp.accounts[0] : null;
            return {groups: groups, total: getGTotal(groups), accounts: getAccounts(groups), sgrp: sgrp, sacc: sacc};
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
            return {groups: groups, total: getGTotal(groups), accounts: getAccounts(groups), sgrp: sgrp, sacc: sacc};
        }
        case '[groups] delete success': {
            let groups = [...state.groups];
            let index = groups.findIndex(a => a.id == state.sgrp.id);
            if (index>=0) {
                groups.splice(index, 1);
            }
            return {groups: groups, accounts: getAccounts(groups), total: getGTotal(groups), sgrp: null, sacc: null};
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
    let total = state.total;
    let sacc = state.sacc;
    let sgrp = state.sgrp;
    if (transaction.recipient) {
        sacc = sacc && sacc.group_id == transaction.recipient.group_id ? sacc : transaction.recipient;
        total = add2balance(groups, transaction.recipient.id, add ? transaction.debit : -transaction.debit);
    }
    if (transaction.account) {
        sacc = sacc && sacc.group_id == transaction.account.group_id ? sacc : transaction.account;
        total = add2balance(groups, transaction.account.id, add ? -transaction.credit : transaction.credit);
    }
    sacc.group_id = sacc.group ? sacc.group.id : sacc.group_id;
    sgrp = groups.find(g => g.id == sacc.group_id);
    sacc = state.accounts.find(a => a.id == sacc.id);
    sacc = !sacc && sgrp ? sgrp.accounts[0] : sacc;
    return {groups: groups, accounts: getAccounts(groups), total: total, sgrp: sgrp, sacc: sacc};
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
            if (!a.deleted) {
                gtotal[a.currency] = balance;
            }
            balance = atotal[a.currency] || { balance:0, currency: a.currency};
            balance.balance += a.balance;
            atotal[a.currency] = balance;
        }
        g.total = Object.values(atotal);
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
