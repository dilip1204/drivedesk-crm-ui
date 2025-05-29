import { 
    GET_STUDENTS_LIST,
    GET_STUDENTS_FILTER_LIST
 } from "./types";

export function getStudentsListInformation(param, fn) { 
    return {
        type: GET_STUDENTS_LIST,
        param,
        fn,
    }
}

export function getStudentsFilterListInformation(param, fn) { 
    return {
        type: GET_STUDENTS_FILTER_LIST,
        param,
        fn,
    }
}
