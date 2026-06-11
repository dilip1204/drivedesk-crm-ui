import { METHOD_TYPES } from '../../../shared/constants/methodTypes';
import { request } from "../../core/networkRequest";
import { ENDPOINTS } from "../../../shared/constants/endPoints";

export const editStudentList = (param) => { //console.info('params.....', param)
    return request(
        METHOD_TYPES.PATCH,
        ENDPOINTS.editStudent+param.mobile_number,
        param.studentData
    )
} 