import { METHOD_TYPES } from '../../../shared/constants/methodTypes';
import { request } from "../../core/networkRequest";
import { ENDPOINTS } from "../../../shared/constants/endPoints";

export const getAllEnquiries = (param) => {
    const skip = Number.isFinite(Number(param?.skip)) ? Number(param.skip) : 0;
    const limit = Number.isFinite(Number(param?.limit)) ? Number(param.limit) : 10;
    const query = new URLSearchParams();
    const name = String(param?.name || "").trim();
    const mobileNumber = String(param?.mobile_number || "").trim();

    if (name) query.set("name", name);
    if (mobileNumber) query.set("mobile_number", mobileNumber);
    query.set("skip", skip);
    query.set("limit", limit);

    return request(
        METHOD_TYPES.GET,
        `${ENDPOINTS.getAllEnquiries}?${query.toString()}`
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
