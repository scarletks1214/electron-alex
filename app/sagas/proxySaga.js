import {
  call,
  put,
  take,
  fork,
  takeLatest,
  all,
  cancel
} from "redux-saga/effects";
import { PROXY } from "../reducers/types";
import axios from "axios";

function* checkOne(ipaddr, port, username, password) {
  try {
    console.log("checkone", ipaddr, port);
    const res = yield axios.post(
      "http://localhost:5011/checkproxy",
      {
        myProxy: `${ipaddr}:${port}`,
        username,
        password
      },
      {
        headers: {
          "Content-Type": "application/json"
        }
      }
    );
    return res.data;
  } catch (e) {
    console.log("error", e);
    return false;
  }
}

function* checkValidRequest(action) {
  if (action.adding) {
    let newProxies = [];
    for (let i in action.proxies) {
      const proxy = action.proxies[i];
      if (
        yield call(
          checkOne,
          proxy.ipaddr,
          proxy.port,
          proxy.username,
          proxy.password
        )
      )
        newProxies.push(action.proxies[i]);
    }
    yield put({ type: PROXY.CHECKVALID_END, newProxies, adding: true });
  } else {
    const res = yield call(
      checkOne,
      action.proxies[0].ipaddr,
      action.proxies[0].port,
      action.proxies[0].username,
      action.proxies[0].password
    );
    yield put({
      type: PROXY.CHECKVALID_END,
      valid: res,
      adding: false,
      key: action.proxies[0].key
    });
  }
}

function* takeCheck() {
  yield all([takeLatest(PROXY.CHECKVALID_REQUEST, checkValidRequest)]);
}

function* proxySagas() {
  let task;
  while ((task = yield fork(takeCheck))) {
    yield take(PROXY.CANCEL_CHECK);
    yield cancel(task);
  }
}

export default proxySagas;
