import { createStore, applyMiddleware, compose } from "redux";
import createSagaMiddleware, { END } from "redux-saga";
import rootSaga from "../sagas/index";
import { createHashHistory } from "history";
import { routerMiddleware, routerActions } from "connected-react-router";
import { createLogger } from "redux-logger";
import createRootReducer from "../reducers";
import type { counterStateType } from "../reducers/types";

const sagaMiddleware = createSagaMiddleware();
const history = createHashHistory();

const rootReducer = createRootReducer(history);

const configureStore = (initialState?: counterStateType) => {
  // Redux Configuration
  const middleware = [];
  const enhancers = [];

  // Thunk Middleware
  middleware.push(sagaMiddleware);

  // Logging Middleware
  const logger = createLogger({
    level: "info",
    collapsed: true
  });

  // Skip redux logs in console during the tests
  if (process.env.NODE_ENV !== "test") {
    middleware.push(logger);
  }

  // Router Middleware
  const router = routerMiddleware(history);
  middleware.push(router);

  // Redux DevTools Configuration
  const actionCreators = {
    ...routerActions
  };
  // If Redux DevTools Extension is installed use it, otherwise use Redux compose
  /* eslint-disable no-underscore-dangle */
  const composeEnhancers = window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__
    ? window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__({
        // Options: http://extension.remotedev.io/docs/API/Arguments.html
        actionCreators
      })
    : compose;
  /* eslint-enable no-underscore-dangle */

  // Apply Middleware & Compose Enhancers
  enhancers.push(applyMiddleware(...middleware));
  const enhancer = composeEnhancers(...enhancers);

  // Create Store
  const store = createStore(rootReducer, initialState, enhancer);

  store.runSaga = sagaMiddleware.run;
  store.runSaga(rootSaga);

  store.close = () => store.dispatch(END);

  if (module.hot) {
    module.hot.accept(
      "../reducers",
      // eslint-disable-next-line global-require
      () => store.replaceReducer(require("../reducers").default)
    );
  }

  return store;
};

export default { configureStore, history };
