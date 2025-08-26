import { METHOD_TYPES } from '../../../shared/constants/methodTypes';
import { request } from "../../core/networkRequest";
import { ENDPOINTS } from "../../../shared/constants/endPoints";

export const getAllTrainingsession = (param) => { 
    return request(
        METHOD_TYPES.GET,
        ENDPOINTS.getAllTrainingsession+'?status='+param.status+'&date='+param.date
    )
} 

export const getAllTrainingsessionFilter = (param) => {
  

  const { instructor_id, start_date, end_date, status = 'All' } = param;

  let query = [];

  // Add optional query params only if present
  if (start_date) {
    query.push(`start_date=${encodeURIComponent(start_date)}`);
  }

  if (end_date) {
    query.push(`end_date=${encodeURIComponent(end_date)}`);
  }

  // Always include status (default "All")
  query.push(`status=${encodeURIComponent(status)}`);

  const queryString = `?${query.join("&")}`;
  const fullUrl = `${ENDPOINTS.getAllTrainingsessionFilter}${instructor_id}${queryString}`;

  return request(METHOD_TYPES.GET, fullUrl);
};
