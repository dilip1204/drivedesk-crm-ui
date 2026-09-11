import { call, put, takeEvery } from 'redux-saga/effects';
import { financeDashboardService } from '../../services/functional';
import {
  CREATE_FINANCE_TRANSACTION,
  CREATE_FINANCE_TRANSACTION_ERROR,
  CREATE_FINANCE_TRANSACTION_PENDING,
  CREATE_FINANCE_TRANSACTION_SUCCESS,
  DELETE_FINANCE_TRANSACTION,
  DELETE_FINANCE_TRANSACTION_ERROR,
  DELETE_FINANCE_TRANSACTION_PENDING,
  DELETE_FINANCE_TRANSACTION_SUCCESS,
  GET_FINANCE_DASHBOARD,
  GET_FINANCE_DASHBOARD_ERROR,
  GET_FINANCE_DASHBOARD_PENDING,
  GET_FINANCE_DASHBOARD_SUCCESS,
  GET_FINANCE_MONTHLY_REPORT,
  GET_FINANCE_MONTHLY_REPORT_ERROR,
  GET_FINANCE_MONTHLY_REPORT_PENDING,
  GET_FINANCE_MONTHLY_REPORT_SUCCESS,
  GET_FINANCE_YEARLY_REPORT,
  GET_FINANCE_YEARLY_REPORT_ERROR,
  GET_FINANCE_YEARLY_REPORT_PENDING,
  GET_FINANCE_YEARLY_REPORT_SUCCESS,
  GET_FINANCE_TRANSACTION,
  GET_FINANCE_TRANSACTION_ERROR,
  GET_FINANCE_TRANSACTION_PENDING,
  GET_FINANCE_TRANSACTION_SUCCESS,
  GET_FINANCE_TRANSACTIONS,
  GET_FINANCE_TRANSACTIONS_ERROR,
  GET_FINANCE_TRANSACTIONS_PENDING,
  GET_FINANCE_TRANSACTIONS_SUCCESS,
  UPDATE_FINANCE_TRANSACTION,
  UPDATE_FINANCE_TRANSACTION_ERROR,
  UPDATE_FINANCE_TRANSACTION_PENDING,
  UPDATE_FINANCE_TRANSACTION_SUCCESS,
} from './types';

function* loadFinanceDashboard({ param, fn }) {
  try {
    yield put({ type: GET_FINANCE_DASHBOARD_PENDING });
    const response = yield call(financeDashboardService.getFinanceDashboard, param);
    yield put({ type: GET_FINANCE_DASHBOARD_SUCCESS, data: response.data });
    if (typeof fn === 'function') fn(response.data);
  } catch (error) {
    yield put({
      type: GET_FINANCE_DASHBOARD_ERROR,
      error: error?.response || error,
    });
    if (typeof fn === 'function') fn(null, error);
  }
}

export function* watchFinanceDashboard() {
  yield takeEvery(GET_FINANCE_DASHBOARD, loadFinanceDashboard);
}

function* loadFinanceTransactions({ param, fn }) {
  try {
    yield put({ type: GET_FINANCE_TRANSACTIONS_PENDING });
    const response = yield call(financeDashboardService.getFinanceTransactions, param);
    yield put({ type: GET_FINANCE_TRANSACTIONS_SUCCESS, data: response.data });
    if (typeof fn === 'function') fn(response.data);
  } catch (error) {
    yield put({
      type: GET_FINANCE_TRANSACTIONS_ERROR,
      error: error?.response || error,
    });
    if (typeof fn === 'function') fn(null, error);
  }
}

export function* watchFinanceTransactions() {
  yield takeEvery(GET_FINANCE_TRANSACTIONS, loadFinanceTransactions);
}

function* createFinanceTransaction({ param, fn }) {
  try {
    yield put({ type: CREATE_FINANCE_TRANSACTION_PENDING });
    const response = yield call(financeDashboardService.createFinanceTransaction, param);
    yield put({ type: CREATE_FINANCE_TRANSACTION_SUCCESS, data: response.data });
    if (typeof fn === 'function') fn(response.data);
  } catch (error) {
    yield put({
      type: CREATE_FINANCE_TRANSACTION_ERROR,
      error: error?.response || error,
    });
    if (typeof fn === 'function') fn(null, error);
  }
}

