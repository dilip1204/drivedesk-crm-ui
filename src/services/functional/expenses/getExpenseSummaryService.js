import { METHOD_TYPES } from "../../../shared/constants/methodTypes";
import { request } from "../../core/networkRequest";
import { ENDPOINTS } from "../../../shared/constants/endPoints";

export const getExpenseSummary = ({ fromDate, toDate }) => {
  const params = new URLSearchParams({
    from_date: fromDate,
    to_date: toDate,
  });

  return request(METHOD_TYPES.GET, `${ENDPOINTS.getExpenseSummary}?${params.toString()}`);
};
