import { METHOD_TYPES } from '../../../shared/constants/methodTypes';
import { ENDPOINTS } from '../../../shared/constants/endPoints';
import { request } from '../../core/networkRequest';

export const getTenantUsageDashboard = () =>
  request(METHOD_TYPES.GET, ENDPOINTS.getTenantUsageDashboard);

export const getTenantUsageList = (param = {}) => {
  const query = new URLSearchParams({
    page: String(param.page || 1),
    limit: String(param.limit || 10),
  });

  if (param.tenantId) query.set('tenant_id', param.tenantId.trim());
  if (param.dateMode === 'range') {
    if (param.fromDate) query.set('from_date', param.fromDate);
    if (param.toDate) query.set('to_date', param.toDate);
  } else {
    if (param.month) query.set('month', String(param.month));
    if (param.year) query.set('year', String(param.year));
  }

  return request(
    METHOD_TYPES.GET,
    `${ENDPOINTS.getTenantUsageList}?${query.toString()}`
  );
};
