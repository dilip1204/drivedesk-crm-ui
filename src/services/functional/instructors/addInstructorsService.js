import { METHOD_TYPES } from '../../../shared/constants/methodTypes';
import { request } from "../../core/networkRequest";
import { ENDPOINTS } from "../../../shared/constants/endPoints";

export const addInstructorList = (param) => {
    return request(
        METHOD_TYPES.POST,
        ENDPOINTS.addInstructor,
        param,
    )
} 