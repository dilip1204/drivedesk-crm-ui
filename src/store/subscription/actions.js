import {
  GET_MY_SUBSCRIPTION,
  GET_SUBSCRIPTION_SETTINGS,
  INITIALIZE_SUBSCRIPTION,
  PROCESS_SUBSCRIPTIONS,
  RENEW_SUBSCRIPTION,
  UPDATE_SUBSCRIPTION_SETTINGS,
  RESET_SUBSCRIPTION_STATE,
} from "./types";

export const getMySubscription = (fn) => ({ type: GET_MY_SUBSCRIPTION, fn });
export const getSubscriptionSettings = (fn) => ({ type: GET_SUBSCRIPTION_SETTINGS, fn });
export const updateSubscriptionSettings = (param, fn) => ({ type: UPDATE_SUBSCRIPTION_SETTINGS, param, fn });
export const initializeSubscription = (param, fn) => ({ type: INITIALIZE_SUBSCRIPTION, param, fn });
export const renewSubscription = (param, fn) => ({ type: RENEW_SUBSCRIPTION, param, fn });
export const processSubscriptions = (fn) => ({ type: PROCESS_SUBSCRIPTIONS, fn });
export const resetSubscriptionState = () => ({ type: RESET_SUBSCRIPTION_STATE });
