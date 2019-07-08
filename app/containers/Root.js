// @flow
import React, { Component } from "react";
import { Provider } from "react-redux";
import { ConnectedRouter } from "connected-react-router";
import type { Store } from "../reducers/types";
import Routes from "../Routes";
import socketIOClient from "socket.io-client";

import { connect } from "react-redux";
import { ACCOUNT } from "../reducers/types";

type Props = {
  store: Store,
  history: {}
};

class Root extends Component<Props> {
  componentDidMount() {
    const endpoint = "http://localhost:5000";
    const socket = socketIOClient(endpoint);
    socket.on("actionLog", data => {
      this.props.changeField(data.email, "actionlog", data.status);
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
    }
  };
}

export default connect(
  null,
  mapDispatchToProps
)(Root);
