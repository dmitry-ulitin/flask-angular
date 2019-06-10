import { Category } from './category';
import { Account } from './account';
import { Amount } from './balance';

export interface Filter {
    name: string,
    accounts?: Account[],
    categories?: Category[],
    scope?: number,
}

export interface Filters {
    filters: Filter[],
    summary?: Amount
}