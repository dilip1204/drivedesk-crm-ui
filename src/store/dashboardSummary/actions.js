import { 
    GET_DASHBOARD_SUMMARY
 } from "./types";


export function getDashboardSummary(param, fn) { 
    return {
        type: GET_DASHBOARD_SUMMARY,
        param,
        fn,
    }
}
