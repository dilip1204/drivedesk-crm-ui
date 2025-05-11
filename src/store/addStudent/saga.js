import { takeLatest, put, call, takeEvery } from 'redux-saga/effects';
import {
    ADD_STUDENT_DATA,
    ADD_STUDENT_DATA_ERROR,
    ADD_STUDENT_DATA_PENDING,
    ADD_STUDENT_DATA_SUCCESS,
    UPDATE_STUDENT_DATA,
    UPDATE_STUDENT_DATA_ERROR,
    UPDATE_STUDENT_DATA_SUCCESS,
    UPDATE_STUDENT_DATA_PENDING,
} from './types';

import { addStudentList, editStudentList } from '../../services/functional';

function* addStudentData(action){ 
    try {
        yield put({ type: ADD_STUDENT_DATA_PENDING });
        const response = yield call(
            addStudentList.addStudentList,
            action.param,
        );
        yield put({ 
            type: ADD_STUDENT_DATA_SUCCESS,
            data: response.data
        });
        if (typeof action.fn === "function") {
            action.fn(response.data)
        }
    } catch (error) { console.info('error...........', error)
        yield put({ type: ADD_STUDENT_DATA_ERROR, error: error});
        if (typeof action.fn === "function") {
            action.fn(error.response)
        }
    }
}

function* editStudentData(action){ 
    try {
        yield put({ type: UPDATE_STUDENT_DATA_PENDING });
        const response = yield call(
            editStudentList.editStudentList,
            action.param,
        );
        yield put({ 
            type: UPDATE_STUDENT_DATA_SUCCESS,
            data: response.data
        });
        if (typeof action.fn === "function") {
            action.fn(response.data)
        }
    } catch (error) {
        yield put({ type: UPDATE_STUDENT_DATA_ERROR, error: error});
        if (typeof action.fn === "function") {
            action.fn(error.response)
        }
    }
}

export function* watchAddStudent() {
    yield takeEvery(ADD_STUDENT_DATA, addStudentData);
}

export function* watchEditStudent() {
    yield takeEvery(UPDATE_STUDENT_DATA, editStudentData);
}