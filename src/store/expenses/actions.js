import { 
    ADD_EXPENSES_DATA,
    UPDATE_EXPENSES_DATA,
    DELETE_EXPENSES_DATA,
     GET_EXPENSES_LIST,
    
 } from "./types";

export function addExpenses(param, fn) {
    return {
        type: ADD_EXPENSES_DATA,
        param,
        fn,
    }
}

export function updateExpenses(param, fn) {
    return {
        type: UPDATE_EXPENSES_DATA,
        param,
        fn,
    }
}

export function deleteExpenses(param, fn) {
    return {
        type: DELETE_EXPENSES_DATA,
        param,
        fn,
    }
}

export function getExpensesListInformation(param, fn) { 
    return {
        type: GET_EXPENSES_LIST,
        param,
        fn,
    }
}