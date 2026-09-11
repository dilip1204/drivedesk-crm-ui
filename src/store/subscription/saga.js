import { call, put, takeEvery } from "redux-saga/effects";
import * as subscriptionService from "../../services/functional/subscription/subscriptionService";
import {
  GET_MY_SUBSCRIPTION, GET_MY_SUBSCRIPTION_PENDING, GET_MY_SUBSCRIPTION_SUCCESS, GET_MY_SUBSCRIPTION_ERROR,
  GET_SUBSCRIPTION_SETTINGS, GET_SUBSCRIPTION_SETTINGS_PENDING, GET_SUBSCRIPTION_SETTINGS_SUCCESS, GET_SUBSCRIPTION_SETTINGS_ERROR,
  UPDATE_SUBSCRIPTION_SETTINGS, UPDATE_SUBSCRIPTION_SETTINGS_PENDING, UPDATE_SUBSCRIPTION_SETTINGS_SUCCESS, UPDATE_SUBSCRIPTION_SETTINGS_ERROR,
  INITIALIZE_SUBSCRIPTION, INITIALIZE_SUBSCRIPTION_PENDING, INITIALIZE_SUBSCRIPTION_SUCCESS, INITIALIZE_SUBSCRIPTION_ERROR,
  RENEW_SUBSCRIPTION, RENEW_SUBSCRIPTION_PENDING, RENEW_SUBSCRIPTION_SUCCESS, RENEW_SUBSCRIPTION_ERROR,
  PROCESS_SUBSCRIPTIONS, PROCESS_SUBSCRIPTIONS_PENDING, PROCESS_SUBSCRIPTIONS_SUCCESS, PROCESS_SUBSCRIPTIONS_ERROR,
} from "./types";

const errorResponse = (error) => error?.response || error;

function* run(action, pending, success, failure, service, ...args) {
  try {
    yield put({ type: pending });
    const response = yield call(service, ...args);
    yield put({ type: success, data: response.data });
    if (typeof action.fn === "function") action.fn(response.data);
  } catch (error) {
    const normalized = errorResponse(error);
    yield put({ type: failure, error: normalized });
    if (typeof action.fn === "function") action.fn(normalized);
  }
}

function* getMine(action) { yield* run(action, GET_MY_SUBSCRIPTION_PENDING, GET_MY_SUBSCRIPTION_SUCCESS, GET_MY_SUBSCRIPTION_ERROR, subscriptionService.getMySubscription); }
function* getSettings(action) { yield* run(action, GET_SUBSCRIPTION_SETTINGS_PENDING, GET_SUBSCRIPTION_SETTINGS_SUCCESS, GET_SUBSCRIPTION_SETTINGS_ERROR, subscriptionService.getSubscriptionSettings); }
function* updateSettings(action) { yield* run(action, UPDATE_SUBSCRIPTION_SETTINGS_PENDING, UPDATE_SUBSCRIPTION_SETTINGS_SUCCESS, UPDATE_SUBSCRIPTION_SETTINGS_ERROR, subscriptionService.updateSubscriptionSettings, action.param); }
function* initialize(action) { yield* run(action, INITIALIZE_SUBSCRIPTION_PENDING, INITIALIZE_SUBSCRIPTION_SUCCESS, INITIALIZE_SUBSCRIPTION_ERROR, subscriptionService.initializeSubscription, action.param.tenantId, action.param.payload); }
function* renew(action) { yield* run(action, RENEW_SUBSCRIPTION_PENDING, RENEW_SUBSCRIPTION_SUCCESS, RENEW_SUBSCRIPTION_ERROR, subscriptionService.renewSubscription, action.param.tenantId, action.param.payload); }
function* processAll(action) { yield* run(action, PROCESS_SUBSCRIPTIONS_PENDING, PROCESS_SUBSCRIPTIONS_SUCCESS, PROCESS_SUBSCRIPTIONS_ERROR, subscriptionService.processSubscriptions); }

export function* watchSubscriptionActions() {
  yield takeEvery(GET_MY_SUBSCRIPTION, getMine);
  yield takeEvery(GET_SUBSCRIPTION_SETTINGS, getSettings);
  yield takeEvery(UPDATE_SUBSCRIPTION_SETTINGS, updateSettings);
  yield takeEvery(INITIALIZE_SUBSCRIPTION, initialize);
  yield takeEvery(RENEW_SUBSCRIPTION, renew);
  yield takeEvery(PROCESS_SUBSCRIPTIONS, processAll);
}
