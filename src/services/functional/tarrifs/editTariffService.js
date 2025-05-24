import { METHOD_TYPES } from '../../../shared/constants/methodTypes';
import { request } from "../../core/networkRequest";
import { ENDPOINTS } from "../../../shared/constants/endPoints";

export const editTariffList = (param) => { 
    return request(
        METHOD_TYPES.PUT,
        ENDPOINTS.editTariff+param.plan_name,
        param
    )
} 