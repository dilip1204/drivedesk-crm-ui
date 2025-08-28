import { put, call, takeEvery } from 'redux-saga/effects';
import {
    GET_TRAINING_SESSION_LIST,
    GET_TRAINING_SESSION_LIST_ERROR,
    GET_TRAINING_SESSION_LIST_PENDING,
    GET_TRAINING_SESSION_LIST_SUCCESS,
    GET_TRAINING_SESSION_FILTER_LIST,
    GET_TRAINING_SESSION_FILTER_LIST_ERROR,
    GET_TRAINING_SESSION_FILTER_LIST_PENDING,
    GET_TRAINING_SESSION_FILTER_LIST_SUCCESS,
    UPDATE_TRAINING_SESSION_DATA,
    UPDATE_TRAINING_SESSION_DATA_ERROR,
    UPDATE_TRAINING_SESSION_DATA_PENDING,
    UPDATE_TRAINING_SESSION_DATA_SUCCESS,
    RESCHDULE_TRAINING_SESSION_DATA,
    RESCHDULE_TRAINING_SESSION_DATA_ERROR,
    RESCHDULE_TRAINING_SESSION_DATA_PENDING,
    RESCHDULE_TRAINING_SESSION_DATA_SUCCESS
    
} from './types';

import { getAllTrainingsessionService, editTrainingSession, rescheduleTrainingsession } from '../../services/functional';

function* getAllTrainingSessionInformation(action){ 
    try {
        yield put({ type: GET_TRAINING_SESSION_LIST_PENDING });
        const response = yield call(
            getAllTrainingsessionService.getAllTrainingsession,
            action.param,
        );
        yield put({ 
            type: GET_TRAINING_SESSION_LIST_SUCCESS,
            data: response.data
        });
        if (typeof action.fn === "function") {
            action.fn(response.data)
        }
    } catch (error) { 
        yield put({ type: GET_TRAINING_SESSION_LIST_ERROR, error: error});
        if (typeof action.fn === "function") {
            action.fn(error)
        }
    }
}

function* getAllTrainingSessionFilterInformation(action){  
    try {
        yield put({ type: GET_TRAINING_SESSION_FILTER_LIST_PENDING });
        const response = yield call(
            getAllTrainingsessionService.getAllTrainingsessionFilter,
            action.param,
        );
        yield put({ 
            type: GET_TRAINING_SESSION_FILTER_LIST_SUCCESS,
            data: response.data
        });
        if (typeof action.fn === "function") {
            action.fn(response.data)
        }
    } catch (error) { 
        yield put({ type: GET_TRAINING_SESSION_FILTER_LIST_ERROR, error: error});
        if (typeof action.fn === "function") {
            action.fn(error)
        }
    }
}

function* editTrainingSessionData(action){ 
    try {
        yield put({ type: UPDATE_TRAINING_SESSION_DATA_PENDING });
        const response = yield call(
            editTrainingSession.editTrainingSessionList,
            action.param,
        );
        yield put({ 
            type: UPDATE_TRAINING_SESSION_DATA_SUCCESS,
            data: response.data
        });
        if (typeof action.fn === "function") {
            action.fn(response.data)
        }
    } catch (error) {
        yield put({ type: UPDATE_TRAINING_SESSION_DATA_ERROR, error: error});
        if (typeof action.fn === "function") {
            action.fn(error.response)
        }
    }
}

function* rescheduleTrainingSessionData(action){ 
    try {
        yield put({ type: RESCHDULE_TRAINING_SESSION_DATA_PENDING });
        const response = yield call(
            rescheduleTrainingsession.rescheduleTrainingSessionList,
            action.param,
        );
        yield put({ 
            type: RESCHDULE_TRAINING_SESSION_DATA_SUCCESS,
            data: response.data
        });
        if (typeof action.fn === "function") {
            action.fn(response.data)
        }
    } catch (error) {
        yield put({ type: RESCHDULE_TRAINING_SESSION_DATA_ERROR, error: error});
        if (typeof action.fn === "function") {
            action.fn(error.response)
        }
    }
}


export function* watchTrainingSessionListInformation() {
    yield takeEvery(GET_TRAINING_SESSION_LIST, getAllTrainingSessionInformation);
}

export function* watchTrainingSessionFilterListInformation() {
    yield takeEvery(GET_TRAINING_SESSION_FILTER_LIST, getAllTrainingSessionFilterInformation);
}

export function* watchEditTrainingSession() {
    yield takeEvery(UPDATE_TRAINING_SESSION_DATA, editTrainingSessionData);
}

export function* watchReschduleTrainingSession() {
    yield takeEvery(RESCHDULE_TRAINING_SESSION_DATA, rescheduleTrainingSessionData);
}