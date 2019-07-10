// @flow
import React, { Component } from "react";
import { Provider } from "react-redux";
import { ConnectedRouter } from "connected-react-router";
import type { Store } from "../reducers/types";
import Routes from "../Routes";

import { connect } from "react-redux";
import { ACCOUNT } from "../reducers/types";

const ipcRenderer = require("electron").ipcRenderer;

type Props = {
  store: Store,
  history: {}
};

class Root extends Component<Props> {
  componentDidMount() {
    // const endpoint = "http://localhost:5000";
    // const socket = socketIOClient(endpoint);
    // socket.on("actionLog", data => {
    //   this.props.changeField(data.email, "actionlog", data.status);
    // });
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
    }
  };
}

export default connect(
  null,
  mapDispatchToProps
)(Root);
