import { 
    ADD_STUDENT_PAYMENT_DATA,
 } from "./types";

export function addStudentPayment(param, fn) {
    return {
        type: ADD_STUDENT_PAYMENT_DATA,
        param,
        fn,
    }
}