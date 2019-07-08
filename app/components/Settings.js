import React from "react";
import styles from "./Settings.scss";
import {
  Row,
  Col,
  Card,
  Icon,
  Tooltip,
  InputNumber,
  Switch,
  Button,
  Modal
} from "antd";

import ButtonGroup from "antd/lib/button/button-group";
import TextArea from "antd/lib/input/TextArea";

class DurationArea extends React.Component {
  render() {
    return (
      <div className={styles.duration}>
        <p className={styles.runlabel}>{`${this.props.type
          .charAt(0)
          .toUpperCase() + this.props.type.slice(1)} Duration Min/Max`}</p>
        <span>
          <InputNumber
            value={this.props.min}
            className={styles.durinput}
            onChange={v => this.props.change(this.props.type, "min", v)}
            min={0}
            max={this.props.max}
          />
          <h4> - </h4>
          <InputNumber
            value={this.props.max}
            className={styles.durinput}
            onChange={v => this.props.change(this.props.type, "max", v)}
            min={this.props.min}
          />
          <h4>mins</h4>
        </span>
      </div>
    );
  }
}

class CustomCheckBox extends React.Component {
  static defaultProps = {
    checked: false
  };
  setCheck = () => {
    if (this.props.theme) {
      if (this.props.theme == "dark") this.props.setCheck("theme", "dark");
      else this.props.setCheck("theme", "light");
    } else {
      if (this.props.navigation == "side")
        this.props.setCheck("navigation", "side");
      else this.props.setCheck("navigation", "noside");
    }
  };
  render() {
    return (
      <Tooltip
        placement="topLeft"
        title={
          this.props.theme
            ? `${this.props.theme.charAt(0).toUpperCase() +
                this.props.theme.slice(1)} Mode`
            : this.props.navigation == "side"
            ? "Side Menu Layout"
            : "Top Menu Layout"
        }
      >
        <Row
          style={{
            width: "40px",
            height: "40px",
            border: "1px solid grey",
            cursor: "pointer"
          }}
          onClick={this.setCheck}
        >
          {this.props.navigation != "noside" ? (
            <Col
              span={6}
              style={{
                backgroundColor:
                  this.props.theme == "dark" ? "#001529" : "#ffffff",
                height: "100%"
              }}
            />
          ) : null}
          <Col
            span={this.props.navigation == "noside" ? 24 : 18}
            style={{ height: "100%" }}
          >
            <div
              style={{
                width: "100%",
                height: "20%",
                background:
                  this.props.navigation == "noside" ? "#001529" : "#fff"
              }}
            />
            <div
              style={{
                width: "100%",
                backgroundColor: "#f0f2f5",
                height: "80%"
              }}
            >
              {this.props.checked ? (
                <Icon
                  type="check"
                  style={{
                    margin:
                      this.props.navigation == "noside" ? "8px 14px" : "8px"
                  }}
                />
              ) : null}
            </div>
          </Col>
        </Row>
      </Tooltip>
    );
  }
}

