import { Group } from "./group";

export interface Account {
    id: number,
    group_id: number,
    group: Group,
    name: string,
    full_name: string,
    currency: string,
    start_balance: number,
    balance: number,
    deleted: boolean
}