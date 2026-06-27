import { 
    GET_DASHBOARD_SUMMARY,
    GET_OUTSTANDING_FEES,
    HISTORICAL_PAYMENT_ADJUSTMENT,
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

export function historicalPaymentAdjustment(param, fn) {
    return {
        type: HISTORICAL_PAYMENT_ADJUSTMENT,
        param,
        fn,
    }
}