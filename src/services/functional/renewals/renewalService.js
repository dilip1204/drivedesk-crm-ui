import { METHOD_TYPES } from '../../../shared/constants/methodTypes';
import { request } from '../../core/networkRequest';
import { ENDPOINTS } from '../../../shared/constants/endPoints';

export const getRenewals = ({ page = 1, limit = 10, ...filters } = {}) => {
  const query = new URLSearchParams({ page: String(page), limit: String(limit) });
  Object.entries(filters).forEach(([key, value]) => {
    if (value !== '' && value !== null && value !== undefined) query.set(key, value);
  });
  return request(METHOD_TYPES.GET, `${ENDPOINTS.renewals}?${query.toString()}`);
};

export const getRenewal = (id) =>
  request(METHOD_TYPES.GET, `${ENDPOINTS.renewals}/${encodeURIComponent(id)}`);

export const createRenewal = (payload) =>
  request(METHOD_TYPES.POST, ENDPOINTS.renewals, payload);

export const updateRenewal = (id, payload) =>
  request(METHOD_TYPES.PATCH, `${ENDPOINTS.renewals}/${encodeURIComponent(id)}`, payload);

export const deleteRenewal = (id) =>
  request(METHOD_TYPES.DELETE, `${ENDPOINTS.renewals}/${encodeURIComponent(id)}`);

export const getLicenceExpiries = ({ page = 1, limit = 10, ...filters } = {}) => {
  const query = new URLSearchParams({ page: String(page), limit: String(limit) });
  Object.entries(filters).forEach(([key, value]) => {
    if (value !== '' && value !== null && value !== undefined) query.set(key, value);
  });
  return request(
    METHOD_TYPES.GET,
    `${ENDPOINTS.renewals}/licence-expiries?${query.toString()}`
  );
};

export const getVehicles = ({ page = 1, limit = 10, search = '' } = {}) => {
  const query = new URLSearchParams({ page: String(page), limit: String(limit) });
  if (search) query.set('search', search);
  return request(METHOD_TYPES.GET, `${ENDPOINTS.renewals}/vehicles?${query.toString()}`);
};

export const getVehicle = (id) =>
  request(METHOD_TYPES.GET, `${ENDPOINTS.renewals}/vehicles/${encodeURIComponent(id)}`);

export const createVehicle = (payload) =>
  request(METHOD_TYPES.POST, `${ENDPOINTS.renewals}/vehicles`, payload);

export const updateVehicle = (id, payload) =>
  request(METHOD_TYPES.PATCH, `${ENDPOINTS.renewals}/vehicles/${encodeURIComponent(id)}`, payload);

export const deleteVehicle = (id) =>
  request(METHOD_TYPES.DELETE, `${ENDPOINTS.renewals}/vehicles/${encodeURIComponent(id)}`);

export const getVehicleDocumentExpiries = ({ page = 1, limit = 10, ...filters } = {}) => {
  const query = new URLSearchParams({ page: String(page), limit: String(limit) });
  Object.entries(filters).forEach(([key, value]) => {
    if (value !== '' && value !== null && value !== undefined) query.set(key, value);
  });
  return request(
    METHOD_TYPES.GET,
    `${ENDPOINTS.renewals}/vehicles/expiries?${query.toString()}`
  );
};

export const getRenewalDashboard = () =>
  request(METHOD_TYPES.GET, `${ENDPOINTS.renewals}/dashboard`);
