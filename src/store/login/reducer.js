import {
   // LOGIN_USER_DATA,
    LOGIN_USER_DATA_ERROR,
    LOGIN_USER_DATA_PENDING,
    LOGIN_USER_DATA_SUCCESS
} from './types';

const initialState = {
    userLoginResponse: [],
    userLoginLoader: false,
    userLoginError: [],
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
        default:
            return state;
    }
}