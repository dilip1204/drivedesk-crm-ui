import { takeLatest, put, call, takeEvery } from 'redux-saga/effects';
import {
    ADD_STUDENT_PAYMENT_DATA,
    ADD_STUDENT_PAYMENT_DATA_ERROR,
    ADD_STUDENT_PAYMENT_DATA_PENDING,
    ADD_STUDENT_PAYMENT_DATA_SUCCESS,
  
} from './types';

import { addStudentPaymentList } from '../../services/functional';

function* addStudentPaymentData(action){ 
    try {
        yield put({ type: ADD_STUDENT_PAYMENT_DATA_PENDING });
        const response = yield call(
            addStudentPaymentList.addStudentPaymentList,
            action.param,
        );
        yield put({ 
            type: ADD_STUDENT_PAYMENT_DATA_SUCCESS,
            data: response.data
        });
        if (typeof action.fn === "function") {
            action.fn(response.data)
        }
    } catch (error) {
        yield put({ type: ADD_STUDENT_PAYMENT_DATA_ERROR, error: error});
        if (typeof action.fn === "function") {
            action.fn(error.response)
        }
    }
}


export function* watchAddStudentPayment() {
    yield takeEvery(ADD_STUDENT_PAYMENT_DATA, addStudentPaymentData);
}

