import {
   // ADD_STUDENT_PAYMENT_DATA,
    ADD_STUDENT_PAYMENT_DATA_ERROR,
    ADD_STUDENT_PAYMENT_DATA_PENDING,
    ADD_STUDENT_PAYMENT_DATA_SUCCESS,
   
} from './types';

const initialState = {
    addStudentPaymentResponse: [],
    addStudentPaymentLoader: false,
    addStudenttPaymentError: [],
   
}

export default function StudentPaymentReducer(state = initialState, action) {
    switch (action.type) {
        case ADD_STUDENT_PAYMENT_DATA_SUCCESS:
            return {
                ...state,
                addStudentPaymentResponse: action.data,
                addStudentPaymentLoader: false
            }
        case ADD_STUDENT_PAYMENT_DATA_PENDING:
            return {
                ...state,
                addStudentPaymentLoader: true
            }
        case ADD_STUDENT_PAYMENT_DATA_ERROR:
            return {
                ...state,
                addStudenttPaymentError: action.error,
                addStudentPaymentLoader: false
            }
        
        default:
            return state;
    }
}