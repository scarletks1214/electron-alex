import React from "react";
import { Input, Icon, Col, Row, Typography, notification } from "antd";
import { Button } from "antd/lib/radio";
import styles from "./AuthContainer.scss";
import { ipcRenderer } from "electron";
import macaddress from "macaddress";
import Websocket from "ws";
import axios from 'axios'

import { socketUrl, basicURL } from "../utils";

const { app } = require("electron").remote;
const { Text } = Typography;

class AuthContainer extends React.Component {
  socket = new Websocket('wss://premws-pt1.365lpodds.com/zap/', 'zap-protocol-v1');
  apiKey = "";

  constructor(props) {
    super(props);

    this.state = {
      authenticated: false,
      loading: false
    };
  }
  componentDidMount() {
    this.apiKey = ipcRenderer.sendSync("getApiKey");
    this.socket.onopen = () => {
      console.log("connected");
      // if (this.apiKey) {
      //   this.activateUser();
      // }
      axios.get('https://www.bet365.com.cy/en/?#/AS/B1/').then(resp => {
        let cks = resp.headers['set-cookie'];
        cks.map(ck => {
          if (ck.includes('pstk')) {
            ck = ck.split('pstk=')[1];
            console.log(ck)
            ck = ck.split(';')[0]
            console.log('session id', ck)
            this.socket.send(`#u\x03Pu\x01__time,S_${ck}u\x00`)
            return;
          }
        })
      })
      // setInterval(
      //   () => this.socket.send(JSON.stringify({ event: "keepAlive" })),
      //   9000
      // );
    };
    this.socket.onmessage = evt => {
      console.log('message', evt)
      // const evtData = JSON.parse(evt.data);
      // const { event, data } = evtData;
      // console.log("new message", event, data);
      switch (event) {
        case "keyCheckResult": {
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
          break;
        }
        case "latestVersionResult": {
          const { version, link } = data;
          if (Object.keys(data).length > 0 && version !== app.getVersion())
            this.newVersionNotification(version, link);
          break;
        }
        case "newVersion": {
          if (!this.state.authenticated) return;
          const { version, link } = data;
          this.newVersionNotification(version, link);
          break;
        }
      }
    };
  }
  newVersionNotification = (version, link) => {
    notification.info({
      placement: "topRight",
      message: "New version is available",
      duration: 0,
      description: (
        <div>
          Download the new version {version}
          <a href={link} target="_blank" className={styles.link}>
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
    if (this.socket.readyState === 0) {
      notification.error({
        placement: "bottomRight",
        duration: 3,
        message: "Error",
        description: "Network Error"
      });
      this.setState({ loading: false });
      return;
    }

    this.setState({ loading: true });
    macaddress.one((err, mac) => {
      this.socket.send(
        JSON.stringify({
          event: "keyCheck",
          data: { macAddress: mac, key: this.apiKey }
        })
      );
    });
  };
  setApiKey = e => {
    this.apiKey = e.target.value;
  };
  render() {
    const { authenticated, loading } = this.state;
    const prop = { socket: this.socket };
    return authenticated ? (
      React.Children.map(this.props.children, child =>
        React.cloneElement(child, { ...prop })
      )
    ) : (
      <div className={styles.authcontainer}>
        <Row>
          <Col span={7} className={styles.sider}>
            <img style={{ height: "100px" }} src={basicURL + "/logo.svg"} />
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
                      Verifying ....
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
