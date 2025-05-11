import { LOGIN_USER_DATA } from "./types";

export function userLogin(param, fn) {
    return {
        type: LOGIN_USER_DATA,
        param,
        fn,
    };
}