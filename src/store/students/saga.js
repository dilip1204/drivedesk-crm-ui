import { takeLatest, put, call, takeEvery } from 'redux-saga/effects';
import {
    GET_STUDENTS_LIST,
    GET_STUDENTS_LIST_ERROR,
    GET_STUDENTS_LIST_PENDING,
    GET_STUDENTS_LIST_SUCCESS
} from './types';

import { getAllStudentsService } from '../../services/functional';

function* getAllStudentsInformation(action){ 
    try {
        yield put({ type: GET_STUDENTS_LIST_PENDING });
        const response = yield call(
            getAllStudentsService.getAllStudents,
            action.param,
        );
        yield put({ 
            type: GET_STUDENTS_LIST_SUCCESS,
            data: response.data
        });
        if (typeof action.fn === "function") {
            action.fn(response.data)
        }
    } catch (error) { console.info('Hi...xx.xxx', error);
        yield put({ type: GET_STUDENTS_LIST_ERROR, error: error});
        if (typeof action.fn === "function") {
            action.fn(error)
        }
    }
}

export function* watchStudentListInformation() {
    yield takeEvery(GET_STUDENTS_LIST, getAllStudentsInformation);
}