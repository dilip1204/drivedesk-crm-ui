import {
 // ADD_ENQUIRIES_DATA,
  ADD_ENQUIRIES_DATA_ERROR,
  ADD_ENQUIRIES_DATA_PENDING,
  ADD_ENQUIRIES_DATA_SUCCESS,
 // UPDATE_ENQUIRIES_DATA,
  UPDATE_ENQUIRIES_DATA_ERROR,
  UPDATE_ENQUIRIES_DATA_PENDING,
  UPDATE_ENQUIRIES_DATA_SUCCESS,
//  GET_ENQUIRIES_LIST,
  GET_ENQUIRIES_LIST_ERROR,
  GET_ENQUIRIES_LIST_PENDING,
  GET_ENQUIRIES_LIST_SUCCESS,
//  DELETE_ENQUIRIES_DATA,
  DELETE_ENQUIRIES_DATA_ERROR,
  DELETE_ENQUIRIES_DATA_PENDING,
  DELETE_ENQUIRIES_DATA_SUCCESS,

  GET_ENQUIRIES_FILTER_LIST_ERROR,
  GET_ENQUIRIES_FILTER_LIST_PENDING,
  GET_ENQUIRIES_FILTER_LIST_SUCCESS,
} from './types';

const initialState = {
  addEnquiriesResponse: [],
  addEnquiriesLoader: false,
  addEnquiriesError: [],
  editEnquiriesResponse: [],
  editEnquiriesLoader: false,
  editEnquiriesError: [],
  enquiriesList: [],
  enquiriesListLoader: false,
  enquiriesListError: [],
  deleteEnquiriesResponse: [],
  deleteEnquiriesLoader: false,
  deleteEnquiriesError: [],

  enquiriesFilterList: [],
  enquiriesFilterListLoader: false,
  enquiriesFilterListError: [],
};

export default function EnquiriesReducer(state = initialState, action) {
  switch (action.type) {
    case ADD_ENQUIRIES_DATA_SUCCESS:
      return {
        ...state,
        addEnquiriesResponse: action.data,
        addEnquiriesLoader: false
      };
    case ADD_ENQUIRIES_DATA_PENDING:
      return {
        ...state,
        addEnquiriesLoader: true
      };
    case ADD_ENQUIRIES_DATA_ERROR:
      return {
        ...state,
        addEnquiriesError: action.error,
        addEnquiriesLoader: false
      };

    case UPDATE_ENQUIRIES_DATA_SUCCESS:
      return {
        ...state,
        editEnquiriesResponse: action.data,
        editEnquiriesLoader: false
      };
    case UPDATE_ENQUIRIES_DATA_PENDING:
      return {
        ...state,
        editEnquiriesLoader: true
      };
    case UPDATE_ENQUIRIES_DATA_ERROR:
      return {
        ...state,
        editEnquiriesError: action.error,
        editEnquiriesLoader: false
      };

    case GET_ENQUIRIES_LIST_SUCCESS:
      return {
        ...state,
        enquiriesList: action.data,
        enquiriesListLoader: false
      };
    case GET_ENQUIRIES_LIST_PENDING:
      return {
        ...state,
        enquiriesListLoader: true
      };
    case GET_ENQUIRIES_LIST_ERROR:
      return {
        ...state,
        enquiriesListError: action.error,
        enquiriesListLoader: false
      };

    case DELETE_ENQUIRIES_DATA_SUCCESS:
      return {
        ...state,
        deleteEnquiriesResponse: action.data,
        deleteEnquiriesLoader: false
      };
    case DELETE_ENQUIRIES_DATA_PENDING:
      return {
        ...state,
        deleteEnquiriesLoader: true
      };
    case DELETE_ENQUIRIES_DATA_ERROR:
      return {
        ...state,
        deleteEnquiriesError: action.error,
        deleteEnquiriesLoader: false
      };

      case GET_ENQUIRIES_FILTER_LIST_SUCCESS:
          return {
              ...state,
              enquiriesFilterList: action.data,
              enquiriesFilterListLoader: false
          }
      case GET_ENQUIRIES_FILTER_LIST_PENDING:
          return {
              ...state,
              enquiriesFilterListLoader: true
          }
      case GET_ENQUIRIES_FILTER_LIST_ERROR:
          return {
              ...state,
              enquiriesFilterListError: action.error,
              enquiriesFilterListLoader: false
          }

    default:
      return state;
  }
}
