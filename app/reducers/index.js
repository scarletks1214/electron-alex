import { combineReducers } from "redux";
import { connectRouter } from "connected-react-router";
import accountReducer from "./accountReducer";
import proxyReducer from "./proxyReducer";
import settingsReducer from "./settingsReducer";

export default function createRootReducer(history) {
  return combineReducers({
    router: connectRouter(history),
    accounts: accountReducer,
    proxies: proxyReducer,
    settings: settingsReducer
  });
}
