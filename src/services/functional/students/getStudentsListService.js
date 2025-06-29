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
        ENDPOINTS.getAllStudentsFilter+'?month='+param.month+'&year='+param.year+'&status='+param.status+'&instructor_name='+param.instructor_name+'&test_date='+param.test_date
    )
} 

export const getStudentReceipt = (param) => {
    return request(
        METHOD_TYPES.GET,
        ENDPOINTS.getStudentReceipt+param.receipt_no
    )
}