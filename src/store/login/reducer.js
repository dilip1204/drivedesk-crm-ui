import {
    GET_TENANT_LOGO_ERROR,
    GET_TENANT_LOGO_PENDING,
    GET_TENANT_LOGO_SUCCESS,
   // LOGIN_USER_DATA,
    LOGIN_USER_DATA_ERROR,
    LOGIN_USER_DATA_PENDING,
    LOGIN_USER_DATA_SUCCESS,
    REQUEST_LOGIN_OTP_ERROR,
    REQUEST_LOGIN_OTP_PENDING,
    REQUEST_LOGIN_OTP_SUCCESS,
    VERIFY_LOGIN_OTP_ERROR,
    VERIFY_LOGIN_OTP_PENDING,
    VERIFY_LOGIN_OTP_SUCCESS,
} from './types';

const initialState = {
    userLoginResponse: [],
    userLoginLoader: false,
    userLoginError: [],
    otpRequestResponse: null,
    otpRequestLoader: false,
    otpRequestError: null,
    otpVerifyResponse: null,
    otpVerifyLoader: false,
    otpVerifyError: null,
    tenantLogoStatus: null,
    tenantLogoLoader: false,
    tenantLogoError: null,
}

export default function UserLoginReducer(state = initialState, action) {
    switch (action.type) {
        case LOGIN_USER_DATA_SUCCESS:
            return {
                ...state,
                userLoginResponse: action.data,
                userLoginLoader: false
            }
        case LOGIN_USER_DATA_PENDING:
            return {
                ...state,
                userLoginLoader: true
            }
        case LOGIN_USER_DATA_ERROR:
            return {
                ...state,
                userLoginError: action.error,
                userLoginLoader: false
            }
        case REQUEST_LOGIN_OTP_PENDING:
            return {
                ...state,
                otpRequestLoader: true,
                otpRequestError: null,
            }
        case REQUEST_LOGIN_OTP_SUCCESS:
            return {
                ...state,
                otpRequestResponse: action.data,
                otpRequestLoader: false,
            }
        case REQUEST_LOGIN_OTP_ERROR:
            return {
                ...state,
                otpRequestError: action.error,
                otpRequestLoader: false,
            }
        case VERIFY_LOGIN_OTP_PENDING:
            return {
                ...state,
                otpVerifyLoader: true,
                otpVerifyError: null,
            }
        case VERIFY_LOGIN_OTP_SUCCESS:
            return {
                ...state,
                otpVerifyResponse: action.data,
                otpVerifyLoader: false,
            }
        case VERIFY_LOGIN_OTP_ERROR:
            return {
                ...state,
                otpVerifyError: action.error,
                otpVerifyLoader: false,
            }
        case GET_TENANT_LOGO_PENDING:
            return {
                ...state,
                tenantLogoLoader: true,
                tenantLogoError: null,
            }
        case GET_TENANT_LOGO_SUCCESS:
            return {
                ...state,
                tenantLogoStatus: action.data,
                tenantLogoLoader: false,
            }
        case GET_TENANT_LOGO_ERROR:
            return {
                ...state,
                tenantLogoError: action.error,
                tenantLogoLoader: false,
            }
        default:
            return state;
    }
}
