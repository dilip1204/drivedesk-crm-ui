import { put, call, takeEvery } from 'redux-saga/effects';
import {
    GET_STUDENTS_LIST,
    GET_STUDENTS_LIST_ERROR,
    GET_STUDENTS_LIST_PENDING,
    GET_STUDENTS_LIST_SUCCESS,
    GET_STUDENTS_FILTER_LIST,
    GET_STUDENTS_FILTER_LIST_ERROR,
    GET_STUDENTS_FILTER_LIST_PENDING,
    GET_STUDENTS_FILTER_LIST_SUCCESS,
    GET_STUDENTS_RECEIPT,
    GET_STUDENTS_RECEIPT_ERROR,
    GET_STUDENTS_RECEIPT_PENDING,
    GET_STUDENTS_RECEIPT_SUCCESS
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
    } catch (error) { 
        yield put({ type: GET_STUDENTS_LIST_ERROR, error: error});
        if (typeof action.fn === "function") {
            action.fn(error)
        }
    }
}

function* getAllStudentsFilterInformation(action){ 
    try {
        yield put({ type: GET_STUDENTS_FILTER_LIST_PENDING });
        const response = yield call(
            getAllStudentsService.getAllStudentsFilter,
            action.param,
        );
        yield put({ 
            type: GET_STUDENTS_FILTER_LIST_SUCCESS,
            data: response.data
        });
        if (typeof action.fn === "function") {
            action.fn(response.data)
        }
    } catch (error) { 
        yield put({ type: GET_STUDENTS_FILTER_LIST_ERROR, error: error});
        if (typeof action.fn === "function") {
            action.fn(error)
        }
    }
}

function* getStudentReceiptInformation(action){ 
    try {
        yield put({ type: GET_STUDENTS_RECEIPT_PENDING });
        const response = yield call(
            getAllStudentsService.getStudentReceipt,
            action.param,
        );
        yield put({ 
            type: GET_STUDENTS_RECEIPT_SUCCESS,
            data: response.data
        });
        if (typeof action.fn === "function") {
            action.fn(response.data)
        }
    } catch (error) { 
        yield put({ type: GET_STUDENTS_RECEIPT_ERROR, error: error});
        if (typeof action.fn === "function") {
            action.fn(error)
        }
    }
}

export function* watchStudentListInformation() {
    yield takeEvery(GET_STUDENTS_LIST, getAllStudentsInformation);
}

export function* watchStudentFilterListInformation() {
    yield takeEvery(GET_STUDENTS_FILTER_LIST, getAllStudentsFilterInformation);
}

export function* watchStudentReceiptInformation() {
    yield takeEvery(GET_STUDENTS_RECEIPT, getStudentReceiptInformation);
}