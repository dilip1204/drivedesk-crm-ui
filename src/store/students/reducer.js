import {
    GET_STUDENTS_LIST,
    GET_STUDENTS_LIST_ERROR,
    GET_STUDENTS_LIST_PENDING,
    GET_STUDENTS_LIST_SUCCESS,
} from './types';

const initialState = {
    studentsList: [],
    studentsListLoader: false,
    studentsListError: [],
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
        default:
            return state;
    }
}