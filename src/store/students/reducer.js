import {
  //  GET_STUDENTS_LIST,
    GET_STUDENTS_LIST_ERROR,
    GET_STUDENTS_LIST_PENDING,
    GET_STUDENTS_LIST_SUCCESS,
  //  GET_STUDENTS_FILTER_LIST,
    GET_STUDENTS_FILTER_LIST_ERROR,
    GET_STUDENTS_FILTER_LIST_PENDING,
    GET_STUDENTS_FILTER_LIST_SUCCESS,
  //  GET_STUDENTS_RECEIPT,
    GET_STUDENTS_RECEIPT_ERROR,
    GET_STUDENTS_RECEIPT_PENDING,
    GET_STUDENTS_RECEIPT_SUCCESS
} from './types';

const initialState = {
    studentsList: [],
    studentsListLoader: false,
    studentsListError: [],

    studentsFilterList: [],
    studentsFilterListLoader: false,
    studentsFilterListError: [],

    studentReceipt: [],
    studentReceiptLoader: false,
    studentReceiptError: [],

}

export default function studentsListReducer(state = initialState, action) {
    switch (action.type) {
        case GET_STUDENTS_LIST_SUCCESS:
            return {
                ...state,
                studentsList: action.data,
                studentsListLoader: false
            }
        case GET_STUDENTS_LIST_PENDING:
            return {
                ...state,
                studentsListLoader: true
            }
        case GET_STUDENTS_LIST_ERROR:
            return {
                ...state,
                studentsListError: action.error,
                studentsListLoader: false
            }
        case GET_STUDENTS_FILTER_LIST_SUCCESS:
            return {
                ...state,
                studentsFilterList: action.data,
                studentsFilterListLoader: false
            }
        case GET_STUDENTS_FILTER_LIST_PENDING:
            return {
                ...state,
                studentsFilterListLoader: true
            }
        case GET_STUDENTS_FILTER_LIST_ERROR:
            return {
                ...state,
                studentsFilterListError: action.error,
                studentsFilterListLoader: false
            }
         case GET_STUDENTS_RECEIPT_SUCCESS:
            return {
                ...state,
                studentReceipt: action.data,
                studentReceiptLoader: false
            }
        case GET_STUDENTS_RECEIPT_PENDING:
            return {
                ...state,
                studentReceiptLoader: true
            }
        case GET_STUDENTS_RECEIPT_ERROR:
            return {
                ...state,
                studentReceiptError: action.error,
                studentReceiptLoader: false
            }
        default:
            return state;
    }
}