import { METHOD_TYPES } from '../../../shared/constants/methodTypes';
import { request } from "../../core/networkRequest";
import { ENDPOINTS } from "../../../shared/constants/endPoints";

export const editInstructorList = (param) => {
    const { original_mobile_number, ...updatePayload } = param;
    const instructorMobileNumber = original_mobile_number || param.mobile_number;

    return request(
        METHOD_TYPES.PUT,
        ENDPOINTS.editInstructor + encodeURIComponent(instructorMobileNumber),
        updatePayload
    )
} 
