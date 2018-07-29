import { Account } from '../models/account';

export interface State {
    accounts: Account[],
    selected: Account
}

export const initialState: State = {
    accounts: [],
    selected: null
};

export function reducer(state: State = initialState, action: any): State {
    switch(action.type) {
        case '[accounts] query success' : {
            return {...state, accounts: action.payload, selected: null};
        }
        case '[accounts] select': {
            return {...state, selected: action.payload};
        }
        default: {
            return state;
        }
    }
}