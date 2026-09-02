import axios from 'axios';
import { METHOD_TYPES } from '../../shared/constants/methodTypes'; 

const instance = axios.create({
    baseURL: process.env.REACT_APP_BASE_API_URL || '/api/',
})

let hasHandledAuthError = false;

const isTokenExpiredDetail = (data) => {
    const detail = data?.detail;
    return typeof detail === 'string' && detail.toLowerCase().includes('token has expired');
};

const isLoginRequest = (url = '') => {
    const normalizedUrl = String(url).split('?')[0].replace(/^\/+|\/+$/g, '');
    return normalizedUrl === 'auth/login' || normalizedUrl.startsWith('auth/login/otp/');
};

const notifyServerError = (error) => {
    const statusCode = error?.response?.status;
    if (
        typeof window === 'undefined' ||
        !Number.isInteger(statusCode) ||
        statusCode < 500 ||
        statusCode > 504
    ) {
        return;
    }

    window.dispatchEvent(new CustomEvent('drivedesk:server-error', {
        detail: {
            statusCode,
            method: String(error?.config?.method || 'GET').toUpperCase(),
            url: error?.config?.url || '',
            occurredAt: Date.now(),
        },
    }));
};

const forceLogout = () => {
    if (hasHandledAuthError) {
        return;
    }

    hasHandledAuthError = true;
    localStorage.clear();

    if (window.location.pathname !== '/login') {
        window.location.replace('/login');
    }
};


instance.interceptors.request.use(
    (config) => {
        const isMultipartRequest =
            typeof FormData !== 'undefined' && config.data instanceof FormData;

        if (isMultipartRequest) {
            if (typeof config.headers?.delete === 'function') {
                config.headers.delete('Content-Type');
            } else if (config.headers) {
                delete config.headers['Content-Type'];
            }
        } else {
            config.headers['Content-Type'] = 'application/json';
        }
        config.headers['Accept'] = 'application/json';

        const token = localStorage.getItem('token');
        if (token) {
            config.headers['Authorization'] = token;
        }

        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

instance.interceptors.response.use(
    (response) => {
        return response;
    },
    (error) => {
        const statusCode = error?.response?.status;
        const responseData = error?.response?.data;

        if (
            (statusCode === 401 || isTokenExpiredDetail(responseData)) &&
            !isLoginRequest(error?.config?.url)
        ) {
            forceLogout();
        }

        notifyServerError(error);

        return Promise.reject(error);
    }
);

export const request  = (method, url, payload, headers) => {
    switch (method) {
        case METHOD_TYPES.GET:
            return instance.get(url, payload);
        case METHOD_TYPES.POST:
            return instance.post(url, payload, { headers });
        case METHOD_TYPES.PUT:
            return instance.put(url, payload, { headers });
        case METHOD_TYPES.PATCH:
            return instance.patch(url, payload, { headers });
        case METHOD_TYPES.DELETE:
            return instance.delete(url, { data: payload});
        default:
            return null;
    }
};

export default instance;
