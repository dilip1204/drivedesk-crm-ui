import { GET_TENANT_USAGE_DASHBOARD, GET_TENANT_USAGE_LIST } from './types';

export const getTenantUsageDashboard = (fn) => ({
  type: GET_TENANT_USAGE_DASHBOARD,
  fn,
});

export const getTenantUsageList = (param, fn) => ({
  type: GET_TENANT_USAGE_LIST,
  param,
  fn,
});
