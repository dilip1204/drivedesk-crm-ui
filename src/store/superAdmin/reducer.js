import {
    ADD_SUPER_ADMIN_PENDING, ADD_SUPER_ADMIN_SUCCESS, ADD_SUPER_ADMIN_ERROR,
    UPDATE_SUPER_ADMIN_PENDING, UPDATE_SUPER_ADMIN_SUCCESS, UPDATE_SUPER_ADMIN_ERROR,
    GET_SUPER_ADMIN_LIST_PENDING, GET_SUPER_ADMIN_LIST_SUCCESS, GET_SUPER_ADMIN_LIST_ERROR,
} from './types';

const initialState = {
    superAdminList: [],
    superAdminListLoading: false,
    superAdminListError: null,
    addSuperAdminLoading: false,
    addSuperAdminError: null,
    updateSuperAdminLoading: false,
    updateSuperAdminError: null,
};

export default function superAdminReducer(state = initialState, action) {
    switch (action.type) {
        case GET_SUPER_ADMIN_LIST_PENDING:
            return { ...state, superAdminListLoading: true, superAdminListError: null };
        case GET_SUPER_ADMIN_LIST_SUCCESS:
            return { ...state, superAdminList: action.data, superAdminListLoading: false };
        case GET_SUPER_ADMIN_LIST_ERROR:
            return { ...state, superAdminListError: action.error, superAdminListLoading: false };

        case ADD_SUPER_ADMIN_PENDING:
            return { ...state, addSuperAdminLoading: true, addSuperAdminError: null };
        case ADD_SUPER_ADMIN_SUCCESS:
            return { ...state, addSuperAdminLoading: false };
        case ADD_SUPER_ADMIN_ERROR:
            return { ...state, addSuperAdminError: action.error, addSuperAdminLoading: false };

        case UPDATE_SUPER_ADMIN_PENDING:
            return { ...state, updateSuperAdminLoading: true, updateSuperAdminError: null };
        case UPDATE_SUPER_ADMIN_SUCCESS:
            return { ...state, updateSuperAdminLoading: false };
        case UPDATE_SUPER_ADMIN_ERROR:
            return { ...state, updateSuperAdminError: action.error, updateSuperAdminLoading: false };

        default:
            return state;
    }
}
