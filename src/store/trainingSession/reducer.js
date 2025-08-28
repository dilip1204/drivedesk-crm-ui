import {
    GET_TRAINING_SESSION_LIST_ERROR,
    GET_TRAINING_SESSION_LIST_PENDING,
    GET_TRAINING_SESSION_LIST_SUCCESS,
  
    GET_TRAINING_SESSION_FILTER_LIST_ERROR,
    GET_TRAINING_SESSION_FILTER_LIST_PENDING,
    GET_TRAINING_SESSION_FILTER_LIST_SUCCESS,

    UPDATE_TRAINING_SESSION_DATA_ERROR,
    UPDATE_TRAINING_SESSION_DATA_PENDING,
    UPDATE_TRAINING_SESSION_DATA_SUCCESS,

    RESCHDULE_TRAINING_SESSION_DATA,
    RESCHDULE_TRAINING_SESSION_DATA_ERROR,
    RESCHDULE_TRAINING_SESSION_DATA_PENDING,
    RESCHDULE_TRAINING_SESSION_DATA_SUCCESS,
  
} from './types';

const initialState = {
    trainingSessionList: [],
    trainingSessionListLoader: false,
    trainingSessionListError: [],

    trainingSessionFilterList: [],
    trainingSessionFilterListLoader: false,
    trainingSessionFilterListError: [],

    editTrainingSessionResponse: [],
    editTrainingSessionLoader: false,
    editTrainingSessionError: [],

    reTrainingSessionResponse: [],
    reTrainingSessionLoader: false,
    reTrainingSessionError: [],

}

export default function trainingSessionListReducer(state = initialState, action) {  
    switch (action.type) {
        case GET_TRAINING_SESSION_LIST_SUCCESS:
            return {
                ...state,
                trainingSessionList: action.data,
                trainingSessionListLoader: false
            }
        case GET_TRAINING_SESSION_LIST_PENDING:
            return {
                ...state,
                trainingSessionListLoader: true
            }
        case GET_TRAINING_SESSION_LIST_ERROR:
            return {
                ...state,
                trainingSessionListError: action.error,
                trainingSessionListLoader: false
            }
        case GET_TRAINING_SESSION_FILTER_LIST_SUCCESS:
            return {
                ...state,
                trainingSessionFilterList: action.data,
                trainingSessionFilterListLoader: false
            }
        case GET_TRAINING_SESSION_FILTER_LIST_PENDING:
            return {
                ...state,
                trainingSessionFilterListLoader: true
            }
        case GET_TRAINING_SESSION_FILTER_LIST_ERROR:
            return {
                ...state,
                trainingSessionFilterListError: action.error,
                trainingSessionFilterListLoader: false
            }
        case UPDATE_TRAINING_SESSION_DATA_SUCCESS:
                    return {
                        ...state,
                        editTrainingSessionResponse: action.data,
                        editTrainingSessionLoader: false
                    }
                case UPDATE_TRAINING_SESSION_DATA_PENDING:
                    return {
                        ...state,
                        editTrainingSessionLoader: true
                    }
                case UPDATE_TRAINING_SESSION_DATA_ERROR:
                    return {
                        ...state,
                        editTrainingSessionError: action.error,
                        editTrainingSessionLoader: false
                    }
        case RESCHDULE_TRAINING_SESSION_DATA_SUCCESS:
                    return {
                        ...state,
                        reTrainingSessionResponse: action.data,
                        reTrainingSessionLoader: false
                    }
                case RESCHDULE_TRAINING_SESSION_DATA_PENDING:
                    return {
                        ...state,
                        reTrainingSessionLoader: true
                    }
                case RESCHDULE_TRAINING_SESSION_DATA_ERROR:
                    return {
                        ...state,
                        reTrainingSessionError: action.error,
                        reTrainingSessionLoader: false
                    }
         
        default:
            return state;
    }
}