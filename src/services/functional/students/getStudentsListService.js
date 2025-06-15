import { METHOD_TYPES } from '../../../shared/constants/methodTypes';
import { request } from "../../core/networkRequest";
import { ENDPOINTS } from "../../../shared/constants/endPoints";

export const getAllStudents = (param) => {
    return request(
        METHOD_TYPES.GET,
        ENDPOINTS.getAllStudents
    )
} 

export const getAllStudentsFilter = (param) => {
    return request(
        METHOD_TYPES.GET,
        ENDPOINTS.getAllStudentsFilter+'?month='+param.month+'&year='+param.year+'&status='+param.status+'&instructor_mobile='+param.instructor_mobile+'&test_scheduled='+param.test_scheduled
    )
} 

export const getStudentReceipt = (param) => {
    return request(
        METHOD_TYPES.GET,
        ENDPOINTS.getStudentReceipt+param.receipt_no
    )
}