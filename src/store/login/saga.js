import { takeLatest, put, call, takeEvery } from 'redux-saga/effects';
import {
    LOGIN_USER_DATA,
    LOGIN_USER_DATA_ERROR,
    LOGIN_USER_DATA_PENDING,
    LOGIN_USER_DATA_SUCCESS
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

export function* watchLoginUser() {
    yield takeEvery(LOGIN_USER_DATA, loginUser);
}