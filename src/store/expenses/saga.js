// expensesSaga.js
import { put, call, takeEvery } from "redux-saga/effects";
import {
  ADD_EXPENSES_DATA,
  ADD_EXPENSES_DATA_PENDING,
  ADD_EXPENSES_DATA_SUCCESS,
  ADD_EXPENSES_DATA_ERROR,
  UPDATE_EXPENSES_DATA,
  UPDATE_EXPENSES_DATA_PENDING,
  UPDATE_EXPENSES_DATA_SUCCESS,
  UPDATE_EXPENSES_DATA_ERROR,
  DELETE_EXPENSES_DATA,
  DELETE_EXPENSES_DATA_ERROR,
  DELETE_EXPENSES_DATA_PENDING,
  DELETE_EXPENSES_DATA_SUCCESS,
  GET_EXPENSES_LIST,
  GET_EXPENSES_LIST_PENDING,
  GET_EXPENSES_LIST_SUCCESS,
  GET_EXPENSES_LIST_ERROR,
} from "./types";

import {
  addExpensesList,
  editExpensesList,
  deleteExpensesList,
  getExpensesList, // <-- NEW import for fetching list
} from "../../services/functional";

// --- Add Fleet Expense Saga ---
function* addExpensesData(action) {
  try {
    yield put({ type: ADD_EXPENSES_DATA_PENDING });

    const response = yield call(addExpensesList.addExpensesList, action.param);

    yield put({
      type: ADD_EXPENSES_DATA_SUCCESS,
      data: response.data,
    });

    if (typeof action.fn === "function") {
      action.fn(response.data);
    }
  } catch (error) {
    yield put({
      type: ADD_EXPENSES_DATA_ERROR,
      error: error?.response || error,
    });

    if (typeof action.fn === "function") {
      action.fn(error?.response);
    }
  }
}

// --- Update Fleet Expense Saga ---
function* editExpensesData(action) {
  try {
    yield put({ type: UPDATE_EXPENSES_DATA_PENDING });

    const response = yield call(editExpensesList.editExpensesList, action.param);

    yield put({
      type: UPDATE_EXPENSES_DATA_SUCCESS,
      data: response.data,
    });

    if (typeof action.fn === "function") {
      action.fn(response.data);
    }
  } catch (error) {
    yield put({
      type: UPDATE_EXPENSES_DATA_ERROR,
      error: error?.response || error,
    });

    if (typeof action.fn === "function") {
      action.fn(error?.response);
    }
  }
}

// --- Delete Fleet Expense Saga ---
function* deleteExpensesData(action) {
  try {
    yield put({ type: DELETE_EXPENSES_DATA_PENDING });

    const response = yield call(deleteExpensesList.deleteExpensesList, action.param);

    yield put({
      type: DELETE_EXPENSES_DATA_SUCCESS,
      data: response.data,
    });

    if (typeof action.fn === "function") {
      action.fn(response.data);
    }
  } catch (error) {
    yield put({
      type: DELETE_EXPENSES_DATA_ERROR,
      error: error?.response || error,
    });

    if (typeof action.fn === "function") {
      action.fn(error?.response);
    }
  }
}

// --- Get Fleet Expenses List Saga ---
function* getExpensesData(action) {
  try {
    yield put({ type: GET_EXPENSES_LIST_PENDING });

    // call the API service
    const response = yield call(getExpensesList.getAllExpenses, action.param);

    yield put({
      type: GET_EXPENSES_LIST_SUCCESS,
      data: response.data,
    });

    if (typeof action.fn === "function") {
      action.fn(response.data);
    }
  } catch (error) {
    yield put({
      type: GET_EXPENSES_LIST_ERROR,
      error: error?.response || error,
    });

    if (typeof action.fn === "function") {
      action.fn(error?.response);
    }
  }
}

// --- Watchers ---
export function* watchAddExpenses() {
  yield takeEvery(ADD_EXPENSES_DATA, addExpensesData);
}

export function* watchEditExpenses() {
  yield takeEvery(UPDATE_EXPENSES_DATA, editExpensesData);
}

export function* watchDeleteExpenses() {
  yield takeEvery(DELETE_EXPENSES_DATA, deleteExpensesData);
}

// NEW watcher for GET
export function* watchGetExpenses() {
  yield takeEvery(GET_EXPENSES_LIST, getExpensesData);
}
