import { Account } from './account';

export interface Group {
    id: number,
    name: string,
    full_name: string,
    balances: {currency:string, balance: number}[],
    visible: boolean,
    inbalance: boolean,
    deleted: boolean,
    accounts: Account[]
}