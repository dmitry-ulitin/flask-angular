import { Account } from './account';

export interface Group {
    id: number,
    name: string,
    full_name: string,
    visible: boolean,
    inbalance: boolean,
    deleted: boolean,
    accounts: Account[],
    balances: {currency:string, balance: number}[]
}