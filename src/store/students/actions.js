import { 
    GET_STUDENTS_LIST
 } from "./types";

export function getStudentsListInformation(param, fn) { 
    return {
        type: GET_STUDENTS_LIST,
        param,
        fn,
    }
}
