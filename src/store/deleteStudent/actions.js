import { 
    DELETE_STUDENT_DATA,
 } from "./types";

export function deleteStudent(param, fn) {
    return {
        type: DELETE_STUDENT_DATA,
        param,
        fn,
    }
}