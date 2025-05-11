import { combineReducers } from "redux";

import UserLoginReducer from './login/reducer';
import studentsListReducer from './students/reducer';
import StudentReducer from './addStudent/reducer';
import DeleteStudentReducer from "./deleteStudent/reducer";

export const mainReducer = combineReducers({
    loginUserInfo: UserLoginReducer,
    studentsListInfo: studentsListReducer,
    studentUpdate: StudentReducer,
    deleteStudentUpdate: DeleteStudentReducer
})