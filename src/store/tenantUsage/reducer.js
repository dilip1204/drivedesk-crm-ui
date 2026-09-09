import {
  GET_TENANT_USAGE_DASHBOARD_ERROR,
  GET_TENANT_USAGE_DASHBOARD_PENDING,
  GET_TENANT_USAGE_DASHBOARD_SUCCESS,
  GET_TENANT_USAGE_LIST_ERROR,
  GET_TENANT_USAGE_LIST_PENDING,
  GET_TENANT_USAGE_LIST_SUCCESS,
} from './types';

const initialState = {
  data: null,
  loading: false,
  error: null,
  listData: null,
  listLoading: false,
  listError: null,
};

export default function tenantUsageReducer(state = initialState, action) {
  switch (action.type) {
    case GET_TENANT_USAGE_DASHBOARD_PENDING:
      return { ...state, loading: true, error: null };
    case GET_TENANT_USAGE_DASHBOARD_SUCCESS:
      return action.data?.isError
        ? { ...state, loading: false, error: action.data }
        : { ...state, data: action.data, loading: false, error: null };
    case GET_TENANT_USAGE_DASHBOARD_ERROR:
      return { ...state, loading: false, error: action.error };
    case GET_TENANT_USAGE_LIST_PENDING:
      return { ...state, listLoading: true, listError: null };
    case GET_TENANT_USAGE_LIST_SUCCESS:
      return action.data?.isError
        ? { ...state, listLoading: false, listError: action.data }
        : { ...state, listData: action.data, listLoading: false, listError: null };
    case GET_TENANT_USAGE_LIST_ERROR:
      return { ...state, listLoading: false, listError: action.error };
    default:
      return state;
  }
}
