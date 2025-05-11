import { all } from 'redux-saga/effects';
import { watchLoginUser } from './login/saga';
import { watchStudentListInformation } from './students/saga';
import { watchAddStudent, watchEditStudent } from './addStudent/saga';
import { watchDeleteStudent } from './deleteStudent/saga';


export function* mainSaga() {
    yield all([
        watchLoginUser(),
        watchStudentListInformation(),
        watchAddStudent(),
        watchDeleteStudent(),
        watchEditStudent(),
    ])
}