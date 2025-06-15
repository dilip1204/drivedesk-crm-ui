import { combineReducers } from "redux";

import UserLoginReducer from './login/reducer';
import studentsListReducer from './students/reducer';
import StudentReducer from './addStudent/reducer';
import DeleteStudentReducer from "./deleteStudent/reducer";
import TariffReducer from "./tariff/reducer";
import InstructorReducer from "./instructors/reducer";
import EnquiriesReducer from "./Enquiries/reducer";
import dashboardSummaryReducer from "./dashboardSummary/reducer";
import StudentPaymentReducer from "./addStudentPayment/reducer";


export const mainReducer = combineReducers({
    loginUserInfo: UserLoginReducer,
    studentsListInfo: studentsListReducer,
    studentUpdate: StudentReducer,
    deleteStudentUpdate: DeleteStudentReducer,
    tariffUpdate: TariffReducer,
    instructorInfo: InstructorReducer,
    enquiriesInfo: EnquiriesReducer,
    dashboardSummary: dashboardSummaryReducer,
    studentPaymentInfo: StudentPaymentReducer
})