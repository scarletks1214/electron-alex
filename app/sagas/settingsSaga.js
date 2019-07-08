import { takeLatest, all } from "redux-saga/effects";
import { SETTINGS } from "../reducers/types";
import axios from "axios";

function* changeSettings(action) {
  try {
    console.log("setting change ...", action);
    const res = yield axios.post(
      "http://localhost:5000/changesetting",
      {
        duration: action.duration,
        maxProfile: action.maxProfile,
        gsearch: action.gsearch,
        youtube: action.youtube
      },
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

function* changeTargets(action) {
  try {
    console.log("targets change ...", action);
    const res = yield axios.post(
      "http://localhost:5000/changetargets",
      {
        targets: action.targets.split("\n")
      },
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

function* accountSaga() {
  yield all([
    takeLatest(SETTINGS.CHANGEALL, changeSettings),
    takeLatest(SETTINGS.SETTARGETS, changeTargets)
  ]);
}

export default accountSaga;
