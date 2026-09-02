import {
    GET_TENANT_LOGO,
    LOGIN_USER_DATA,
    REQUEST_LOGIN_OTP,
    VERIFY_LOGIN_OTP,
} from "./types";

export function userLogin(param, fn) {
    return {
        type: LOGIN_USER_DATA,
        param,
        fn,
    };
}

export function requestLoginOtp(mobileNumber, fn) {
    return {
        type: REQUEST_LOGIN_OTP,
        param: mobileNumber,
        fn,
    };
}

export function verifyLoginOtp(mobileNumber, otp, fn) {
    return {
        type: VERIFY_LOGIN_OTP,
        param: { mobileNumber, otp },
        fn,
    };
}

export function getTenantLogo(tenantId, versionOrCallback, callback) {
    const version = typeof versionOrCallback === 'function' ? undefined : versionOrCallback;
    const fn = typeof versionOrCallback === 'function' ? versionOrCallback : callback;
    return {
        type: GET_TENANT_LOGO,
        param: { tenantId, version },
        fn,
    };
}
