import {
  CREATE_FINANCE_TRANSACTION,
  DELETE_FINANCE_TRANSACTION,
  GET_FINANCE_DASHBOARD,
  GET_FINANCE_MONTHLY_REPORT,
  GET_FINANCE_YEARLY_REPORT,
  GET_FINANCE_TRANSACTION,
  GET_FINANCE_TRANSACTIONS,
  UPDATE_FINANCE_TRANSACTION,
} from './types';

export const getFinanceDashboard = (param, fn) => ({
  type: GET_FINANCE_DASHBOARD,
  param,
  fn,
});

export const getFinanceTransactions = (param, fn) => ({
  type: GET_FINANCE_TRANSACTIONS,
  param,
  fn,
});

export const createFinanceTransaction = (param, fn) => ({
  type: CREATE_FINANCE_TRANSACTION,
  param,
  fn,
});

export const getFinanceTransaction = (transactionId, fn) => ({
  type: GET_FINANCE_TRANSACTION,
  param: transactionId,
  fn,
});

export const updateFinanceTransaction = (transactionId, payload, fn) => ({
  type: UPDATE_FINANCE_TRANSACTION,
  param: { transactionId, payload },
  fn,
});

export const deleteFinanceTransaction = (transactionId, fn) => ({
  type: DELETE_FINANCE_TRANSACTION,
  param: transactionId,
  fn,
});

export const getFinanceMonthlyReport = (param, fn) => ({
  type: GET_FINANCE_MONTHLY_REPORT,
  param,
  fn,
});

export const getFinanceYearlyReport = (param, fn) => ({
  type: GET_FINANCE_YEARLY_REPORT,
  param,
  fn,
});
