import { METHOD_TYPES } from '../../../shared/constants/methodTypes';
import { request } from "../../core/networkRequest";
import { ENDPOINTS } from "../../../shared/constants/endPoints";

export const getAllEnquiries = (param) => {
    return request(
        METHOD_TYPES.GET,
        ENDPOINTS.getAllEnquiries    )
}

export const getAllEnquiriesFilter = (param) => {
    return request(
        METHOD_TYPES.GET,
        ENDPOINTS.getAllEnquiriesFilter+'?status='+param.status+'&month='+param.month+'&year='+param.year
    )
} 

export const getAllStudentsFilter = (param) => {
    return request(
        METHOD_TYPES.GET,
        ENDPOINTS.getAllStudentsFilter+'?month='+param.month+'&year='+param.year+'&status='+param.status+'&instructor_name='+param.instructor_name+'&test_date='+param.test_date
    )
} 