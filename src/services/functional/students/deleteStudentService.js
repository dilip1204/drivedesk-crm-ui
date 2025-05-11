import { METHOD_TYPES } from '../../../shared/constants/methodTypes';
import { request } from "../../core/networkRequest";
import { ENDPOINTS } from "../../../shared/constants/endPoints";

export const deleteStudentList = (param) => {
    return request(
        METHOD_TYPES.DELETE,
        ENDPOINTS.deleteStudent+param.appId,
    )
} 