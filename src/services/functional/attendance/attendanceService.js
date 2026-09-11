import { METHOD_TYPES } from "../../../shared/constants/methodTypes";
import { ENDPOINTS } from "../../../shared/constants/endPoints";
import { request } from "../../core/networkRequest";

export const getAttendanceRecords = ({ date, personType }) => {
  const query = new URLSearchParams({
    date,
    person_type: personType,
  });

  return request(METHOD_TYPES.GET, `${ENDPOINTS.getAttendance}?${query.toString()}`);
};

export const saveAttendanceRecords = (payload) =>
  request(METHOD_TYPES.POST, ENDPOINTS.saveAttendance, payload);
