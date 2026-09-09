import { put, call, takeEvery } from 'redux-saga/effects';
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
  DELETE_ENQUIRIES_DATA_SUCCESS,
  GET_ENQUIRIES_FILTER_LIST,
  GET_ENQUIRIES_FILTER_LIST_ERROR,
  GET_ENQUIRIES_FILTER_LIST_PENDING,
  GET_ENQUIRIES_FILTER_LIST_SUCCESS,
  CREATE_ENQUIRY_RENEWAL,
  CREATE_ENQUIRY_RENEWAL_ERROR,
  CREATE_ENQUIRY_RENEWAL_PENDING,
  CREATE_ENQUIRY_RENEWAL_SUCCESS,
} from './types';

import {
  addEnquiriesList, editEnquiriesList, getAllEnquiriesService, deleteEnquiriesList
} from '../../services/functional'; // Update service path accordingly
import { createRenewal } from '../../services/functional/renewals/renewalService';

function* createEnquiryRenewalData(action) {
  try {
    yield put({ type: CREATE_ENQUIRY_RENEWAL_PENDING });
    const response = yield call(createRenewal, action.param);
    yield put({ type: CREATE_ENQUIRY_RENEWAL_SUCCESS, data: response.data });
    if (typeof action.fn === 'function') action.fn(response.data);
  } catch (error) {
    yield put({ type: CREATE_ENQUIRY_RENEWAL_ERROR, error });
    if (typeof action.fn === 'function') action.fn(error.response);
  }
}

function* addEnquiriesData(action) {
  try {
    yield put({ type: ADD_ENQUIRIES_DATA_PENDING });
    const response = yield call(addEnquiriesList.addEnquiriesList, action.param);
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
    const response = yield call(editEnquiriesList.editEnquiriesList, action.param);
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
    const response = yield call(getAllEnquiriesService.getAllEnquiries, action.param);
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
    const response = yield call(deleteEnquiriesList.deleteEnquiriesList, action.param);
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

function* getAllEnquiriesFilterInformation(action){ 
    try {
        yield put({ type: GET_ENQUIRIES_FILTER_LIST_PENDING });
        const response = yield call(
            getAllEnquiriesService.getAllEnquiriesFilter,
            action.param,
        );
        yield put({ 
            type: GET_ENQUIRIES_FILTER_LIST_SUCCESS,
            data: response.data
        });
        if (typeof action.fn === "function") {
            action.fn(response.data)
        }
    } catch (error) { 
        yield put({ type: GET_ENQUIRIES_FILTER_LIST_ERROR, error: error});
        if (typeof action.fn === "function") {
            action.fn(error)
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

export function* watchEnquiriesFilterListInformation() {
    yield takeEvery(GET_ENQUIRIES_FILTER_LIST, getAllEnquiriesFilterInformation);
}

export function* watchCreateEnquiryRenewal() {
  yield takeEvery(CREATE_ENQUIRY_RENEWAL, createEnquiryRenewalData);
}
