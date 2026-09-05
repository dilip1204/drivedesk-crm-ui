import {
  CREATE_FINANCE_TRANSACTION_ERROR,
  CREATE_FINANCE_TRANSACTION_PENDING,
  CREATE_FINANCE_TRANSACTION_SUCCESS,
  DELETE_FINANCE_TRANSACTION_ERROR,
  DELETE_FINANCE_TRANSACTION_PENDING,
  DELETE_FINANCE_TRANSACTION_SUCCESS,
  GET_FINANCE_DASHBOARD_ERROR,
  GET_FINANCE_DASHBOARD_PENDING,
  GET_FINANCE_DASHBOARD_SUCCESS,
  GET_FINANCE_MONTHLY_REPORT_ERROR,
  GET_FINANCE_MONTHLY_REPORT_PENDING,
  GET_FINANCE_MONTHLY_REPORT_SUCCESS,
  GET_FINANCE_YEARLY_REPORT_ERROR,
  GET_FINANCE_YEARLY_REPORT_PENDING,
  GET_FINANCE_YEARLY_REPORT_SUCCESS,
  GET_FINANCE_TRANSACTION_ERROR,
  GET_FINANCE_TRANSACTION_PENDING,
  GET_FINANCE_TRANSACTION_SUCCESS,
  GET_FINANCE_TRANSACTIONS_ERROR,
  GET_FINANCE_TRANSACTIONS_PENDING,
  GET_FINANCE_TRANSACTIONS_SUCCESS,
  UPDATE_FINANCE_TRANSACTION_ERROR,
  UPDATE_FINANCE_TRANSACTION_PENDING,
  UPDATE_FINANCE_TRANSACTION_SUCCESS,
} from './types';

const initialState = {
  data: null,
  loading: false,
  error: null,
  transactionsData: null,
  transactionsLoading: false,
  transactionsError: null,
  createData: null,
  createLoading: false,
  createError: null,
  transactionDetail: null,
  transactionDetailLoading: false,
  transactionDetailError: null,
  updateData: null,
  updateLoading: false,
  updateError: null,
  deleteData: null,
  deleteLoading: false,
  deleteError: null,
  monthlyReportData: null,
  monthlyReportLoading: false,
  monthlyReportError: null,
  yearlyReportData: null,
  yearlyReportLoading: false,
  yearlyReportError: null,
};

export default function financeDashboardReducer(state = initialState, action) {
  switch (action.type) {
    case GET_FINANCE_DASHBOARD_PENDING:
      return {
        ...state,
        loading: true,
        error: null,
      };
    case GET_FINANCE_DASHBOARD_SUCCESS:
      return {
        ...state,
        data: action.data,
        loading: false,
        error: null,
      };
    case GET_FINANCE_DASHBOARD_ERROR:
      return {
        ...state,
        loading: false,
        error: action.error,
      };
    case GET_FINANCE_TRANSACTIONS_PENDING:
      return {
        ...state,
        transactionsLoading: true,
        transactionsError: null,
      };
    case GET_FINANCE_TRANSACTIONS_SUCCESS:
      return {
        ...state,
        transactionsData: action.data,
        transactionsLoading: false,
        transactionsError: null,
      };
    case GET_FINANCE_TRANSACTIONS_ERROR:
      return {
        ...state,
        transactionsLoading: false,
        transactionsError: action.error,
      };
    case CREATE_FINANCE_TRANSACTION_PENDING:
      return {
        ...state,
        createLoading: true,
        createError: null,
      };
    case CREATE_FINANCE_TRANSACTION_SUCCESS:
      return {
        ...state,
        createData: action.data,
        createLoading: false,
        createError: null,
      };
    case CREATE_FINANCE_TRANSACTION_ERROR:
      return {
        ...state,
        createLoading: false,
        createError: action.error,
      };
    case GET_FINANCE_TRANSACTION_PENDING:
      return {
        ...state,
        transactionDetail: null,
        transactionDetailLoading: true,
        transactionDetailError: null,
      };
    case GET_FINANCE_TRANSACTION_SUCCESS:
      return {
        ...state,
        transactionDetail: action.data,
        transactionDetailLoading: false,
        transactionDetailError: null,
      };
    case GET_FINANCE_TRANSACTION_ERROR:
      return {
        ...state,
        transactionDetail: null,
        transactionDetailLoading: false,
        transactionDetailError: action.error,
      };
    case UPDATE_FINANCE_TRANSACTION_PENDING:
      return {
        ...state,
        updateLoading: true,
        updateError: null,
      };
    case UPDATE_FINANCE_TRANSACTION_SUCCESS:
      return {
        ...state,
        updateData: action.data,
        updateLoading: false,
        updateError: null,
      };
    case UPDATE_FINANCE_TRANSACTION_ERROR:
      return {
        ...state,
        updateLoading: false,
        updateError: action.error,
      };
    case DELETE_FINANCE_TRANSACTION_PENDING:
      return {
        ...state,
        deleteLoading: true,
        deleteError: null,
      };
    case DELETE_FINANCE_TRANSACTION_SUCCESS:
      return {
        ...state,
        deleteData: action.data,
        deleteLoading: false,
        deleteError: null,
      };
    case DELETE_FINANCE_TRANSACTION_ERROR:
      return {
        ...state,
        deleteLoading: false,
        deleteError: action.error,
      };
    case GET_FINANCE_MONTHLY_REPORT_PENDING:
      return {
        ...state,
        monthlyReportLoading: true,
        monthlyReportError: null,
      };
    case GET_FINANCE_MONTHLY_REPORT_SUCCESS:
      return {
        ...state,
        monthlyReportData: action.data,
        monthlyReportLoading: false,
        monthlyReportError: null,
      };
    case GET_FINANCE_MONTHLY_REPORT_ERROR:
      return {
        ...state,
        monthlyReportLoading: false,
        monthlyReportError: action.error,
      };
    case GET_FINANCE_YEARLY_REPORT_PENDING:
      return {
        ...state,
        yearlyReportLoading: true,
        yearlyReportError: null,
      };
    case GET_FINANCE_YEARLY_REPORT_SUCCESS:
      return {
        ...state,
        yearlyReportData: action.data,
        yearlyReportLoading: false,
        yearlyReportError: null,
      };
    case GET_FINANCE_YEARLY_REPORT_ERROR:
      return {
        ...state,
        yearlyReportLoading: false,
        yearlyReportError: action.error,
      };
    default:
      return state;
  }
}
