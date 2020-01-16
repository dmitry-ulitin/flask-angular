import { Category } from './category';
import { Account } from './account';
import { Amount } from './balance';

export interface Filter {
    name: string,
    accounts?: Account[],
    categories?: Category[],
    scope?: number,
    period?: {start: string, finish: string}
}

export interface Filters {
    filters: Filter[],
    summary?: Amount
}