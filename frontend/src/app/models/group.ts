import { Account } from './account';
import { User } from './user';

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
    user: User,
    write: boolean,
    admin: boolean
}