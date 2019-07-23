import React from "react";
import { render } from "react-dom";
import { AppContainer } from "react-hot-loader";
import AuthContainer from "./containers/AuthContainer";
import Root from "./containers/Root";
import { configureStore, history } from "./store/configureStore";
import "./app.global.scss";
//import "!style-loader!css-loader!antd/dist/antd.css";

const store = configureStore();

render(
  <AuthContainer>
    <Root store={store} history={history} />
  </AuthContainer>,
  document.getElementById("root")
);

if (module.hot) {
  module.hot.accept("./containers/Root", () => {
    // eslint-disable-next-line global-require
    const NextRoot = require("./containers/Root").default;
    render(
      <AuthContainer>
        <NextRoot store={store} history={history} />
      </AuthContainer>,
      document.getElementById("root")
    );
  });
}
