import { Account } from './account';

export interface Group {
    id: number,
    name: string,
    full_name: string,
    belong: number,
    visible: boolean,
    inbalance: boolean,
    deleted: boolean,
    accounts: Account[],
    total: {currency:string, balance: number}[],
    permissions: Permission[]
}

export interface Permission {
    write: boolean
}