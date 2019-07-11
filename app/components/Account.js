import React from "react";
import { Button, Select, Icon, Modal, Input, Spin } from "antd";
import EditableFormTable from "./AccountTable";
import styles from "./Account.scss";

const { Option } = Select;
const ButtonGroup = Button.Group;
const TextArea = Input.TextArea;

const remote = require("electron").remote;
const dialog = remote.dialog;
const fs = require("fs");
const ipcRenderer = require("electron").ipcRenderer;

export default class Account extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      addingNow: false,
      newAccounts: []
    };
  }

  componentWillReceiveProps(props) {
    if (props.addedRows && !props.confirmLoading) {
      this.setState({ addingNow: false, newAccounts: "" });
      this.props.changeAddedRows();
    }
  }

  addRows = () => {
    let newaccs = this.state.newAccounts.split("\n");
    let newrows = [];
    newaccs.forEach(acc => {
      const sp_prx = acc.split(":");
      if (
        sp_prx[0] &&
        sp_prx[1] &&
        sp_prx[0]
          .toLowerCase()
          .match(
            /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
          ) &&
        this.props.accounts.findIndex(item => item.email == sp_prx[0]) == -1
      ) {
        newrows.push({
          email: sp_prx[0],
          password: sp_prx[1],
          ipaddr: sp_prx[2],
          port: sp_prx[3],
          username: sp_prx[4],
          prx_password: sp_prx[5]
        });
      }
    });
    console.log(newrows);
    this.props.checkValidation(newrows, this.props.proxies);
  };

  addImportedAccounts = accounts => {
    this.props.checkValidation(JSON.parse(accounts), this.props.proxies);
  };

  setAddingNow = addingNow => {
    this.setState({ addingNow });
  };

  addRow = () => {
    this.setState({ addingNow: true });
  };

  importAccounts = () => {
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

        this.addImportedAccounts(data);
      });
    });
  };

  ExportAccounts = () => {
    const options = {
      filters: [
        {
          name: "All",
          extensions: ["json", "csv"]
        }
      ]
    };
    const data = this.props.accounts.map(acc => {
      const { category, email, password, proxy } = acc;
      return { category, email, password, proxy };
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

  enableAll = () => {
    this.props.accounts.forEach(acc => {
      this.props.changeField(acc.key, "enabled", true);
    });
  };

  disableAll = () => {
    this.props.accounts.forEach(acc => {
      if (acc.actions[0]) this.props.changeField(acc.key, "enabled", false);
    });
  };

  startAll = () => {
    this.props.accounts.forEach(acc => {
      if (acc.enabled && acc.actions[0]) {
        this.props.changeField(acc.key, "actions-0", false);
        ipcRenderer.send("startTask", acc);
        acc.oneclick = 0;
        acc.actions[1] = true;
      }
    });
  };

  stopAll = () => {
    this.props.accounts.forEach(acc => {
      if (acc.enabled) {
        this.props.changeField(acc.key, "actions-0", true);
        ipcRenderer.send("stopTask", acc);
      }
    });
  };

  setCurrentCategory = value => {
    this.props.setCurrentCategory(value);
  };

  render() {
    console.log("confirmloading", this.props.confirmLoading);
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
              type="primary"
              disabled={this.props.editingKey !== -1}
              onClick={this.importAccounts}
            >
              <Icon type="import" />
              Import
            </Button>
            <Button
              type="primary"
              onClick={this.ExportAccounts}
              disabled={this.props.editingKey !== -1}
            >
              <Icon type="export" />
              Export
            </Button>
          </ButtonGroup>
          <ButtonGroup className={styles.actionbuttons}>
            <Button
              type="primary"
              disabled={this.props.editingKey !== -1}
              onClick={this.enableAll}
            >
              Enable All
            </Button>
            <Button
              type="primary"
              disabled={this.props.editingKey !== -1}
              onClick={this.disableAll}
            >
              Disable All
            </Button>
            <Button
              type="primary"
              disabled={this.props.editingKey !== -1}
              onClick={this.startAll}
            >
              Start All
            </Button>
            <Button
              type="primary"
              disabled={this.props.editingKey !== -1}
              onClick={this.stopAll}
            >
              Stop All
            </Button>
            <Select
              defaultValue="All"
              className={styles.combo}
              disabled={this.props.editingKey !== -1}
              onChange={this.setCurrentCategory}
            >
              {this.props.categories.map((category, index) => (
                <Option key={index} value={category}>
                  {category}
                </Option>
              ))}
            </Select>
          </ButtonGroup>
        </div>
        <div>
          <EditableFormTable
            data={
              this.props.currentCategory === "All"
                ? this.props.accounts
                : this.props.accounts.filter(
                    acc => acc.category === this.props.currentCategory
                  )
            }
            changeField={this.props.changeField}
            changeRow={this.props.changeRow}
            deleteRow={this.props.deleteRow}
            editingKey={this.props.editingKey}
            setEditingKey={this.props.setEditingKey}
            addingNow={this.state.addingNow}
            setAddingNow={this.setAddingNow}
            proxies={this.props.proxies}
            startTask={this.props.startTask}
            stopTask={this.props.stopTask}
          />
        </div>
        <Modal
          title="Add New Accounts ..."
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
              {this.props.confirmLoading
                ? "Checking Proxy Validation ..."
                : "Save"}
            </Button>
          ]}
        >
          <TextArea
            onChange={e => this.setState({ newAccounts: e.target.value })}
            style={{ height: "300px" }}
            placeholder="Email:Password(:IP:Port(:Username:Password))"
            value={this.state.newAccounts}
          />
        </Modal>
      </Spin>
    );
  }
}
