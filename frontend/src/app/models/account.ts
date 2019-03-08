export interface Account {
    id: number,
    group_id: number,
    name: string,
    full_name: string,
    currency: string,
    start_balance: number,
    balance: number,
    deleted: boolean
}