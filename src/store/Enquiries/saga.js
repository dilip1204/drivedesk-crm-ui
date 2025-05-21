import { takeLatest, put, call, takeEvery } from 'redux-saga/effects';
import {
  ADD_ENQUIRIES_DATA,
  ADD_ENQUIRIES_DATA_ERROR,
  ADD_ENQUIRIES_DATA_PENDING,
  ADD_ENQUIRIES_DATA_SUCCESS,
  UPDATE_ENQUIRIES_DATA,
  UPDATE_ENQUIRIES_DATA_ERROR,
  UPDATE_ENQUIRIES_DATA_SUCCESS,
  UPDATE_ENQUIRIES_DATA_PENDING,
  GET_ENQUIRIES_LIST,
  GET_ENQUIRIES_LIST_ERROR,
  GET_ENQUIRIES_LIST_PENDING,
  GET_ENQUIRIES_LIST_SUCCESS,
  DELETE_ENQUIRIES_DATA,
  DELETE_ENQUIRIES_DATA_ERROR,
  DELETE_ENQUIRIES_DATA_PENDING,
  DELETE_ENQUIRIES_DATA_SUCCESS
} from './types';

import {
  addEnquiriesList, editEnquiriesList, getAllEnquiriesService, deleteEnquiriesList
} from '../../services/functional'; // Update service path accordingly

function* addEnquiriesData(action) {
  try {
    yield put({ type: ADD_ENQUIRIES_DATA_PENDING });
    const response = yield call(addEnquiriesList, action.param);
    yield put({
      type: ADD_ENQUIRIES_DATA_SUCCESS,
      data: response.data
    });
    if (typeof action.fn === 'function') {
      action.fn(response.data);
    }
  } catch (error) {
    yield put({ type: ADD_ENQUIRIES_DATA_ERROR, error });
    if (typeof action.fn === 'function') {
      action.fn(error.response);
    }
  }
}

function* updateEnquiriesData(action) {
  try {
    yield put({ type: UPDATE_ENQUIRIES_DATA_PENDING });
    const response = yield call(editEnquiriesList, action.param);
    yield put({
      type: UPDATE_ENQUIRIES_DATA_SUCCESS,
      data: response.data
    });
    if (typeof action.fn === 'function') {
      action.fn(response.data);
    }
  } catch (error) {
    yield put({ type: UPDATE_ENQUIRIES_DATA_ERROR, error });
    if (typeof action.fn === 'function') {
      action.fn(error.response);
    }
  }
}

function* getAllEnquiriesInformation(action) {
  try {
    yield put({ type: GET_ENQUIRIES_LIST_PENDING });
    const response = yield call(getAllEnquiriesService, action.param);
    yield put({
      type: GET_ENQUIRIES_LIST_SUCCESS,
      data: response.data
    });
    if (typeof action.fn === 'function') {
      action.fn(response.data);
    }
  } catch (error) {
    yield put({ type: GET_ENQUIRIES_LIST_ERROR, error });
    if (typeof action.fn === 'function') {
      action.fn(error);
    }
  }
}

function* deleteEnquiriesData(action) {
  try {
    yield put({ type: DELETE_ENQUIRIES_DATA_PENDING });
    const response = yield call(deleteEnquiriesList, action.param);
    yield put({
      type: DELETE_ENQUIRIES_DATA_SUCCESS,
      data: response.data
    });
    if (typeof action.fn === 'function') {
      action.fn(response.data);
    }
  } catch (error) {
    yield put({ type: DELETE_ENQUIRIES_DATA_ERROR, error });
    if (typeof action.fn === 'function') {
      action.fn(error.response);
    }
  }
}

export function* watchAddEnquiries() {
  yield takeEvery(ADD_ENQUIRIES_DATA, addEnquiriesData);
}

export function* watchUpdateEnquiries() {
  yield takeEvery(UPDATE_ENQUIRIES_DATA, updateEnquiriesData);
}

export function* watchEnquiriesListInformation() {
  yield takeEvery(GET_ENQUIRIES_LIST, getAllEnquiriesInformation);
}

export function* watchDeleteEnquiries() {
  yield takeEvery(DELETE_ENQUIRIES_DATA, deleteEnquiriesData);
}
