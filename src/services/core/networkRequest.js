import axios from 'axios';
import { METHOD_TYPES } from '../../shared/constants/methodTypes'; 

const instance = axios.create({
    baseURL: process.env.REACT_APP_BASE_API_URL || '/api/',
})

let hasHandledAuthError = false;
let requestBatch = null;
let requestBatchTimer = null;

const REQUEST_BATCH_SETTLE_DELAY = 150;

const isTokenExpiredDetail = (data) => {
    const detail = data?.detail;
    return typeof detail === 'string' && detail.toLowerCase().includes('token has expired');
};

const isLoginRequest = (url = '') => {
    const normalizedUrl = String(url).split('?')[0].replace(/^\/+|\/+$/g, '');
    return normalizedUrl === 'auth/login' || normalizedUrl.startsWith('auth/login/otp/');
};

const isServerError = (error) => {
    const statusCode = error?.response?.status;
    return Number.isInteger(statusCode) && statusCode >= 500 && statusCode <= 504;
};

const startTrackedRequest = () => {
    if (requestBatchTimer) {
        clearTimeout(requestBatchTimer);
        requestBatchTimer = null;
    }

    if (!requestBatch) {
        requestBatch = {
            pending: 0,
            total: 0,
            serverFailures: [],
            hasSuccessfulResponse: false,
        };
    }

    requestBatch.pending += 1;
    requestBatch.total += 1;
};

const finishTrackedRequest = (error = null) => {
    if (!requestBatch) return;

    requestBatch.pending = Math.max(0, requestBatch.pending - 1);
    if (error) {
        if (isServerError(error)) requestBatch.serverFailures.push(error);
    } else {
        requestBatch.hasSuccessfulResponse = true;
    }

    if (requestBatch.pending > 0) return;

    // A short quiet period groups the API calls made together while loading a page.
    requestBatchTimer = setTimeout(() => {
        const completedBatch = requestBatch;
        requestBatch = null;
        requestBatchTimer = null;

        if (typeof window === 'undefined' || !completedBatch) return;

        const allRequestsFailedOnServer =
            !completedBatch.hasSuccessfulResponse &&
            completedBatch.serverFailures.length === completedBatch.total;

        if (!allRequestsFailedOnServer) {
            window.dispatchEvent(new CustomEvent('drivedesk:server-recovered'));
            return;
        }

        const lastError = completedBatch.serverFailures.at(-1);
        window.dispatchEvent(new CustomEvent('drivedesk:server-error', {
            detail: {
                statusCode: lastError?.response?.status,
                requestCount: completedBatch.total,
                occurredAt: Date.now(),
            },
        }));
    }, REQUEST_BATCH_SETTLE_DELAY);
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
        startTrackedRequest();

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
        finishTrackedRequest();
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

        finishTrackedRequest(error);

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
