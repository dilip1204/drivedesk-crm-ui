import { put, call, takeEvery } from 'redux-saga/effects';
import {
    ADD_TARIFF_DATA,
    ADD_TARIFF_DATA_ERROR,
    ADD_TARIFF_DATA_PENDING,
    ADD_TARIFF_DATA_SUCCESS,
    UPDATE_TARIFF_DATA,
    UPDATE_TARIFF_DATA_ERROR,
    UPDATE_TARIFF_DATA_SUCCESS,
    UPDATE_TARIFF_DATA_PENDING,
    GET_TARIFF_LIST,
    GET_TARIFF_LIST_ERROR,
    GET_TARIFF_LIST_PENDING,
    GET_TARIFF_LIST_SUCCESS,
    DELETE_TARIFF_DATA,
    DELETE_TARIFF_DATA_ERROR,
    DELETE_TARIFF_DATA_PENDING,
    DELETE_TARIFF_DATA_SUCCESS
} from './types';

import { addTariffList, editTariffList, getAllTariffsService, deleteTariffList } from '../../services/functional';

function* addTariffData(action){ 
    try {
        yield put({ type: ADD_TARIFF_DATA_PENDING });
        const response = yield call(
            addTariffList.addTariffList,
            action.param,
        );
        yield put({ 
            type: ADD_TARIFF_DATA_SUCCESS,
            data: response.data
        });
        if (typeof action.fn === "function") {
            action.fn(response.data)
        }
    } catch (error) { 
        yield put({ type: ADD_TARIFF_DATA_ERROR, error: error});
        if (typeof action.fn === "function") {
            action.fn(error.response)
        }
    }
}

function* editTariffData(action){ 
    try {
        yield put({ type: UPDATE_TARIFF_DATA_PENDING });
        const response = yield call(
            editTariffList.editTariffList,
            action.param,
        );
        yield put({ 
            type: UPDATE_TARIFF_DATA_SUCCESS,
            data: response.data
        });
        if (typeof action.fn === "function") {
            action.fn(response.data)
        }
    } catch (error) {
        yield put({ type: UPDATE_TARIFF_DATA_ERROR, error: error});
        if (typeof action.fn === "function") {
            action.fn(error.response)
        }
    }
}

function* getAllTariffsInformation(action){ 
    try {
        yield put({ type: GET_TARIFF_LIST_PENDING });
        const response = yield call(
            getAllTariffsService.getAllTariffs,
            action.param,
        );
        yield put({ 
            type: GET_TARIFF_LIST_SUCCESS,
            data: response.data
        });
        if (typeof action.fn === "function") {
            action.fn(response.data)
        }
    } catch (error) { 
        yield put({ type: GET_TARIFF_LIST_ERROR, error: error});
        if (typeof action.fn === "function") {
            action.fn(error)
        }
    }
}

function* deleteTariffData(action){ 
    try {
        yield put({ type: DELETE_TARIFF_DATA_PENDING });
        const response = yield call(
            deleteTariffList.deleteTariffList,
            action.param,
        );
        yield put({ 
            type: DELETE_TARIFF_DATA_SUCCESS,
            data: response.data
        });
        if (typeof action.fn === "function") {
            action.fn(response.data)
        }
    } catch (error) { 
        yield put({ type: DELETE_TARIFF_DATA_ERROR, error: error});
        if (typeof action.fn === "function") {
            action.fn(error.response)
        }
    }
}

export function* watchAddTariff() {
    yield takeEvery(ADD_TARIFF_DATA, addTariffData);
}

export function* watchEditTariff() {
    yield takeEvery(UPDATE_TARIFF_DATA, editTariffData);
}

export function* watchTariffListInformation() {
    yield takeEvery(GET_TARIFF_LIST, getAllTariffsInformation);
}

export function* watchDeleteTariff() {
    yield takeEvery(DELETE_TARIFF_DATA, deleteTariffData);
}