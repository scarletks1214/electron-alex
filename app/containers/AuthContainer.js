import React from "react";
import { Input, Icon, Col, Row, Typography, notification } from "antd";
import { Button } from "antd/lib/radio";
import styles from "./AuthContainer.scss";
import { ipcRenderer } from "electron";
import socketIOClient from "socket.io-client";
import macaddress from "macaddress";

import socketUrl from "../utils";

const { app } = require("electron").remote;
const { Text } = Typography;

class AuthContainer extends React.Component {
  socket = null;
  apiKey = "";
  constructor(props) {
    super(props);
    this.state = {
      authenticated: false,
      loading: false
    };

    const apiKey = ipcRenderer.sendSync("getApiKey");
    if (apiKey) {
      this.apiKey = apiKey;
    }
  }
  componentDidMount() {
    this.socket = new socketIOClient(socketUrl);
    this.socket.emit("checkVersion");

    this.socket.on("keyCheckResult", data => {
      if (!data.code) {
        this.setState({ authenticated: true, loading: false });
        ipcRenderer.send("activated", { apiKey: this.apiKey });
      } else {
        notification.error({
          placement: "bottomRight",
          duration: 3,
          message: "Error",
          description: data.message
        });
        this.setState({ loading: false });
      }
    });

    this.socket.on("checkVersionResult", data => {
      const { version, link } = data;
      if (version !== app.getVersion())
        this.newVersionNotification(version, link);
    });
    this.socket.on("newVersion", data => {
      const { version, link } = data;
      this.newVersionNotification(version, link);
    });
  }
  newVersionNotification = (version, link) => {
    notification.info({
      placement: "topRight",
      message: "New version is available",
      duration: 0,
      description: (
        <div>
          Download the new version {version}
          <a href={link} target="_blank" style={{ marginLeft: "5px" }}>
            here
          </a>
        </div>
      )
    });
  };
  closeWindow = () => {
    ipcRenderer.send("closeWindow");
  };
  activateUser = () => {
    this.setState({ loading: true });
    macaddress.one((err, mac) => {
      this.socket.emit("keyCheck", mac, this.apiKey);
      ipcRenderer.send("activated");
      this.setState({ loading: true, authenticated: true });
    });
  };
  setApiKey = e => {
    this.apiKey = e.target.value;
  };
  render() {
    const { authenticated, loading } = this.state;
    return authenticated ? (
      this.props.children
    ) : (
      <div className={styles.authcontainer}>
        <Row>
          <Col span={7} className={styles.sider}>
            <img style={{ height: "100px" }} src="logo.svg" />
          </Col>
          <Col span={17}>
            <div className={styles.header}>
              <Icon
                type="close"
                onClick={this.closeWindow}
                className={styles.windowicon}
              />
            </div>
            <div className="body">
              <Text
                style={{
                  color: "white",
                  fontSize: "14px"
                }}
                strong
              >
                Authenticate Your License
              </Text>
              <Input
                defaultValue={this.apiKey}
                style={{ width: "300px", marginTop: "10px" }}
                placeholder="Enter your key"
                onChange={this.setApiKey}
              />
            </div>
            <div className={styles.footer}>
              <Button
                style={{
                  alignSelf: "center",
                  background: "#23272a",
                  color: "white"
                }}
                onClick={this.activateUser}
              >
                {loading ? (
                  <div>
                    <Icon type="loading" style={{ marginRight: "20px" }} />
                    <Text strong style={{ color: "white" }}>
                      Please wait ....
                    </Text>
                  </div>
                ) : (
                  <div>
                    <Icon type="poweroff" style={{ marginRight: "20px" }} />
                    <Text strong style={{ color: "white" }}>
                      Activate
                    </Text>
                  </div>
                )}
              </Button>
            </div>
          </Col>
        </Row>
      </div>
    );
  }
}

export default AuthContainer;
