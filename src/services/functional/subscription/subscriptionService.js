import { METHOD_TYPES } from "../../../shared/constants/methodTypes";
import { ENDPOINTS } from "../../../shared/constants/endPoints";
import { request } from "../../core/networkRequest";

export const getMySubscription = () =>
  request(METHOD_TYPES.GET, `${ENDPOINTS.subscription}/me`);

export const initializeSubscription = (tenantId, payload) =>
  request(
    METHOD_TYPES.PATCH,
    `${ENDPOINTS.subscription}/${encodeURIComponent(tenantId)}/initialize`,
    payload
  );

export const renewSubscription = (tenantId, payload) =>
  request(
    METHOD_TYPES.PATCH,
    `${ENDPOINTS.subscription}/${encodeURIComponent(tenantId)}/renew`,
    payload
  );

export const processSubscriptions = () =>
  request(METHOD_TYPES.POST, `${ENDPOINTS.subscription}/process`, {});

export const getSubscriptionSettings = () =>
  request(METHOD_TYPES.GET, ENDPOINTS.subscriptionSettings);

export const updateSubscriptionSettings = (payload) =>
  request(METHOD_TYPES.PATCH, ENDPOINTS.subscriptionSettings, payload);

