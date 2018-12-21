export interface Account {
    id: number,
    name: string,
    currency: string,
    start_balance: number,
    balance: number,
    visible: boolean,
    inbalance: boolean
}