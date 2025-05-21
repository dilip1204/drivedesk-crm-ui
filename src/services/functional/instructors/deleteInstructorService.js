import { METHOD_TYPES } from '../../../shared/constants/methodTypes';
import { request } from "../../core/networkRequest";
import { ENDPOINTS } from "../../../shared/constants/endPoints";

export const deleteInstructorList = (param) => {
    return request(
        METHOD_TYPES.DELETE,
        ENDPOINTS.deleteInstructor+param.appId,
    )
} 