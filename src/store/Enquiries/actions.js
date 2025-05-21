import { 
    ADD_ENQUIRIES_DATA,
    UPDATE_ENQUIRIES_DATA,
    GET_ENQUIRIES_LIST,
    DELETE_ENQUIRIES_DATA
} from "./types";

export function addEnquiries(param, fn) {
    return {
        type: ADD_ENQUIRIES_DATA,
        param,
        fn,
    };
}

export function updateEnquiries(param, fn) {
    return {
        type: UPDATE_ENQUIRIES_DATA,
        param,
        fn,
    };
}

export function getEnquiriesListInformation(param, fn) { 
    return {
        type: GET_ENQUIRIES_LIST,
        param,
        fn,
    };
}

export function deleteEnquiries(param, fn) {
    return {
        type: DELETE_ENQUIRIES_DATA,
        param,
        fn,
    };
}
