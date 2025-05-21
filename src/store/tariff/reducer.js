import {
    ADD_TARIFF_DATA,
    ADD_TARIFF_DATA_ERROR,
    ADD_TARIFF_DATA_PENDING,
    ADD_TARIFF_DATA_SUCCESS,
    UPDATE_TARIFF_DATA,
    UPDATE_TARIFF_DATA_ERROR,
    UPDATE_TARIFF_DATA_PENDING,
    UPDATE_TARIFF_DATA_SUCCESS,
    GET_TARIFF_LIST,
    GET_TARIFF_LIST_ERROR,
    GET_TARIFF_LIST_PENDING,
    GET_TARIFF_LIST_SUCCESS,
    DELETE_TARIFF_DATA,
    DELETE_TARIFF_DATA_ERROR,
    DELETE_TARIFF_DATA_PENDING,
    DELETE_TARIFF_DATA_SUCCESS
} from './types';

const initialState = {
    addTariffResponse: [],
    addTariffLoader: false,
    addTarifftError: [],
    editTariffResponse: [],
    editTariffLoader: false,
    editTarifftError: [],
    tariffsList: [],
    tariffsListLoader: false,
    tariffsListError: [],
    deleteTariffResponse: [],
    deleteTariffLoader: false,
    deleteTarifftError: [],
}

export default function TariffReducer(state = initialState, action) {
    switch (action.type) {
        case ADD_TARIFF_DATA_SUCCESS:
            return {
                ...state,
                addTariffResponse: action.data,
                addTariffLoader: false
            }
        case ADD_TARIFF_DATA_PENDING:
            return {
                ...state,
                addTariffLoader: true
            }
        case ADD_TARIFF_DATA_ERROR:
            return {
                ...state,
                addTarifftError: action.error,
                addTariffLoader: false
            }
        case UPDATE_TARIFF_DATA_SUCCESS:
            return {
                ...state,
                editTariffResponse: action.data,
                editTariffLoader: false
            }
        case UPDATE_TARIFF_DATA_PENDING:
            return {
                ...state,
                editTariffLoader: true
            }
        case UPDATE_TARIFF_DATA_ERROR:
            return {
                ...state,
                editTarifftError: action.error,
                editTariffLoader: false
            }
        case GET_TARIFF_LIST_SUCCESS:
            return {
                ...state,
                tariffsList: action.data,
                tariffsListLoader: false
            }
        case GET_TARIFF_LIST_PENDING:
            return {
                ...state,
                tariffsListLoader: true
            }
        case GET_TARIFF_LIST_ERROR:
            return {
                ...state,
                tariffsListError: action.error,
                tariffsListLoader: false
            }
        case DELETE_TARIFF_DATA_SUCCESS:
            return {
                ...state,
                deleteTariffResponse: action.data,
                deleteTariffLoader: false
            }
        case DELETE_TARIFF_DATA_PENDING:
            return {
                ...state,
                deleteTariffLoader: true
            }
        case DELETE_TARIFF_DATA_ERROR:
            return {
                ...state,
                deleteTariffError: action.error,
                deleteTariffLoader: false
            }
        default:
            return state;
    }
}