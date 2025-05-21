import { METHOD_TYPES } from '../../../shared/constants/methodTypes';
import { request } from "../../core/networkRequest";
import { ENDPOINTS } from "../../../shared/constants/endPoints";

export const editStudentList = (param) => { 
    return request(
        METHOD_TYPES.PUT,
        ENDPOINTS.editTariff+param.tariffData.plan_name,
        param.tariffData
    )
} 