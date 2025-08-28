import { METHOD_TYPES } from '../../../shared/constants/methodTypes';
import { request } from "../../core/networkRequest";
import { ENDPOINTS } from "../../../shared/constants/endPoints";

export const editTrainingSessionList = (param) => { //console.info('params.....', param)
    
const sessionId = param.session_id;
delete param.session_id;
    return request(
        METHOD_TYPES.PATCH,
        ENDPOINTS.editTrainingsession+sessionId,
        param
    )
} 

export const rescheduleTrainingSessionList = (param) => { //console.info('params.....', param)
    
const sessionId = param.session_id;
delete param.session_id;
    return request(
        METHOD_TYPES.PATCH,
        ENDPOINTS.rescheduleTrainingsession+sessionId+'/plan',
        param
    )
}