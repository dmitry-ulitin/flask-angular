import { Category } from './category';
import { Account } from './account';
import { Group } from './group';

export interface Filter {
    groups: Group[],
    accounts: Account[],
    categories: Category[]
}