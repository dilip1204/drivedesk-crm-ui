import {
    ADD_SUPER_ADMIN,
    UPDATE_SUPER_ADMIN,
    GET_SUPER_ADMIN_LIST,
} from './types';

export function addSuperAdmin(param, fn) {
    return { type: ADD_SUPER_ADMIN, param, fn };
}

export function updateSuperAdmin(param, fn) {
    return { type: UPDATE_SUPER_ADMIN, param, fn };
}

export function getSuperAdminList(param, fn) {
    return { type: GET_SUPER_ADMIN_LIST, param, fn };
}
