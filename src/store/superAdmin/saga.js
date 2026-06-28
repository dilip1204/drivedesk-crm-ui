import { put, call, takeEvery } from 'redux-saga/effects';
import {
    ADD_SUPER_ADMIN, ADD_SUPER_ADMIN_PENDING, ADD_SUPER_ADMIN_SUCCESS, ADD_SUPER_ADMIN_ERROR,
    UPDATE_SUPER_ADMIN, UPDATE_SUPER_ADMIN_PENDING, UPDATE_SUPER_ADMIN_SUCCESS, UPDATE_SUPER_ADMIN_ERROR,
    GET_SUPER_ADMIN_LIST, GET_SUPER_ADMIN_LIST_PENDING, GET_SUPER_ADMIN_LIST_SUCCESS, GET_SUPER_ADMIN_LIST_ERROR,
} from './types';
import { superAdminService } from '../../services/functional';

function* addSuperAdminSaga(action) {
    try {
        yield put({ type: ADD_SUPER_ADMIN_PENDING });
        const response = yield call(superAdminService.addSuperAdmin, action.param);
        yield put({ type: ADD_SUPER_ADMIN_SUCCESS, data: response.data });
        if (typeof action.fn === 'function') action.fn(response.data);
    } catch (error) {
        yield put({ type: ADD_SUPER_ADMIN_ERROR, error: error?.response || error });
        if (typeof action.fn === 'function') action.fn(error?.response);
    }
}

function* updateSuperAdminSaga(action) {
    try {
        yield put({ type: UPDATE_SUPER_ADMIN_PENDING });
        const response = yield call(superAdminService.updateSuperAdmin, action.param);
        yield put({ type: UPDATE_SUPER_ADMIN_SUCCESS, data: response.data });
        if (typeof action.fn === 'function') action.fn(response.data);
    } catch (error) {
        yield put({ type: UPDATE_SUPER_ADMIN_ERROR, error: error?.response || error });
        if (typeof action.fn === 'function') action.fn(error?.response);
    }
}

function* getSuperAdminListSaga(action) {
    try {
        yield put({ type: GET_SUPER_ADMIN_LIST_PENDING });
        const response = yield call(superAdminService.getSuperAdminList, action.param);
        yield put({ type: GET_SUPER_ADMIN_LIST_SUCCESS, data: response.data });
        if (typeof action.fn === 'function') action.fn(response.data);
    } catch (error) {
        yield put({ type: GET_SUPER_ADMIN_LIST_ERROR, error: error?.response || error });
        if (typeof action.fn === 'function') action.fn(error?.response);
    }
}

export function* watchAddSuperAdmin() {
    yield takeEvery(ADD_SUPER_ADMIN, addSuperAdminSaga);
}
export function* watchUpdateSuperAdmin() {
    yield takeEvery(UPDATE_SUPER_ADMIN, updateSuperAdminSaga);
}
export function* watchGetSuperAdminList() {
    yield takeEvery(GET_SUPER_ADMIN_LIST, getSuperAdminListSaga);
}
