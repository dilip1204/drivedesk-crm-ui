import { call, put, takeEvery } from 'redux-saga/effects';
import { tenantUsageService } from '../../services/functional';
import {
  GET_TENANT_USAGE_DASHBOARD,
  GET_TENANT_USAGE_DASHBOARD_ERROR,
  GET_TENANT_USAGE_DASHBOARD_PENDING,
  GET_TENANT_USAGE_DASHBOARD_SUCCESS,
  GET_TENANT_USAGE_LIST,
  GET_TENANT_USAGE_LIST_ERROR,
  GET_TENANT_USAGE_LIST_PENDING,
  GET_TENANT_USAGE_LIST_SUCCESS,
} from './types';

function* loadTenantUsageDashboard({ fn }) {
  try {
    yield put({ type: GET_TENANT_USAGE_DASHBOARD_PENDING });
    const result = yield call(tenantUsageService.getTenantUsageDashboard);
    yield put({ type: GET_TENANT_USAGE_DASHBOARD_SUCCESS, data: result.data });
    if (typeof fn === 'function') fn(result.data);
  } catch (error) {
    yield put({
      type: GET_TENANT_USAGE_DASHBOARD_ERROR,
      error: error?.response || error,
    });
    if (typeof fn === 'function') fn(null, error);
  }
}

export function* watchTenantUsageDashboard() {
  yield takeEvery(GET_TENANT_USAGE_DASHBOARD, loadTenantUsageDashboard);
}

function* loadTenantUsageList({ param, fn }) {
  try {
    yield put({ type: GET_TENANT_USAGE_LIST_PENDING });
    const result = yield call(tenantUsageService.getTenantUsageList, param);
    yield put({ type: GET_TENANT_USAGE_LIST_SUCCESS, data: result.data });
    if (typeof fn === 'function') fn(result.data);
  } catch (error) {
    yield put({
      type: GET_TENANT_USAGE_LIST_ERROR,
      error: error?.response || error,
    });
    if (typeof fn === 'function') fn(null, error);
  }
}

export function* watchTenantUsageList() {
  yield takeEvery(GET_TENANT_USAGE_LIST, loadTenantUsageList);
}
