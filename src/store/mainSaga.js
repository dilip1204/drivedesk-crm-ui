import { all } from 'redux-saga/effects';
import { watchLoginUser } from './login/saga';
import { watchStudentListInformation, watchStudentFilterListInformation, watchStudentReceiptInformation } from './students/saga';
import { watchAddStudent, watchEditStudent } from './addStudent/saga';
import { watchDeleteStudent } from './deleteStudent/saga';
import { watchAddTariff, watchEditTariff, watchTariffListInformation, watchDeleteTariff } from './tariff/saga';
import { watchAddInstructor, watchDeleteInstructor, watchEditInstructor, watchInstructorListInformation, watchInstructorAvailListInformation } from './instructors/saga';
import { watchAddEnquiries, watchDeleteEnquiries, watchEnquiriesListInformation, watchUpdateEnquiries, watchEnquiriesFilterListInformation } from './Enquiries/saga';
import { watchDashboardSummary, watchOutstandingFees, watchHistoricalPaymentAdjustment } from './dashboardSummary/saga'
import { watchAddStudentPayment } from './addStudentPayment/saga';
import { watchTrainingSessionListInformation, watchTrainingSessionFilterListInformation, watchEditTrainingSession, watchReschduleTrainingSession, watchStudentCompletedSession } from './trainingSession/saga';
import { watchAddExpenses, watchEditExpenses, watchDeleteExpenses, watchGetExpenses } from './expenses/saga';
import { watchAddSuperAdmin, watchUpdateSuperAdmin, watchGetSuperAdminList } from './superAdmin/saga';


export function* mainSaga() {
    yield all([
        watchLoginUser(),
        watchStudentListInformation(),
        watchAddStudent(),
        watchDeleteStudent(),
        watchEditStudent(),
        watchAddTariff(),
        watchEditTariff(),
        watchTariffListInformation(),
        watchDeleteTariff(),
        watchAddInstructor(),
        watchEditInstructor(),
        watchDeleteInstructor(),
        watchInstructorListInformation(),
        watchAddEnquiries(),
        watchEnquiriesListInformation(),
        watchUpdateEnquiries(),
        watchDeleteEnquiries(),
        watchStudentFilterListInformation(),
        watchDashboardSummary(),
        watchOutstandingFees(),
        watchHistoricalPaymentAdjustment(),
        watchStudentReceiptInformation(),
        watchAddStudentPayment(),
        watchEnquiriesFilterListInformation(),
        watchTrainingSessionListInformation(),
        watchTrainingSessionFilterListInformation(),
        watchEditTrainingSession(),
        watchReschduleTrainingSession(),
        watchInstructorAvailListInformation(),
        watchStudentCompletedSession(),
        watchAddExpenses(),
        watchEditExpenses(),
        watchDeleteExpenses(),
        watchGetExpenses(),
        watchAddSuperAdmin(),
        watchUpdateSuperAdmin(),
        watchGetSuperAdminList(),
    ])
}