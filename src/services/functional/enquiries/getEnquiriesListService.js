import { METHOD_TYPES } from '../../../shared/constants/methodTypes';
import { request } from "../../core/networkRequest";
import { ENDPOINTS } from "../../../shared/constants/endPoints";

export const getAllEnquiries = (param) => {
    const skip = Number.isFinite(Number(param?.skip)) ? Number(param.skip) : 0;
    const limit = Number.isFinite(Number(param?.limit)) ? Number(param.limit) : 10;
    return request(
        METHOD_TYPES.GET,
        `${ENDPOINTS.getAllEnquiries}?skip=${skip}&limit=${limit}`
    )
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