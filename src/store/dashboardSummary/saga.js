import { put, call, takeEvery } from 'redux-saga/effects';
import {
    GET_DASHBOARD_SUMMARY,
    GET_DASHBOARD_SUMMARY_ERROR,
    GET_DASHBOARD_SUMMARY_PENDING,
    GET_DASHBOARD_SUMMARY_SUCCESS,
    GET_OUTSTANDING_FEES,
    GET_OUTSTANDING_FEES_ERROR,
    GET_OUTSTANDING_FEES_PENDING,
    GET_OUTSTANDING_FEES_SUCCESS
} from './types';

import { getDashboardSummaryService } from '../../services/functional';

function* getDashboardSummary(action){ 
    try {
        yield put({ type: GET_DASHBOARD_SUMMARY_PENDING });
        const response = yield call(
            getDashboardSummaryService.getDashboardSummary,
            action.param,
        );
        yield put({ 
            type: GET_DASHBOARD_SUMMARY_SUCCESS,
            data: response.data
        });
        if (typeof action.fn === "function") {
            action.fn(response.data)
        }
    } catch (error) { 
        yield put({ type: GET_DASHBOARD_SUMMARY_ERROR, error: error});
        if (typeof action.fn === "function") {
            action.fn(error)
        }
    }
}

function* getOutstandingFees(action){
    try {
        yield put({ type: GET_OUTSTANDING_FEES_PENDING });
        const response = yield call(
            getDashboardSummaryService.getOutstandingFees,
        );
        yield put({ 
            type: GET_OUTSTANDING_FEES_SUCCESS,
            data: response.data
        });
        if (typeof action.fn === "function") {
            action.fn(response.data)
        }
    } catch (error) { 
        yield put({ type: GET_OUTSTANDING_FEES_ERROR, error: error});
        if (typeof action.fn === "function") {
            action.fn(error)
        }
    }
}

export function* watchOutstandingFees() {
    yield takeEvery(GET_OUTSTANDING_FEES, getOutstandingFees);
}


export function* watchDashboardSummary() {
    yield takeEvery(GET_DASHBOARD_SUMMARY, getDashboardSummary);
}