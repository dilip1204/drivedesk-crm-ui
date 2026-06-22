import { 
    GET_DASHBOARD_SUMMARY,
    GET_OUTSTANDING_FEES,
 } from "./types";


export function getDashboardSummary(param, fn) { 
    return {
        type: GET_DASHBOARD_SUMMARY,
        param,
        fn,
    }
}

export function getOutstandingFees( param,fn) {
    return {
        type: GET_OUTSTANDING_FEES,
        param,
        fn,
    }
}