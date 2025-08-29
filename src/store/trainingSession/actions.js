import { GET_STUDENTS_FILTER_LIST } from "../students/types";
import { 
    GET_TRAINING_SESSION_LIST,
    GET_TRAINING_SESSION_FILTER_LIST,
    UPDATE_TRAINING_SESSION_DATA,
    RESCHDULE_TRAINING_SESSION_DATA,
    GET_STUDENT_SESSION_COMPLETED_LIST
 } from "./types";

export function getTrainingSessionListInformation(param, fn) { 
    return {
        type: GET_TRAINING_SESSION_LIST,
        param,
        fn,
    }
}

export function getTrainingSessionFilterListInformation(param, fn) { 
    return {
        type: GET_TRAINING_SESSION_FILTER_LIST,
        param,
        fn,
    }
}

export function updateTrainingSession(param, fn) {
    return {
        type: UPDATE_TRAINING_SESSION_DATA,
        param,
        fn,
    }
}

export function RescheduleTrainingSession(param, fn) {
    return {
        type: RESCHDULE_TRAINING_SESSION_DATA,
        param,
        fn,
    }
}

export function getStudentCompletedList(param, fn) {
    return {
        type: GET_STUDENT_SESSION_COMPLETED_LIST,
        param,
        fn,
    }
}