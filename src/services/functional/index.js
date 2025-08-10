import * as userLogin from "./login/loginService";
import * as getAllStudentsService from "./students/getStudentsListService";
import * as addStudentList from "./students/addStudentService";
import * as deleteStudentList from "./students/deleteStudentService";
import * as editStudentList from "./students/editStudentService";
import * as addTariffList from "./tarrifs/addTariffService";
import * as editTariffList from "./tarrifs/editTariffService";
import * as getAllTariffsService from "./tarrifs/getTariffsListService";
import * as deleteTariffList from './tarrifs/deleteTariffService';
import * as addInstructorList from './instructors/addInstructorsService';
import * as editInstructorList from './instructors/editInstructorService'
import * as getAllInstructorsService from './instructors/getInstructorsListService';
import * as deleteInstructorList from './instructors/deleteInstructorService';
import * as addEnquiriesList from './enquiries/addEnquiriesService';
import * as editEnquiriesList from './enquiries/editEnquiriesService';
import * as getAllEnquiriesService from './enquiries/getEnquiriesListService';
import * as deleteEnquiriesList from './enquiries/deleteEnquiriesService';
import * as getDashboardSummaryService from './dashboard/getDashboardSummaryService';
import * as addStudentPaymentList from './students/addPaymentService';
import * as getAllTrainingsessionService from './trainingsession/getTrainingSessionListService';
import * as editTrainingSession from './trainingsession/editTrainingSessionService';

export {
    userLogin,
    getAllStudentsService,
    addStudentList,
    deleteStudentList,
    editStudentList,
    addTariffList,
    editTariffList,
    getAllTariffsService,
    deleteTariffList,
    addInstructorList,
    editInstructorList,
    getAllInstructorsService,
    deleteInstructorList,
    addEnquiriesList,
    editEnquiriesList,
    getAllEnquiriesService,
    deleteEnquiriesList,
    getDashboardSummaryService,
    addStudentPaymentList,
    getAllTrainingsessionService,
    editTrainingSession  
};