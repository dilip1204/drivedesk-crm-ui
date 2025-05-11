import { 
    ADD_STUDENT_DATA,
    UPDATE_STUDENT_DATA
 } from "./types";

export function addStudent(param, fn) {
    return {
        type: ADD_STUDENT_DATA,
        param,
        fn,
    }
}

export function updateStudent(param, fn) {
    return {
        type: UPDATE_STUDENT_DATA,
        param,
        fn,
    }
}