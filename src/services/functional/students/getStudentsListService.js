import { METHOD_TYPES } from '../../../shared/constants/methodTypes';
import { request } from "../../core/networkRequest";
import { ENDPOINTS } from "../../../shared/constants/endPoints";

export const getAllStudents = (param) => { 
    return request(
        METHOD_TYPES.GET,
        ENDPOINTS.getAllStudents+'?skip='+param.skip+'&limit='+param.limit
    )
} 

export const getAllStudentsFilter = (param = {}) => {
  const query = new URLSearchParams();

  Object.entries(param).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") {
      query.append(key, value);
    }
  });

  const url = `${ENDPOINTS.getAllStudentsFilter}?${query.toString()}`+'';

  return request(METHOD_TYPES.GET, url);
};


export const getStudentReceipt = (param) => {
    return request(
        METHOD_TYPES.GET,
        ENDPOINTS.getStudentReceipt+param.receipt_no
    )
}