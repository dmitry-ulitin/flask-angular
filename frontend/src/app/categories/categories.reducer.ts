import { Category } from '../models/category';

export interface State {
    expenses: Category,
    income: Category
}

export const initialState: State = {
    expenses: null,
    income: null
};

export function reducer(state: State = initialState, action: any): State {
    switch(action.type) {        
        case '[categories] query expenses success' : {
            return {...state, expenses: action.payload};
        }
        case '[categories] query income success' : {
            return {...state, income: action.payload};
        }
        default: {
            return state;
        }
    }
}