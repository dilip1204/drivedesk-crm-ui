import { put, call, takeEvery } from 'redux-saga/effects';
import {
    LOGIN_USER_DATA,
    LOGIN_USER_DATA_ERROR,
    LOGIN_USER_DATA_PENDING,
    LOGIN_USER_DATA_SUCCESS,
    REQUEST_LOGIN_OTP,
    REQUEST_LOGIN_OTP_ERROR,
    REQUEST_LOGIN_OTP_PENDING,
    REQUEST_LOGIN_OTP_SUCCESS,
    VERIFY_LOGIN_OTP,
    VERIFY_LOGIN_OTP_ERROR,
    VERIFY_LOGIN_OTP_PENDING,
    VERIFY_LOGIN_OTP_SUCCESS,
} from './types';

import { userLogin } from '../../services/functional';

function* loginUser({ param, fn }){
    try {
        yield put({ type: LOGIN_USER_DATA_PENDING });
        const response = yield call(
            userLogin.userLogin,
            param,
        );
        yield put({ 
            type: LOGIN_USER_DATA_SUCCESS,
            data: response.data
        });
        fn(response.data);
    } catch (error) {
        yield put({ type: LOGIN_USER_DATA_ERROR, error: error});
        fn(error);
    }
}

function* requestOtp({ param, fn }) {
    try {
        yield put({ type: REQUEST_LOGIN_OTP_PENDING });
        const response = yield call(userLogin.requestLoginOtp, param);
        yield put({ type: REQUEST_LOGIN_OTP_SUCCESS, data: response.data });
        if (typeof fn === 'function') fn(response.data);
    } catch (error) {
        yield put({ type: REQUEST_LOGIN_OTP_ERROR, error: error?.response || error });
        if (typeof fn === 'function') fn(null, error);
    }
}

function* verifyOtp({ param, fn }) {
    try {
        yield put({ type: VERIFY_LOGIN_OTP_PENDING });
        const response = yield call(
            userLogin.verifyLoginOtp,
            param.mobileNumber,
            param.otp,
        );
        yield put({ type: VERIFY_LOGIN_OTP_SUCCESS, data: response.data });
        if (typeof fn === 'function') fn(response.data);
    } catch (error) {
        yield put({ type: VERIFY_LOGIN_OTP_ERROR, error: error?.response || error });
        if (typeof fn === 'function') fn(null, error);
    }
}

export function* watchLoginUser() {
    yield takeEvery(LOGIN_USER_DATA, loginUser);
}

export function* watchRequestLoginOtp() {
    yield takeEvery(REQUEST_LOGIN_OTP, requestOtp);
}

export function* watchVerifyLoginOtp() {
    yield takeEvery(VERIFY_LOGIN_OTP, verifyOtp);
}

