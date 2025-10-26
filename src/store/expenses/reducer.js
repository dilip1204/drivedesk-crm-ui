// expensesReducer.js
import {
  ADD_EXPENSES_DATA_ERROR,
  ADD_EXPENSES_DATA_PENDING,
  ADD_EXPENSES_DATA_SUCCESS,
  UPDATE_EXPENSES_DATA_ERROR,
  UPDATE_EXPENSES_DATA_PENDING,
  UPDATE_EXPENSES_DATA_SUCCESS,
  DELETE_EXPENSES_DATA_ERROR,
  DELETE_EXPENSES_DATA_PENDING,
  DELETE_EXPENSES_DATA_SUCCESS,
  GET_EXPENSES_LIST_ERROR,
  GET_EXPENSES_LIST_PENDING,
  GET_EXPENSES_LIST_SUCCESS,
} from "./types";

const initialState = {
  // add expense
  addExpenseResponse: null,
  addExpenseLoading: false,
  addExpenseError: null,

  // update/edit expense
  updateExpenseResponse: null,
  updateExpenseLoading: false,
  updateExpenseError: null,

  // delete expense
  deleteExpensesResponse: null,
  deleteExpensesLoader: false,
  deleteExpensesError: null,

  // list / fetch expenses
  expensesList: [],           // array of expenses returned by GET
  expensesListLoading: false,
  expensesListError: null,
};

export default function expensesReducer(state = initialState, action) {
  switch (action.type) {
    // --- Add expense ---
    case ADD_EXPENSES_DATA_PENDING:
      return {
        ...state,
        addExpenseLoading: true,
        addExpenseError: null,
      };

    case ADD_EXPENSES_DATA_SUCCESS:
      return {
        ...state,
        addExpenseLoading: false,
        addExpenseResponse: action.data ?? action.payload ?? null,
        addExpenseError: null,
      };

    case ADD_EXPENSES_DATA_ERROR:
      return {
        ...state,
        addExpenseLoading: false,
        addExpenseError: action.error ?? action.payload ?? "Unknown error",
      };

    // --- Update expense ---
    case UPDATE_EXPENSES_DATA_PENDING:
      return {
        ...state,
        updateExpenseLoading: true,
        updateExpenseError: null,
      };

    case UPDATE_EXPENSES_DATA_SUCCESS:
      return {
        ...state,
        updateExpenseLoading: false,
        updateExpenseResponse: action.data ?? action.payload ?? null,
        updateExpenseError: null,
      };

    case UPDATE_EXPENSES_DATA_ERROR:
      return {
        ...state,
        updateExpenseLoading: false,
        updateExpenseError: action.error ?? action.payload ?? "Unknown error",
      };

    // --- Delete expense ---
    case DELETE_EXPENSES_DATA_PENDING:
      return {
        ...state,
        deleteExpensesLoader: true,
        deleteExpensesError: null,
      };

    case DELETE_EXPENSES_DATA_SUCCESS:
      return {
        ...state,
        deleteExpensesLoader: false,
        deleteExpensesResponse: action.data ?? action.payload ?? null,
        deleteExpensesError: null,
      };

    case DELETE_EXPENSES_DATA_ERROR:
      return {
        ...state,
        deleteExpensesLoader: false,
        deleteExpensesError: action.error ?? action.payload ?? "Unknown error",
      };

    // --- Get / List expenses ---
    case GET_EXPENSES_LIST_PENDING:
      return {
        ...state,
        expensesListLoading: true,
        expensesListError: null,
      };

    case GET_EXPENSES_LIST_SUCCESS:
      return {
        ...state,
        expensesListLoading: false,
        // try to normalize to an array; fallback to [] if no data
        expensesList: action.data ?? action.payload ?? [],
        expensesListError: null,
      };

    case GET_EXPENSES_LIST_ERROR:
      return {
        ...state,
        expensesListLoading: false,
        expensesListError: action.error ?? action.payload ?? "Unknown error",
      };

    default:
      return state;
  }
}
