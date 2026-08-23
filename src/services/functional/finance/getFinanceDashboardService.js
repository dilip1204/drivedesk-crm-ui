import { METHOD_TYPES } from '../../../shared/constants/methodTypes';
import { ENDPOINTS } from '../../../shared/constants/endPoints';
import { request } from '../../core/networkRequest';

export const getFinanceDashboard = (param = {}) => {
  const query = new URLSearchParams();
  if (param.fromDate) query.set('from_date', param.fromDate);
  if (param.toDate) query.set('to_date', param.toDate);
  const queryString = query.toString();

  return request(
    METHOD_TYPES.GET,
    `${ENDPOINTS.getFinanceDashboard}${queryString ? `?${queryString}` : ''}`
  );
};

export const getFinanceTransactions = (param = {}) => {
  const query = new URLSearchParams();
  if (param.fromDate) query.set('from_date', param.fromDate);
  if (param.toDate) query.set('to_date', param.toDate);
  if (param.type) query.set('type', param.type);
  if (param.category) query.set('category', param.category);
  if (param.paidBy) query.set('paid_by', param.paidBy);
  if (param.tenantId) query.set('tenant_id', param.tenantId);
  query.set('page', String(param.page || 1));
  query.set('page_size', String(param.pageSize || 20));

  return request(
    METHOD_TYPES.GET,
    `${ENDPOINTS.getFinanceTransactions}?${query.toString()}`
  );
};

export const createFinanceTransaction = (payload) =>
  request(METHOD_TYPES.POST, ENDPOINTS.getFinanceTransactions, payload);

export const getFinanceTransaction = (transactionId) => {
  if (!transactionId) {
    return Promise.reject(new Error('Transaction ID is required.'));
  }

  return request(
    METHOD_TYPES.GET,
    `${ENDPOINTS.getFinanceTransactions}/${encodeURIComponent(transactionId)}`
  );
};

export const updateFinanceTransaction = (transactionId, payload) => {
  if (!transactionId) {
    return Promise.reject(new Error('Transaction ID is required.'));
  }

  return request(
    METHOD_TYPES.PATCH,
    `${ENDPOINTS.getFinanceTransactions}/${encodeURIComponent(transactionId)}`,
    payload
  );
};

export const deleteFinanceTransaction = (transactionId) => {
  if (!transactionId) {
    return Promise.reject(new Error('Transaction ID is required.'));
  }

  return request(
    METHOD_TYPES.DELETE,
    `${ENDPOINTS.getFinanceTransactions}/${encodeURIComponent(transactionId)}`
  );
};

export const getFinanceMonthlyReport = ({ year, month }) => {
  const query = new URLSearchParams({
    year: String(year),
    month: String(month),
  });

  return request(
    METHOD_TYPES.GET,
    `${ENDPOINTS.getFinanceMonthlyReport}?${query.toString()}`
  );
};

export const getFinanceYearlyReport = ({ year }) => {
  const query = new URLSearchParams({ year: String(year) });

  return request(
    METHOD_TYPES.GET,
    `${ENDPOINTS.getFinanceYearlyReport}?${query.toString()}`
  );
};
