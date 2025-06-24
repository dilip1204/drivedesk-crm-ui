import { 
    GET_STUDENTS_LIST,
    GET_STUDENTS_FILTER_LIST,
    GET_STUDENTS_RECEIPT
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

export function getStudentReceiptInfo(param, fn) { console.info('Hi..........', param)
    return {
        type: GET_STUDENTS_RECEIPT,
        param,
        fn,
    }
}