export function* watchCreateFinanceTransaction() {
  yield takeEvery(CREATE_FINANCE_TRANSACTION, createFinanceTransaction);
}

function* loadFinanceTransaction({ param, fn }) {
  try {
    yield put({ type: GET_FINANCE_TRANSACTION_PENDING });
    const response = yield call(financeDashboardService.getFinanceTransaction, param);
    yield put({ type: GET_FINANCE_TRANSACTION_SUCCESS, data: response.data });
    if (typeof fn === 'function') fn(response.data);
  } catch (error) {
    yield put({
      type: GET_FINANCE_TRANSACTION_ERROR,
      error: error?.response || error,
    });
    if (typeof fn === 'function') fn(null, error);
  }
}

export function* watchFinanceTransaction() {
  yield takeEvery(GET_FINANCE_TRANSACTION, loadFinanceTransaction);
}

function* updateFinanceTransaction({ param, fn }) {
  try {
    yield put({ type: UPDATE_FINANCE_TRANSACTION_PENDING });
    const response = yield call(
      financeDashboardService.updateFinanceTransaction,
      param?.transactionId,
      param?.payload
    );
    yield put({ type: UPDATE_FINANCE_TRANSACTION_SUCCESS, data: response.data });
    if (typeof fn === 'function') fn(response.data);
  } catch (error) {
    yield put({
      type: UPDATE_FINANCE_TRANSACTION_ERROR,
      error: error?.response || error,
    });
    if (typeof fn === 'function') fn(null, error);
  }
}

export function* watchUpdateFinanceTransaction() {
  yield takeEvery(UPDATE_FINANCE_TRANSACTION, updateFinanceTransaction);
}

function* deleteFinanceTransaction({ param, fn }) {
  try {
    yield put({ type: DELETE_FINANCE_TRANSACTION_PENDING });
    const response = yield call(financeDashboardService.deleteFinanceTransaction, param);
    yield put({ type: DELETE_FINANCE_TRANSACTION_SUCCESS, data: response.data });
    if (typeof fn === 'function') fn(response.data);
  } catch (error) {
    yield put({
      type: DELETE_FINANCE_TRANSACTION_ERROR,
      error: error?.response || error,
    });
    if (typeof fn === 'function') fn(null, error);
  }
}

export function* watchDeleteFinanceTransaction() {
  yield takeEvery(DELETE_FINANCE_TRANSACTION, deleteFinanceTransaction);
}

function* loadFinanceMonthlyReport({ param, fn }) {
  try {
    yield put({ type: GET_FINANCE_MONTHLY_REPORT_PENDING });
    const response = yield call(financeDashboardService.getFinanceMonthlyReport, param);
    yield put({ type: GET_FINANCE_MONTHLY_REPORT_SUCCESS, data: response.data });
    if (typeof fn === 'function') fn(response.data);
  } catch (error) {
    yield put({
      type: GET_FINANCE_MONTHLY_REPORT_ERROR,
      error: error?.response || error,
    });
    if (typeof fn === 'function') fn(null, error);
  }
}

export function* watchFinanceMonthlyReport() {
  yield takeEvery(GET_FINANCE_MONTHLY_REPORT, loadFinanceMonthlyReport);
}

function* loadFinanceYearlyReport({ param, fn }) {
  try {
    yield put({ type: GET_FINANCE_YEARLY_REPORT_PENDING });
    const response = yield call(financeDashboardService.getFinanceYearlyReport, param);
    yield put({ type: GET_FINANCE_YEARLY_REPORT_SUCCESS, data: response.data });
    if (typeof fn === 'function') fn(response.data);
  } catch (error) {
    yield put({
      type: GET_FINANCE_YEARLY_REPORT_ERROR,
      error: error?.response || error,
    });
    if (typeof fn === 'function') fn(null, error);
  }
}

export function* watchFinanceYearlyReport() {
  yield takeEvery(GET_FINANCE_YEARLY_REPORT, loadFinanceYearlyReport);
}
