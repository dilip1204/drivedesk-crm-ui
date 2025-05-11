import {
    ADD_STUDENT_DATA,
    ADD_STUDENT_DATA_ERROR,
    ADD_STUDENT_DATA_PENDING,
    ADD_STUDENT_DATA_SUCCESS,
    UPDATE_STUDENT_DATA,
    UPDATE_STUDENT_DATA_ERROR,
    UPDATE_STUDENT_DATA_PENDING,
    UPDATE_STUDENT_DATA_SUCCESS
} from './types';

const initialState = {
    addStudentResponse: [],
    addStudentLoader: false,
    addStudenttError: [],
    editStudentResponse: [],
    editStudentLoader: false,
    editStudenttError: [],
}

export default function StudentReducer(state = initialState, action) {
    switch (action.type) {
        case ADD_STUDENT_DATA_SUCCESS:
            return {
                ...state,
                addStudentResponse: action.data,
                addStudentLoader: false
            }
        case ADD_STUDENT_DATA_PENDING:
            return {
                ...state,
                addStudentLoader: true
            }
        case ADD_STUDENT_DATA_ERROR:
            return {
                ...state,
                addStudenttError: action.error,
                addStudentLoader: false
            }
        case UPDATE_STUDENT_DATA_SUCCESS:
            return {
                ...state,
                editStudentResponse: action.data,
                editStudentLoader: false
            }
        case UPDATE_STUDENT_DATA_PENDING:
            return {
                ...state,
                editStudentLoader: true
            }
        case UPDATE_STUDENT_DATA_ERROR:
            return {
                ...state,
                editStudenttError: action.error,
                editStudentLoader: false
            }
        default:
            return state;
    }
}