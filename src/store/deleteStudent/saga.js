import { takeLatest, put, call, takeEvery } from 'redux-saga/effects';
import {
    DELETE_STUDENT_DATA,
    DELETE_STUDENT_DATA_ERROR,
    DELETE_STUDENT_DATA_PENDING,
    DELETE_STUDENT_DATA_SUCCESS
} from './types';

import { deleteStudentList } from '../../services/functional';

function* deleteStudentData(action){ 
    try {
        yield put({ type: DELETE_STUDENT_DATA_PENDING });
        const response = yield call(
            deleteStudentList.deleteStudentList,
            action.param,
        );
        yield put({ 
            type: DELETE_STUDENT_DATA_SUCCESS,
            data: response.data
        });
        if (typeof action.fn === "function") {
            action.fn(response.data)
        }
    } catch (error) { console.info('error...........', error)
        yield put({ type: DELETE_STUDENT_DATA_ERROR, error: error});
        if (typeof action.fn === "function") {
            action.fn(error.response)
        }
    }
}

export function* watchDeleteStudent() {
    yield takeEvery(DELETE_STUDENT_DATA, deleteStudentData);
}