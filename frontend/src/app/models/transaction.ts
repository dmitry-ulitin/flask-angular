import { Category } from './category';
import { Account } from './account';

export interface Transaction {
    id: number,
    category: Category,
    account: Account,
    recipient: Account,
    name: string,
    currency: string,
    amount: number,
    details: string
}