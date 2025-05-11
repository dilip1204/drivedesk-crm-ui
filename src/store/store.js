import { createStore, applyMiddleware } from 'redux';
import createSagaMiddleWare from 'redux-saga';

import { mainSaga } from './mainSaga';
import { mainReducer } from './mainReducer';
import logger from 'redux-logger';

const sagaMiddleware = createSagaMiddleWare();

const store = createStore(mainReducer, applyMiddleware(sagaMiddleware, logger));

sagaMiddleware.run(mainSaga);

export default store;