import {
   // GET_DASHBOARD_SUMMARY,
    GET_DASHBOARD_SUMMARY_ERROR,
    GET_DASHBOARD_SUMMARY_PENDING,
    GET_DASHBOARD_SUMMARY_SUCCESS,
    GET_OUTSTANDING_FEES_ERROR,
    GET_OUTSTANDING_FEES_PENDING,
    GET_OUTSTANDING_FEES_SUCCESS
} from './types';

const initialState = {
    dashboardSummary: [],
    dashboardSummaryLoader: false,
    dashboardSummaryError: [],
    outstandingFees: [],
    outstandingFeesLoader: false,
    outstandingFeesError: []    
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
        case GET_OUTSTANDING_FEES_SUCCESS:
            return {
                ...state,
                outstandingFees: action.data,
                outstandingFeesLoader: false
            }
        case GET_OUTSTANDING_FEES_PENDING:
            return {
                ...state,
                outstandingFeesLoader: true
            }
        case GET_OUTSTANDING_FEES_ERROR:
            return {
                ...state,
                outstandingFeesError: action.error,
                outstandingFeesLoader: false
            }   
        default:
            return state;
    }
}