export default class Settings extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      duration: {
        run: {
          min: 0,
          max: 0
        },
        sleep: {
          min: 0,
          max: 0
        }
      },
      maxProfile: 0,
      gsearch: true,
      youtube: true,
      bTargetDlg: false
    };
  }
  showTargetDlg = show => {
    this.newTarget = this.props.targets;
    this.setState({ bTargetDlg: show });
  };
  componentDidMount() {
    this.loadFrom();
  }
  loadFrom = () => {
    console.log("loadfrom ...");
    const duration = {
      run: {
        min: this.props.duration.run.min,
        max: this.props.duration.run.max
      },
      sleep: {
        min: this.props.duration.sleep.min,
        max: this.props.duration.sleep.max
      }
    };
    this.setState({
      duration,
      maxProfile: this.props.maxProfile,
      gsearch: this.props.gsearch,
      youtube: this.props.youtube
    });
  };
  saveTo = () => {
    const { duration, maxProfile, gsearch, youtube } = this.state;
    this.props.changeAll(duration, maxProfile, gsearch, youtube);
  };
  setCheck = (which, mode) => {
    if (which == "theme") {
      this.props.setTheme(mode);
    } else {
      this.props.setNavigation(mode);
    }
  };
  changeDuration = (type, which, value) => {
    const { duration } = this.state;
    duration[type][which] = value;
    this.setState({ duration });
  };
  setMaxProfile = value => {
    this.setState({ maxProfile: value });
  };
  setTarget = (type, value) => {
    if (type === "gsearch") {
      this.setState({ gsearch: value });
    } else {
      this.setState({ youtube: value });
    }
  };
  changeTarget = () => {
    this.props.setTargets(this.newTarget);
    this.setState({ bTargetDlg: false });
  };
  render() {
    return (
      <div>
        <Row gutter={16}>
          <Col className="ant-col-12" gutter={16}>
            <Card type="inner" title="Style Settings">
              <div className={styles.cardcontent}>
                <div className={styles.style_setting}>
                  <h4>Page style setting</h4>
                  <div>
                    <Row gutter={20}>
                      <Col span={3}>
                        <CustomCheckBox
                          checked={this.props.theme == "dark" ? true : false}
                          theme="dark"
                          style={{ display: "inline" }}
                          setCheck={this.setCheck}
                        />
                      </Col>
                      <Col span={3}>
                        <CustomCheckBox
                          checked={this.props.theme == "light" ? true : false}
                          theme="light"
                          style={{ display: "inline" }}
                          setCheck={this.setCheck}
                        />
                      </Col>
                    </Row>
                  </div>
                </div>
                <div className={styles.style_setting}>
                  <h4>Navigation Mode</h4>
                  <div>
                    <Row gutter={20}>
                      <Col span={3}>
                        <CustomCheckBox
                          checked={
                            this.props.navigation == "side" ? true : false
                          }
                          navigation="side"
                          style={{ display: "inline" }}
                          setCheck={this.setCheck}
                        />
                      </Col>
                      <Col span={3}>
                        <CustomCheckBox
                          checked={
                            this.props.navigation == "noside" ? true : false
                          }
                          navigation="noside"
                          style={{ display: "inline" }}
                          setCheck={this.setCheck}
                        />
                      </Col>
                    </Row>
                  </div>
                </div>
              </div>
            </Card>
          </Col>
          <Col className="ant-col-12">
            <Card type="inner" title="Task Settings">
              <div className={styles.cardcontent}>
                <h4>Organization</h4>
                <div style={{ marginTop: "30px", marginBottom: "50px" }}>
                  <DurationArea
                    type="run"
                    min={this.state.duration.run.min}
                    max={this.state.duration.run.max}
                    change={this.changeDuration}
                  />
                  <DurationArea
                    type="sleep"
                    min={this.state.duration.sleep.min}
                    max={this.state.duration.sleep.max}
                    change={this.changeDuration}
                  />
                  <div className={styles.duration}>
                    <p className={styles.runlabel}>Max Running Profiles</p>
                    <InputNumber
                      className={styles.durinput}
                      value={this.state.maxProfile}
                      onChange={this.setMaxProfile}
                      min={1}
                    />
                  </div>
                </div>
                <h4>Targets</h4>
                <div className={styles.target_container}>
                  <div className={styles.target}>
                    <p className={styles.label}>Google Search</p>
                    <Switch
                      checked={this.state.gsearch}
                      onChange={checked => this.setTarget("gsearch", checked)}
                    />
                  </div>
                  <div className={styles.target}>
                    <p className={styles.label}>Youtube</p>
                    <Switch
                      checked={this.state.youtube}
                      onChange={checked => this.setTarget("youtube", checked)}
                    />
                  </div>
                </div>
                <div className={styles.actionbutton}>
                  <ButtonGroup>
                    <Button type="primary" onClick={this.saveTo}>
                      <Icon type="check" />
                      Apply
                    </Button>
                    <Button type="primary" onClick={this.loadFrom}>
                      <Icon type="close" />
                      Cancel
                    </Button>
                  </ButtonGroup>
                </div>
              </div>
            </Card>
          </Col>
        </Row>
        <Modal
          title="Change your targets ..."
          visible={this.state.bTargetDlg}
          onOk={this.changeTarget}
          onCancel={() => this.showTargetDlg(false)}
          confirmLoading={this.props.confirmLoading}
          maskClosable={false}
          footer={[
            <Button
              key="back"
              onClick={() => {
                this.showTargetDlg(false);
              }}
            >
              Cancel
            </Button>,
            <Button key="submit" type="primary" onClick={this.changeTarget}>
              Apply
            </Button>
          ]}
        >
          <TextArea
            onChange={e => (this.newTarget = e.target.value)}
            style={{ height: "350px" }}
            defaultValue={this.props.targets.join("\n")}
          />
        </Modal>
      </div>
    );
  }
}
