import {
    DELETE_STUDENT_DATA,
    DELETE_STUDENT_DATA_ERROR,
    DELETE_STUDENT_DATA_PENDING,
    DELETE_STUDENT_DATA_SUCCESS
} from './types';

const initialState = {
    deleteStudentResponse: [],
    deleteStudentLoader: false,
    deleteStudenttError: [],
}

export default function DeleteStudentReducer(state = initialState, action) {
    switch (action.type) {
        case DELETE_STUDENT_DATA_SUCCESS:
            return {
                ...state,
                deleteStudentResponse: action.data,
                deleteStudentLoader: false
            }
        case DELETE_STUDENT_DATA_PENDING:
            return {
                ...state,
                deleteStudentLoader: true
            }
        case DELETE_STUDENT_DATA_ERROR:
            return {
                ...state,
                deleteStudenttError: action.error,
                deleteStudentLoader: false
            }
        default:
            return state;
    }
}