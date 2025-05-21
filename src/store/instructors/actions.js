import { 
    ADD_INSTRUCTOR_DATA,
    UPDATE_INSTRUCTOR_DATA,
    GET_INSTRUCTOR_LIST,
    DELETE_INSTRUCTOR_DATA
 } from "./types";

export function addInstructor(param, fn) {
    return {
        type: ADD_INSTRUCTOR_DATA,
        param,
        fn,
    }
}

export function updateInstructor(param, fn) {
    return {
        type: UPDATE_INSTRUCTOR_DATA,
        param,
        fn,
    }
}

export function getInstructorsListInformation(param, fn) { 
    return {
        type: GET_INSTRUCTOR_LIST,
        param,
        fn,
    }
}

export function deleteInstructor(param, fn) {
    return {
        type: DELETE_INSTRUCTOR_DATA,
        param,
        fn,
    }
}