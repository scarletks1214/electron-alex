import { all, fork } from "redux-saga/effects";
import proxySaga from "./proxySaga";
import accountSaga from "./accountSaga";
import settingsSaga from "./settingsSaga";

export default function* rootSaga() {
  yield all([fork(proxySaga), fork(accountSaga), fork(settingsSaga)]);
}
