import { METHOD_TYPES } from "../../../shared/constants/methodTypes";
import { request } from "../../core/networkRequest";
import { ENDPOINTS } from "../../../shared/constants/endPoints";

export const getExpenseSummary = ({ month, year, skip, limit }) => {
  const params = new URLSearchParams({
    month,
    year,
    skip: String(skip),
    limit: String(limit),
  });

  return request(METHOD_TYPES.GET, `${ENDPOINTS.getExpenseSummary}?${params.toString()}`);
};
