import { Category } from './category';
import { Account } from './account';

export interface Filter {
    accounts: Account[],
    categories: Category[]
}