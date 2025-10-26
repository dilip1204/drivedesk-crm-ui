import { METHOD_TYPES } from '../../../shared/constants/methodTypes';
import { request } from "../../core/networkRequest";
import { ENDPOINTS } from "../../../shared/constants/endPoints";

export const editExpensesList = (param) => { 
    return request(
        METHOD_TYPES.PATCH,
        ENDPOINTS.editExpenses+param.id,
        param
    )
} 