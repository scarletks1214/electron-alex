import {
  call,
  put,
  take,
  fork,
  takeLatest,
  all,
  cancel
} from "redux-saga/effects";
import { ACCOUNT } from "../reducers/types";
import axios from "axios";

function* startTask(action) {
  try {
    console.log("startTask", action.record);
    const res = yield axios.post(
      "http://localhost:5000/addtask",
      { task: action.record },
      {
        headers: {
          "Content-Type": "application/json"
        }
      }
    );
    console.log("success", res);
  } catch (e) {
    console.log("error", e);
  }
}

function* stopTask(action) {
  try {
    const res = yield axios.post(
      "http://localhost:5000/stoptask",
      { task: action.record },
      {
        headers: {
          "Content-Type": "application/json"
        }
      }
    );
    console.log("success", res);
  } catch (e) {
    console.log("error", e);
  }
}

function* checkOne(ipaddr, port, username, password) {
  try {
    console.log("checkone", ipaddr, port);
    const res = yield axios.post(
      "http://localhost:5000/checkproxy",
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
  console.log(action.accounts, action.proxies);
  let newAccounts = [];
  let proxies = action.proxies;
  let newkey = proxies && proxies.length > 0 ? proxies[0].key : -1;

  for (let i in action.accounts) {
    const account = action.accounts[i];
    if (account.proxy) {
      const str = account.proxy.split("@");
      let user = str.length > 1 ? str[0] : null;
      let proxi = str.length > 1 ? str[1] : str[0];
      if (user) {
        account.username = user.split(":")[0];
        account.prx_password = user.split(":")[1];
      }
      if (proxi) {
        account.ipaddr = proxi.split(":")[0];
        account.port = proxi.split(":")[1];
      }
    }
    console.log("account, ... ", account);
    if (
      account.ipaddr &&
      account.port &&
      proxies.findIndex(
        proxy => proxy.ipaddr == account.ipaddr && proxy.port == account.port
      ) == -1
    ) {
      if (
        yield call(
          checkOne,
          account.ipaddr,
          account.port,
          account.username,
          account.prx_password
        )
      ) {
        let proxy = `${account.ipaddr}:${account.port}`;
        if (account.username)
          proxy = `${account.username}:${account.prx_password}@${proxy}`;
        const newacc = {
          email: account.email,
          password: account.password,
          proxy
        };
        newAccounts.push(newacc);

        newkey = newkey + 1;
        const row = {
          key: newkey,
          ipaddr: account.ipaddr,
          port: account.port,
          username: account.username || "",
          password: account.prx_password || "",
          validation: [true, true],
          edit: true
        };
        proxies.unshift(row);
      } else {
        const newacc = {
          email: account.email,
          password: account.password,
          proxy: "None"
        };
        newAccounts.push(newacc);
      }
    } else {
      const proxy =
        account.ipaddr && account.port
          ? account.username
            ? `${account.username}:${account.prx_password}@${account.ipaddr}:${
                account.port
              }`
            : `${account.ipaddr}:${account.port}`
          : "None";
      const newacc = {
        email: account.email,
        password: account.password,
        proxy
      };
      newAccounts.push(newacc);
    }
  }
  yield put({ type: ACCOUNT.CHECKVALID_END, newAccounts });
}

function* takeCheck() {
  yield all([takeLatest(ACCOUNT.CHECKVALID_REQUEST, checkValidRequest)]);
}

function* checkValid() {
  let task;
  while ((task = yield fork(takeCheck))) {
    yield take(ACCOUNT.CANCEL_CHECK);
    yield cancel(task);
  }
}

function* accountSaga() {
  yield all([
    takeLatest(ACCOUNT.START_TASK, startTask),
    takeLatest(ACCOUNT.STOP_TASK, stopTask),
    fork(checkValid)
  ]);
}

export default accountSaga;
