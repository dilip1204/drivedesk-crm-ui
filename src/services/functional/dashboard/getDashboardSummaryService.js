import { METHOD_TYPES } from '../../../shared/constants/methodTypes';
import { request } from "../../core/networkRequest";
import { ENDPOINTS } from "../../../shared/constants/endPoints";

export const getDashboardSummary = (param) => {
    return request(
        METHOD_TYPES.GET,
        ENDPOINTS.getDashboardSummary+'?month='+param.month+'&year='+param.year
    )
} 

export const getOutstandingFees = () => {
    return request(
        METHOD_TYPES.GET,
        ENDPOINTS.getOutstandingFees+'?skip=0&limit=50'
    )
} 