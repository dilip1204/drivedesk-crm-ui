import {
  GET_MY_SUBSCRIPTION_PENDING, GET_MY_SUBSCRIPTION_SUCCESS, GET_MY_SUBSCRIPTION_ERROR,
  GET_SUBSCRIPTION_SETTINGS_PENDING, GET_SUBSCRIPTION_SETTINGS_SUCCESS, GET_SUBSCRIPTION_SETTINGS_ERROR,
  UPDATE_SUBSCRIPTION_SETTINGS_PENDING, UPDATE_SUBSCRIPTION_SETTINGS_SUCCESS, UPDATE_SUBSCRIPTION_SETTINGS_ERROR,
  INITIALIZE_SUBSCRIPTION_PENDING, INITIALIZE_SUBSCRIPTION_SUCCESS, INITIALIZE_SUBSCRIPTION_ERROR,
  RENEW_SUBSCRIPTION_PENDING, RENEW_SUBSCRIPTION_SUCCESS, RENEW_SUBSCRIPTION_ERROR,
  PROCESS_SUBSCRIPTIONS_PENDING, PROCESS_SUBSCRIPTIONS_SUCCESS, PROCESS_SUBSCRIPTIONS_ERROR,
  RESET_SUBSCRIPTION_STATE,
} from "./types";

const initialState = {
  mySubscription: null,
  mySubscriptionLoading: false,
  mySubscriptionError: null,
  settings: null,
  settingsLoading: false,
  settingsError: null,
  mutationLoading: false,
  mutationError: null,
  processResult: null,
};

export default function subscriptionReducer(state = initialState, action) {
  switch (action.type) {
    case RESET_SUBSCRIPTION_STATE: return initialState;
    case GET_MY_SUBSCRIPTION_PENDING: return { ...state, mySubscriptionLoading: true, mySubscriptionError: null };
    case GET_MY_SUBSCRIPTION_SUCCESS: return { ...state, mySubscription: action.data?.response ?? action.data, mySubscriptionLoading: false };
    case GET_MY_SUBSCRIPTION_ERROR: return { ...state, mySubscriptionError: action.error, mySubscriptionLoading: false };
    case GET_SUBSCRIPTION_SETTINGS_PENDING: return { ...state, settingsLoading: true, settingsError: null };
    case GET_SUBSCRIPTION_SETTINGS_SUCCESS: return { ...state, settings: action.data?.response ?? action.data, settingsLoading: false };
    case GET_SUBSCRIPTION_SETTINGS_ERROR: return { ...state, settingsError: action.error, settingsLoading: false };
    case UPDATE_SUBSCRIPTION_SETTINGS_PENDING:
    case INITIALIZE_SUBSCRIPTION_PENDING:
    case RENEW_SUBSCRIPTION_PENDING: return { ...state, mutationLoading: true, mutationError: null };
    case UPDATE_SUBSCRIPTION_SETTINGS_SUCCESS: return { ...state, settings: action.data?.response ?? action.data ?? state.settings, mutationLoading: false };
    case INITIALIZE_SUBSCRIPTION_SUCCESS:
    case RENEW_SUBSCRIPTION_SUCCESS: return { ...state, mutationLoading: false };
    case UPDATE_SUBSCRIPTION_SETTINGS_ERROR:
    case INITIALIZE_SUBSCRIPTION_ERROR:
    case RENEW_SUBSCRIPTION_ERROR: return { ...state, mutationLoading: false, mutationError: action.error };
    case PROCESS_SUBSCRIPTIONS_PENDING: return { ...state, mutationLoading: true, mutationError: null, processResult: null };
    case PROCESS_SUBSCRIPTIONS_SUCCESS: return { ...state, mutationLoading: false, processResult: action.data?.response ?? action.data };
    case PROCESS_SUBSCRIPTIONS_ERROR: return { ...state, mutationLoading: false, mutationError: action.error };
    default: return state;
  }
}
