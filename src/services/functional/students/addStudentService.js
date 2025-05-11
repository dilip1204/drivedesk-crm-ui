import { METHOD_TYPES } from '../../../shared/constants/methodTypes';
import { request } from "../../core/networkRequest";
import { ENDPOINTS } from "../../../shared/constants/endPoints";

export const addStudentList = (param) => {
    return request(
        METHOD_TYPES.POST,
        ENDPOINTS.addStudent,
        param.studentData,
    )
} 