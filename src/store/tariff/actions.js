import { 
    ADD_TARIFF_DATA,
    UPDATE_TARIFF_DATA,
    GET_TARIFF_LIST,
    DELETE_TARIFF_DATA
 } from "./types";

export function addTariff(param, fn) {
    return {
        type: ADD_TARIFF_DATA,
        param,
        fn,
    }
}

export function updateTariff(param, fn) {
    return {
        type: UPDATE_TARIFF_DATA,
        param,
        fn,
    }
}

export function getTariffsListInformation(param, fn) { 
    return {
        type: GET_TARIFF_LIST,
        param,
        fn,
    }
}

export function deleteTariff(param, fn) {
    return {
        type: DELETE_TARIFF_DATA,
        param,
        fn,
    }
}