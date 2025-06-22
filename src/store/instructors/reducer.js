import {
    //ADD_INSTRUCTOR_DATA,
    ADD_INSTRUCTOR_DATA_ERROR,
    ADD_INSTRUCTOR_DATA_PENDING,
    ADD_INSTRUCTOR_DATA_SUCCESS,
   // UPDATE_INSTRUCTOR_DATA,
    UPDATE_INSTRUCTOR_DATA_ERROR,
    UPDATE_INSTRUCTOR_DATA_PENDING,
    UPDATE_INSTRUCTOR_DATA_SUCCESS,
   // GET_INSTRUCTOR_LIST,
    GET_INSTRUCTOR_LIST_ERROR,
    GET_INSTRUCTOR_LIST_PENDING,
    GET_INSTRUCTOR_LIST_SUCCESS,
   // DELETE_INSTRUCTOR_DATA,
    DELETE_INSTRUCTOR_DATA_ERROR,
    DELETE_INSTRUCTOR_DATA_PENDING,
    DELETE_INSTRUCTOR_DATA_SUCCESS
} from './types';

const initialState = {
    addInstructorResponse: [],
    addInstructorLoader: false,
    addInstructortError: [],
    editInstructorResponse: [],
    editInstructorLoader: false,
    editInstructortError: [],
    instructorsList: [],
    instructorsListLoader: false,
    instructorsListError: [],
    deleteInstructorResponse: [],
    deleteInstructorLoader: false,
    deleteInstructorError: [],
}

export default function InstructorReducer(state = initialState, action) {
    switch (action.type) {
        case ADD_INSTRUCTOR_DATA_SUCCESS:
            return {
                ...state,
                addInstructorResponse: action.data,
                addInstructorLoader: false
            }
        case ADD_INSTRUCTOR_DATA_PENDING:
            return {
                ...state,
                addInstructorLoader: true
            }
        case ADD_INSTRUCTOR_DATA_ERROR:
            return {
                ...state,
                addInstructorError: action.error,
                addInstructorLoader: false
            }
        case UPDATE_INSTRUCTOR_DATA_SUCCESS:
            return {
                ...state,
                editInstructorResponse: action.data,
                editInstructorLoader: false
            }
        case UPDATE_INSTRUCTOR_DATA_PENDING:
            return {
                ...state,
                editInstructorLoader: true
            }
        case UPDATE_INSTRUCTOR_DATA_ERROR:
            return {
                ...state,
                editInstructorError: action.error,
                editInstructorLoader: false
            }
        case GET_INSTRUCTOR_LIST_SUCCESS:
            return {
                ...state,
                instructorsList: action.data,
                instructorsListLoader: false
            }
        case GET_INSTRUCTOR_LIST_PENDING:
            return {
                ...state,
                instructorListLoader: true
            }
        case GET_INSTRUCTOR_LIST_ERROR:
            return {
                ...state,
                instructorsListError: action.error,
                instructorsListLoader: false
            }
        case DELETE_INSTRUCTOR_DATA_SUCCESS:
            return {
                ...state,
                deleteInstructorResponse: action.data,
                deleteInstructorLoader: false
            }
        case DELETE_INSTRUCTOR_DATA_PENDING:
            return {
                ...state,
                deleteInstructorLoader: true
            }
        case DELETE_INSTRUCTOR_DATA_ERROR:
            return {
                ...state,
                deleteInstructorError: action.error,
                deleteInstructorLoader: false
            }
        default:
            return state;
    }
}