import { METHOD_TYPES } from '../../../shared/constants/methodTypes';
import { request } from "../../core/networkRequest";
import { ENDPOINTS } from "../../../shared/constants/endPoints";

export const editEnquiriesList = (param) => { 
    return request(
        METHOD_TYPES.PUT,
        ENDPOINTS.editEnquiries+param.enquiriesData.mobile_number,
        param.enquiriesData
    )
} 