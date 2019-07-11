/* eslint-disable react/no-access-state-in-setstate */
/* eslint-disable react/destructuring-assignment */
/* eslint-disable flowtype/no-weak-types */
/* eslint-disable camelcase */
import React from "react";
import { withRouter } from "react-router-dom";
import { Switch, Route } from "react-router";
import { Layout, Menu, Icon } from "antd";
import routes from "./constants/routes";
import App from "./containers/App";
import { connect } from "react-redux";

import SettingsPage from "./containers/SettingsPage";
import AccountPage from "./containers/AccountPage";
import ProxyPage from "./containers/ProxyPage";

import styles from "./App.scss";
const ipcRenderer = require("electron").ipcRenderer;

const { Header, Sider, Content } = Layout;

type Props = { history: Object };
const page_title = ["/", "/proxy", "/setting"];

class Routes extends React.Component<Props> {
  items = [
    {
      title: "Account",
      icon: "user"
    },
    {
      title: "Proxies",
      icon: "gold"
    },
    {
      title: "Settings",
      icon: "setting"
    }
  ];

  state = {
    collapsed: false,
    selectedIndex: 0
  };

  closeWindow = () => {
    ipcRenderer.send("closeWindow");
  };

  toggle = () => {
    this.setState({
      collapsed: !this.state.collapsed
    });
  };

  // eslint-disable-next-line no-unused-vars
  onClickNavigation = ({ item, key, keyPath }) => {
    if (this.state.selectedIndex + "" != keyPath) {
      const { history } = this.props;
      this.setState({ selectedIndex: keyPath });
      console.log(page_title[keyPath]);
      history.push(page_title[keyPath]);
    }
  };

  render() {
    return (
      <Layout theme="light">
        {this.props.navigation == "side" && (
          <Sider
            trigger={null}
            className={styles.sider}
            collapsible
            collapsed={this.state.collapsed}
            theme={this.props.theme}
          >
            <div
              className={this.state.collapsed ? styles.foldlogo : styles.logo}
            >
              {this.state.collapsed ? (
                <img style={{ height: "80px" }} src="logo.svg" />
              ) : (
                <img style={{ height: "180px" }} src="logo.svg" />
              )}
            </div>
            <Menu
              className={styles.antmenu}
              theme={this.props.theme}
              mode="inline"
              selectedKeys={[this.state.selectedIndex + ""]}
              onClick={this.onClickNavigation}
            >
              {this.items.map((item, index) => (
                <Menu.Item key={index}>
                  <Icon type={item.icon} />
                  <span>{item.title}</span>
                </Menu.Item>
              ))}
            </Menu>
          </Sider>
        )}

        <Layout className={styles.layout}>
          <Header
            className={
              this.props.theme == "light" || this.props.navigation == "side"
                ? styles.header_light
                : styles.header
            }
          >
            {this.props.navigation == "noside" && (
              <div className={styles.headerlogo}>
                <img style={{ height: "50px" }} src="logo.svg" />
              </div>
            )}
            {this.props.navigation == "side" && (
              <Icon
                className={styles.trigger}
                type={this.state.collapsed ? "menu-unfold" : "menu-fold"}
                onClick={this.toggle}
                style={{ alignItems: "center", padding: 0 }}
              />
            )}
            {this.props.navigation == "noside" && (
              <Menu
                className={styles.antmenu}
                theme={this.props.theme}
                mode="horizontal"
                selectedKeys={[this.state.selectedIndex + ""]}
                onClick={this.onClickNavigation}
              >
                {this.items.map((item, index) => (
                  <Menu.Item key={index}>
                    <Icon type={item.icon} />
                    <span>{item.title}</span>
                  </Menu.Item>
                ))}
              </Menu>
            )}
            <a onClick={this.closeWindow} className={styles.itemicon}>
              <Icon type="poweroff" />
            </a>
          </Header>
          <Content
            style={{
              margin: "24px 16px",
              padding: 24,
              background: "#fff"
            }}
          >
            <App>
              <Switch>
                <Route
                  exact
                  path={routes.AccountPage}
                  component={AccountPage}
                />
                <Route path={routes.ProxyPage} component={ProxyPage} />
                <Route path={routes.SettingPage} component={SettingsPage} />
              </Switch>
            </App>
          </Content>
        </Layout>
      </Layout>
    );
  }
}

function mapStateToProps(state) {
  return {
    theme: state.settings.theme,
    navigation: state.settings.navigation
  };
}

export default withRouter(
  connect(
    mapStateToProps,
    null
  )(Routes)
);
