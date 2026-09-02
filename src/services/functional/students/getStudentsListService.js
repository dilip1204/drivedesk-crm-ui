import { METHOD_TYPES } from '../../../shared/constants/methodTypes';
import { request } from "../../core/networkRequest";
import { ENDPOINTS } from "../../../shared/constants/endPoints";

const MAX_STUDENT_PAGE_SIZE = 100;

export const getAllStudents = (param = {}) => {
    const requestedSkip = Number(param.skip);
    const requestedLimit = Number(param.limit);
    const skip = Number.isFinite(requestedSkip) && requestedSkip >= 0
        ? Math.floor(requestedSkip)
        : 0;
    const limit = Number.isFinite(requestedLimit) && requestedLimit > 0
        ? Math.min(Math.floor(requestedLimit), MAX_STUDENT_PAGE_SIZE)
        : 10;
    const query = new URLSearchParams({
        skip: String(skip),
        limit: String(limit),
    });

    return request(
        METHOD_TYPES.GET,
        `${ENDPOINTS.getAllStudents}?${query.toString()}`
    );
};

export const getAllStudentsFilter = (param = {}) => {
  const query = new URLSearchParams();

  Object.entries(param).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") {
      query.append(key, value);
    }
  });

  const url = `${ENDPOINTS.getAllStudentsFilter}?${query.toString()}`;

  return request(METHOD_TYPES.GET, url);
};


export const getStudentReceipt = (param) => {
    return request(
        METHOD_TYPES.GET,
        ENDPOINTS.getStudentReceipt+param.receipt_no
    )
}
