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
        config.headers['Content-Type'] = 'application/json';
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

        if (statusCode === 401 || isTokenExpiredDetail(responseData)) {
            forceLogout();
        }

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