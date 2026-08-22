import { METHOD_TYPES } from '../../../shared/constants/methodTypes';
import { request } from '../../core/networkRequest';
import { ENDPOINTS } from '../../../shared/constants/endPoints';

const buildTenantMultipartPayload = (jsonFieldName, tenantPayload, logo) => {
    const formData = new FormData();
    formData.append(jsonFieldName, JSON.stringify(tenantPayload));
    formData.append('logo', logo);
    return formData;
};

export const addSuperAdmin = (param) => {
    const tenantPayload = param?.tenantData || param;
    const requestPayload = param?.logo
        ? buildTenantMultipartPayload('tenant_data', tenantPayload, param.logo)
        : tenantPayload;

    return request(METHOD_TYPES.POST, ENDPOINTS.addSuperAdmin, requestPayload);
};

export const getSuperAdminList = (param) => {
    return request(
        METHOD_TYPES.GET,
        ENDPOINTS.getSuperAdminList + `?page=${param.page}&limit=${param.limit}`
    );
};

export const updateSuperAdmin = (param) => {
    const { mobile_number, tenantPatch, logo, ...body } = param;
    const tenantPayload = tenantPatch || body;
    const requestPayload = logo
        ? buildTenantMultipartPayload('tenant_patch', tenantPayload, logo)
        : tenantPayload;

    return request(
        METHOD_TYPES.PATCH,
        ENDPOINTS.editSuperAdmin + mobile_number,
        requestPayload
    );
};

export const getTenantLogo = (tenantId) => {
    if (!tenantId) {
        return Promise.reject(new Error('Tenant ID is required to load the logo.'));
    }

    return request(
        METHOD_TYPES.GET,
        `${ENDPOINTS.getTenantLogo}${encodeURIComponent(tenantId)}`,
        { responseType: 'blob' }
    );
};

export const getWhatsAppUsage = (period) => {
    const query = new URLSearchParams({ period }).toString();
    return request(
        METHOD_TYPES.GET,
        `${ENDPOINTS.getWhatsAppUsage}?${query}`
    );
};
