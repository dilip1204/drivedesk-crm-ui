import { METHOD_TYPES } from '../../../shared/constants/methodTypes';
import { request } from "../../core/networkRequest";
import { ENDPOINTS } from "../../../shared/constants/endPoints";

export const userLogin = (param) => { console.info('post....', param)
    return request(
        METHOD_TYPES.POST,
        ENDPOINTS.userLogin,
        param
    )
}

export const requestLoginOtp = (mobileNumber) => {
    return request(
        METHOD_TYPES.POST,
        ENDPOINTS.requestLoginOtp,
        { mobile_number: String(mobileNumber) }
    );
};

export const verifyLoginOtp = (mobileNumber, otp) => {
    return request(
        METHOD_TYPES.POST,
        ENDPOINTS.verifyLoginOtp,
        {
            mobile_number: String(mobileNumber),
            otp: String(otp),
        }
    );
};
