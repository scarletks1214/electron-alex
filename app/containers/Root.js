// @flow
import React, { Component } from "react";
import { Provider } from "react-redux";
import { ConnectedRouter } from "connected-react-router";
import type { Store } from "../reducers/types";
import Routes from "../Routes";

import { connect } from "react-redux";
import { ACCOUNT, PROXY } from "../reducers/types";

const fs = require("fs");
const ipcRenderer = require("electron").ipcRenderer;

type Props = {
  store: Store,
  history: {}
};

class Root extends Component<Props> {
  componentDidMount() {
    if (this.props.socket.readyState) {
      this.props.socket.send(JSON.stringify({ event: "latestVersion" }));
    } else {
      this.props.socket.onopen = () => {
        console.log("socket connected");
        this.props.socket.send(JSON.stringify({ event: "latestVersion" }));
      };
    }

    const accPath = __dirname + "/__accs.json";
    const prxPath = __dirname + "/__prxs.json";
    ipcRenderer.on("actionLog", (event, data) => {
      this.props.changeField(data.email, "actionlog", data.status);
      if (data.status === "Scheming") {
        this.props.changeField(data.email, "actions-0", true);
      }
    });
    ipcRenderer.on("oneClick", (event, data) => {
      this.props.changeOneClick(data.email, data.value);
    });
    ipcRenderer.on("eye", (event, data) => {
      this.props.changeField(data.email, "actions-1", false);
    });
    ipcRenderer.on("saveAccounts", () => {
      const { accounts, proxies } = this.props;
      fs.writeFileSync(accPath, JSON.stringify(accounts), err => {
        if (err) {
          alert("An error ocurred creating the file :" + err.message);
          return;
        }
      });
      fs.writeFileSync(prxPath, JSON.stringify(proxies), err => {
        if (err) {
          alert("An error ocurred creating the file :" + err.message);
          return;
        }
      });
    });

    fs.readFile(accPath, "utf-8", (err, data) => {
      if (err) {
        console.log("An error ocurred reading the file :" + err.message);
        return;
      } else {
        this.props.addAccounts(JSON.parse(data));
      }
    });

    fs.readFile(prxPath, "utf-8", (err, data) => {
      if (err) {
        console.log("An error ocurred reading the file :" + err.message);
        return;
      } else {
        this.props.addProxies(JSON.parse(data));
      }
    });
  }
  render() {
    const { store, history } = this.props;
    return (
      <Provider store={store}>
        <ConnectedRouter history={history}>
          <Routes />
        </ConnectedRouter>
      </Provider>
    );
  }
}

function mapStateToProps(state) {
  return {
    accounts: state.accounts.accountList,
    proxies: state.proxies.proxyList
  };
}

function mapDispatchToProps(dispatch) {
  return {
    changeField: (email, field, value) => {
      dispatch({
        type: ACCOUNT.CHANGEFIELD,
        email,
        field,
        value
      });
    },
    changeOneClick: (email, value) => {
      dispatch({
        type: ACCOUNT.CHANGEONECLICK,
        email,
        value
      });
    },
    addAccounts: accounts => {
      dispatch({
        type: ACCOUNT.CHECKVALID_END,
        newAccounts: accounts
      });
    },
    addProxies: proxies => {
      dispatch({
        type: PROXY.CHECKVALID_END,
        newProxies: proxies,
        adding: true
      });
    }
  };
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(Root);
