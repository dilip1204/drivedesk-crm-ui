import { put, call, takeEvery } from 'redux-saga/effects';
import {
    ADD_INSTRUCTOR_DATA,
    ADD_INSTRUCTOR_DATA_ERROR,
    ADD_INSTRUCTOR_DATA_PENDING,
    ADD_INSTRUCTOR_DATA_SUCCESS,
    UPDATE_INSTRUCTOR_DATA,
    UPDATE_INSTRUCTOR_DATA_ERROR,
    UPDATE_INSTRUCTOR_DATA_SUCCESS,
    UPDATE_INSTRUCTOR_DATA_PENDING,
    GET_INSTRUCTOR_LIST,
    GET_INSTRUCTOR_LIST_ERROR,
    GET_INSTRUCTOR_LIST_PENDING,
    GET_INSTRUCTOR_LIST_SUCCESS,
    DELETE_INSTRUCTOR_DATA,
    DELETE_INSTRUCTOR_DATA_ERROR,
    DELETE_INSTRUCTOR_DATA_PENDING,
    DELETE_INSTRUCTOR_DATA_SUCCESS
} from './types';

import { addInstructorList, editInstructorList, getAllInstructorsService, deleteInstructorList } from '../../services/functional';

function* addInstructorData(action){ 
    try {
        yield put({ type: ADD_INSTRUCTOR_DATA_PENDING });
        const response = yield call(
            addInstructorList.addInstructorList,
            action.param,
        );
        yield put({ 
            type: ADD_INSTRUCTOR_DATA_SUCCESS,
            data: response.data
        });
        if (typeof action.fn === "function") {
            action.fn(response.data)
        }
    } catch (error) { 
        yield put({ type: ADD_INSTRUCTOR_DATA_ERROR, error: error});
        if (typeof action.fn === "function") {
            action.fn(error.response)
        }
    }
}

function* editInstructorData(action){  
    try {
        yield put({ type: UPDATE_INSTRUCTOR_DATA_PENDING });
        const response = yield call(
            editInstructorList.editInstructorList,
            action.param,
        );
        yield put({ 
            type: UPDATE_INSTRUCTOR_DATA_SUCCESS,
            data: response.data
        });
        if (typeof action.fn === "function") {
            action.fn(response.data)
        }
    } catch (error) {
        yield put({ type: UPDATE_INSTRUCTOR_DATA_ERROR, error: error});
        if (typeof action.fn === "function") {
            action.fn(error.response)
        }
    }
}

function* getAllInstructorsInformation(action){ 
    try {
        yield put({ type: GET_INSTRUCTOR_LIST_PENDING });
        const response = yield call(
            getAllInstructorsService.getAllInstructors,
            action.param,
        );
        yield put({ 
            type: GET_INSTRUCTOR_LIST_SUCCESS,
            data: response.data
        });
        if (typeof action.fn === "function") {
            action.fn(response.data)
        }
    } catch (error) { 
        yield put({ type: GET_INSTRUCTOR_LIST_ERROR, error: error});
        if (typeof action.fn === "function") {
            action.fn(error)
        }
    }
}

function* deleteInstructorData(action){ 
    try {
        yield put({ type: DELETE_INSTRUCTOR_DATA_PENDING });
        const response = yield call(
            deleteInstructorList.deleteInstructorList,
            action.param,
        );
        yield put({ 
            type: DELETE_INSTRUCTOR_DATA_SUCCESS,
            data: response.data
        });
        if (typeof action.fn === "function") {
            action.fn(response.data)
        }
    } catch (error) { 
        yield put({ type: DELETE_INSTRUCTOR_DATA_ERROR, error: error});
        if (typeof action.fn === "function") {
            action.fn(error.response)
        }
    }
}

export function* watchAddInstructor() {
    yield takeEvery(ADD_INSTRUCTOR_DATA, addInstructorData);
}

export function* watchEditInstructor() {
    yield takeEvery(UPDATE_INSTRUCTOR_DATA, editInstructorData);
}

export function* watchInstructorListInformation() {
    yield takeEvery(GET_INSTRUCTOR_LIST, getAllInstructorsInformation);
}

export function* watchDeleteInstructor() {
    yield takeEvery(DELETE_INSTRUCTOR_DATA, deleteInstructorData);
}