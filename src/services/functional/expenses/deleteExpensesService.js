import { METHOD_TYPES } from '../../../shared/constants/methodTypes';
import { request } from "../../core/networkRequest";
import { ENDPOINTS } from "../../../shared/constants/endPoints";

export const deleteExpensesList = (param) => {
    return request(
        METHOD_TYPES.DELETE,
        ENDPOINTS.deleteExpenses+param.id,
    )
} 