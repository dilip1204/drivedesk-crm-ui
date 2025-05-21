import { METHOD_TYPES } from '../../../shared/constants/methodTypes';
import { request } from "../../core/networkRequest";
import { ENDPOINTS } from "../../../shared/constants/endPoints";

export const editInstructorList = (param) => { 
    return request(
        METHOD_TYPES.PUT,
        ENDPOINTS.editInstructor+param.mobile_number,
        param
    )
} 