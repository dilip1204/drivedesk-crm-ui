import { METHOD_TYPES } from '../../../shared/constants/methodTypes';
import { request } from "../../core/networkRequest";
import { ENDPOINTS } from "../../../shared/constants/endPoints";

export const editStudentList = (param) => { console.info('params.....', param)
    return request(
        METHOD_TYPES.PUT,
        ENDPOINTS.editStudent+param.studentData.application_number,
        param.studentData
    )
} 