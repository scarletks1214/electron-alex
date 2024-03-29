import React from "react";
import { Button, Icon, Modal, Input, Spin, Typography } from "antd";
import EditableFormTable from "./ProxyTable";
import styles from "./Proxy.scss";
import { ipcRenderer } from "electron";

const ButtonGroup = Button.Group;
const TextArea = Input.TextArea;

const remote = require("electron").remote;
const dialog = remote.dialog;
const fs = require("fs");

const { Text } = Typography;

export default class Proxy extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      addingNow: false,
      newProxies: ""
    };
  }

  componentWillReceiveProps(props) {
    if (props.addedRows && !props.confirmLoading) {
      this.setState({ addingNow: false, newProxies: "" });
      this.props.changeAddedRows();
    }
  }

  setAddingNow = addingNow => {
    this.setState({ addingNow });
  };

  addRows = () => {
    let newprxs = this.state.newProxies.split("\n");
    let newrows = [];
    newprxs.forEach(prx => {
      const sp_prx = prx.split(":");
      if (
        sp_prx[0] &&
        sp_prx[1] &&
        sp_prx[0].match(/^([0-9]+).([0-9]+).([0-9]+).([0-9]+)$/) &&
        sp_prx[1].match(/^\d+$/)
      ) {
        newrows.push({
          ipaddr: sp_prx[0],
          port: sp_prx[1],
          username: sp_prx[2],
          password: sp_prx[3]
        });
      }
    });
    this.props.checkValidation(newrows, true);
  };

  addRow = () => {
    this.setState({ addingNow: true });
  };

  testAll = () => {
    this.props.proxies.forEach(prx => {
      this.props.changeField(prx.key, "validation-0", !prx.validation[0]);
    });
    this.props.checkValidation(this.props.proxies, false);
  };

  deleteAll = () => {
    this.props.deleteAll();
  };

  deleteBad = () => {
    this.props.deleteAll(true);
  };

  importProxies = () => {
    const options = {
      filters: [
        {
          name: "All",
          extensions: ["json", "csv"]
        }
      ]
    };
    dialog.showOpenDialog(options, filePath => {
      console.log(filePath);
      if (filePath === undefined) {
        console.log("No file selected");
        return;
      }

      fs.readFile(filePath[0], "utf-8", (err, data) => {
        if (err) {
          alert("An error ocurred reading the file :" + err.message);
          return;
        }

        this.addImportedProxies(data);
      });
    });
  };

  addImportedProxies = proxies => {
    this.props.checkValidation(JSON.parse(proxies), true);
  };

  exportProxies = () => {
    const options = {
      filters: [
        {
          name: "All",
          extensions: ["json", "csv"]
        }
      ]
    };
    const data = this.props.proxies
      .filter(prx => prx.validation[1] === true)
      .map(prx => {
        const { ipaddr, port, username, password } = prx;
        return { ipaddr, port, username, password };
      });
    dialog.showSaveDialog(options, filePath => {
      if (filePath === undefined) {
        console.log("You didn't save the file");
        return;
      }

      fs.writeFileSync(filePath, JSON.stringify(data), err => {
        if (err) {
          alert("An error ocurred creating the file :" + err.message);
          return;
        }
      });
    });
  };

  setTestUrl = e => {
    console.log("url", e.target.value);
    ipcRenderer.send("setTestUrl", { url: e.target.value });
  };

  render() {
    return (
      <Spin
        spinning={this.props.confirmLoading && !this.state.addingNow}
        tip="Checking Proxy Validation ...."
      >
        <div className={styles.controlbuttonarea}>
          <ButtonGroup>
            <Button
              type="primary"
              onClick={this.addRow}
              disabled={this.props.editingKey !== -1}
            >
              <Icon type="user-add" />
              New
            </Button>
            <Button
              disabled={this.props.editingKey !== -1}
              onClick={this.importProxies}
            >
              <Icon type="rocket" />
              Import
            </Button>
            <Button
              disabled={this.props.editingKey !== -1}
              onClick={this.exportProxies}
              className={styles.startbutton}
            >
              <Icon type="download" />
              Export Tested
            </Button>
          </ButtonGroup>
          <Text style={{ marginLeft: "20px" }}>Test URL:</Text>
          <Input
            defaultValue="https://kith.com"
            style={{ width: "250px", marginLeft: "20px" }}
            onChange={this.setTestUrl}
          />
          <ButtonGroup className={styles.actionbuttons}>
            <Button
              disabled={this.props.editingKey !== -1}
              onClick={this.testAll}
              type="primary"
            >
              <Icon type="play-square" />
              Test All
            </Button>
            <Button
              disabled={this.props.editingKey !== -1}
              onClick={this.deleteAll}
              type="danger"
            >
              <Icon type="delete" />
              Delete All
            </Button>
            <Button
              disabled={this.props.editingKey !== -1}
              onClick={this.deleteBad}
              type="danger"
            >
              <Icon type="delete" />
              Delete Bad
            </Button>
          </ButtonGroup>
        </div>
        <div style={{ height: "100%" }}>
          <EditableFormTable
            data={this.props.proxies}
            changeField={this.props.changeField}
            changeRow={this.props.changeRow}
            deleteRow={this.props.deleteRow}
            editingKey={this.props.editingKey}
            setEditingKey={this.props.setEditingKey}
            checkValidation={this.props.checkValidation}
          />
        </div>
        <Modal
          title="Add new proxies ..."
          visible={this.state.addingNow}
          onOk={this.addRows}
          onCancel={() => this.setAddingNow(false)}
          confirmLoading={this.props.confirmLoading}
          maskClosable={false}
          footer={[
            <Button
              key="back"
              onClick={() => {
                this.setAddingNow(false);
                this.props.cancelCheck();
              }}
            >
              Cancel
            </Button>,
            <Button
              key="submit"
              type="primary"
              loading={this.props.confirmLoading}
              onClick={this.addRows}
            >
              {this.props.confirmLoading ? "Checking Validation ..." : "Save"}
            </Button>
          ]}
        >
          <TextArea
            onChange={e => this.setState({ newProxies: e.target.value })}
            style={{ height: "300px" }}
            placeholder="IP:Port(:Username:Password)"
            value={this.state.newProxies}
          />
        </Modal>
      </Spin>
    );
  }
}
