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
import { checkProxy } from "../utils/checkProxy";

function* checkOne(ipaddr, port, username, password) {
  try {
    console.log("checkone", ipaddr, port);
    const res = yield checkProxy(`${ipaddr}:${port}`, username, password);
    return res;
  } catch (e) {
    console.log("error", e);
    return "bad";
  }
}

function* checkValidRequest(action) {
  if (action.adding) {
    const newProxies = [];
    const speed = [];
    for (let i in action.proxies) {
      const proxy = action.proxies[i];
      const resp = yield call(
        checkOne,
        proxy.ipaddr,
        proxy.port,
        proxy.username,
        proxy.password
      );
      if (resp !== "bad") {
        action.proxies[i].speed = resp;
        newProxies.push(action.proxies[i]);
      }
    }
    yield put({
      type: PROXY.CHECKVALID_END,
      newProxies,
      adding: true
    });
  } else {
    for (let i in action.proxies) {
      const res = yield call(
        checkOne,
        action.proxies[i].ipaddr,
        action.proxies[i].port,
        action.proxies[i].username,
        action.proxies[i].password
      );
      yield put({
        type: PROXY.CHECKVALID_END,
        valid: res,
        adding: false,
        key: action.proxies[i].key
      });
    }
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
