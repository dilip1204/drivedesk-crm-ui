import { METHOD_TYPES } from '../../../shared/constants/methodTypes';
import { request } from '../../core/networkRequest';
import { ENDPOINTS } from '../../../shared/constants/endPoints';

export const addSuperAdmin = (param) => {
    return request(METHOD_TYPES.POST, ENDPOINTS.addSuperAdmin, param);
};

export const getSuperAdminList = (param) => {
    return request(
        METHOD_TYPES.GET,
        ENDPOINTS.getSuperAdminList + `?page=${param.page}&limit=${param.limit}`
    );
};

export const updateSuperAdmin = (param) => {
    const { mobile_number, ...body } = param;
    return request(
        METHOD_TYPES.PATCH,
        ENDPOINTS.editSuperAdmin + mobile_number,
        body
    );
};

export const getWhatsAppUsage = (period) => {
    const query = new URLSearchParams({ period }).toString();
    return request(
        METHOD_TYPES.GET,
        `${ENDPOINTS.getWhatsAppUsage}?${query}`
    );
};
