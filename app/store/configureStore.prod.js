// @flow
import { createStore, applyMiddleware } from "redux";
import createSagaMiddleware, { END } from "redux-saga";
import rootSaga from "../sagas/index";
import { createHashHistory } from "history";
import { routerMiddleware } from "connected-react-router";
import createRootReducer from "../reducers";
import type { counterStateType } from "../reducers/types";

const sagaMiddleware = createSagaMiddleware();
const history = createHashHistory();
const rootReducer = createRootReducer(history);
const router = routerMiddleware(history);
const enhancer = applyMiddleware(sagaMiddleware, router);

function configureStore(initialState?: counterStateType) {
  const store = createStore(rootReducer, initialState, enhancer);
  store.runSaga = sagaMiddleware.run;
  store.runSaga(rootSaga);

  store.close = () => store.dispatch(END);
  return store;
}

export default { configureStore, history };
