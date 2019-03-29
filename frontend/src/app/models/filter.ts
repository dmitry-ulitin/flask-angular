import { Category } from './category';
import { Account } from './account';

export interface Filter {
    name: string
    accounts: Account[]
    categories: Category[]
}