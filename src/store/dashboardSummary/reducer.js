import {
   // GET_DASHBOARD_SUMMARY,
    GET_DASHBOARD_SUMMARY_ERROR,
    GET_DASHBOARD_SUMMARY_PENDING,
    GET_DASHBOARD_SUMMARY_SUCCESS
} from './types';

const initialState = {
    dashboardSummary: [],
    dashboardSummaryLoader: false,
    dashboardSummaryError: [],

}

export default function dashboardSummaryReducer(state = initialState, action) {
    switch (action.type) {
        case GET_DASHBOARD_SUMMARY_SUCCESS:
            return {
                ...state,
                dashboardSummary: action.data,
                dashboardSummaryLoader: false
            }
        case GET_DASHBOARD_SUMMARY_PENDING:
            return {
                ...state,
                dashboardSummaryLoader: true
            }
        case GET_DASHBOARD_SUMMARY_ERROR:
            return {
                ...state,
                dashboardSummaryError: action.error,
                dashboardSummaryLoader: false
            }
        
        default:
            return state;
    }
}