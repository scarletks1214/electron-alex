import React from "react";
import "antd/dist/antd.css";
import styles from "./Account.scss";
import { ScaleLoader } from "react-spinners";

const ipcRenderer = require("electron").ipcRenderer;

import {
  Table,
  Input,
  Popconfirm,
  Form,
  Checkbox,
  Icon,
  Select,
  Progress,
  Spin
} from "antd";
const Option = Select.Option;

class ProxySelect extends React.Component {
  render() {
    return (
      <Select
        defaultValue={this.props.value}
        className={styles.combo}
        disabled={this.props.editingKey !== this.props.key}
        onChange={value =>
          this.props.form.setFieldsValue({
            proxy: value
          })
        }
      >
        <Option value="None">None</Option>
        {this.props.proxies.map((proxy, index) => {
          let prx = `${proxy.ipaddr}:${proxy.port}`;
          if (proxy.username && proxy.username !== "") {
            prx = `${proxy.username}:${proxy.password}@` + prx;
          }
          return (
            <Option key={index} value={prx}>
              {prx}
            </Option>
          );
        })}
      </Select>
    );
  }
}

const EditableContext = React.createContext();
const InputPassword = Input.Password;

class EditableCell extends React.Component {
  getInput = form => {
    switch (this.props.dataIndex) {
      case "category":
        return <Input style={{ width: "100px" }} />;
      case "password":
        return <InputPassword style={{ width: "100px" }} />;
      case "email":
        return <Input style={{ width: "100px" }} />;
      case "proxy":
        return (
          <ProxySelect
            key={this.props.record.key}
            value={this.props.record.proxy}
            form={form}
            proxies={this.props.proxies}
          />
        );
      default:
        return <Input style={{ width: "100px" }} />;
    }
  };

  renderCell = form => {
    const { getFieldDecorator } = form;
    const {
      editing,
      dataIndex,
      title,
      record,
      index,
      children,
      ...restProps
    } = this.props;
    return (
      <td {...restProps} key={index}>
        {editing ? (
          <Form.Item style={{ margin: 0 }}>
            {getFieldDecorator(dataIndex, {
              rules: [
                dataIndex == "email"
                  ? {
                      required: true,
                      type: "email",
                      message: `Please Input Valid Email!`
                    }
                  : dataIndex == "proxy"
                  ? { required: true, message: `Please Select ${title}!` }
                  : {
                      required: true,
                      message: `Please Input ${title}!`
                    }
              ],
              initialValue: record[dataIndex]
            })(this.getInput(form))}
          </Form.Item>
        ) : (
          children
        )}
      </td>
    );
  };

  render() {
    return (
      <EditableContext.Consumer>{this.renderCell}</EditableContext.Consumer>
    );
  }
}

class EditableTable extends React.Component {
  columns = [
    {
      title: "Category",
      align: "center",
      dataIndex: "category",
      key: "category",
      editable: true
    },
    {
      title: "Email",
      align: "center",
      dataIndex: "email",
      key: "email",
      editable: true
    },
    {
      title: "Password",
      align: "center",
      dataIndex: "password",
      key: "password",
      editable: true,
      render: (text, record) => (
        <InputPassword disabled style={{ width: "100px" }} value={text} />
      )
    },
    {
      title: "Proxy",
      align: "center",
      dataIndex: "proxy",
      key: "proxy",
      editable: true
    },
    {
      title: "Action Log",
      align: "center",
      dataIndex: "actionlog",
      key: "actionlog"
    },
    {
      title: "Enabled",
      align: "center",
      dataIndex: "enabled",
      key: "enabled",
      render: (enabled, record) => (
        <Checkbox
          disabled={this.props.editingKey !== record.key}
          onChange={() =>
            this.props.changeField(record.key, "enabled", !enabled)
          }
          checked={enabled}
        />
      )
    },
    {
      title: "One Click",
      align: "center",
      dataIndex: "oneclick",
      key: "oneclick",
      render: (oneclick, record) => (
        <Progress
          type="circle"
          percent={oneclick}
          width={40}
          format={() => {
            if (oneclick < 100)
              return <Icon type="close" style={{ color: "red" }} />;
            return <Icon type="check" style={{ color: "green" }} />;
          }}
        />
      )
    },
    {
      title: "Actions",
      align: "center",
      dataIndex: "actions",
      key: "actions",
      render: (actions, record) => (
        <div>
          {(record.actionlog === "Marinating" ||
            record.actionlog === "Logging in") && (
            <ScaleLoader color="#1890ff" height={18} width={3} />
          )}
          <a
            disabled={this.props.editingKey == record.key || !record.enabled}
            onClick={() => {
              this.props.changeField(record.key, "actions-0", !actions[0]);
              if (!actions[0]) {
                ipcRenderer.send("startTask", record);
                record.oneclick = 0;
                record.actions[1] = true;
              } else {
                ipcRenderer.send("stopTask", record);
              }
            }}
          >
            {actions[0] ? (
              <Icon type="play-circle" className={styles.play} />
            ) : (
              <Icon type="pause-circle" className={styles.play} />
            )}
          </a>
          <a
            disabled={
              this.props.editingKey == record.key ||
              !record.enabled ||
              record.actions[0] ||
              record.actionlog === "Scheduling"
            }
            onClick={() => {
              this.props.changeField(record.key, "actions-1", !actions[1]);
              if (!actions[1]) {
                ipcRenderer.send("hideTask", record);
              } else {
                ipcRenderer.send("showTask", record);
              }
            }}
          >
            {actions[1] ? (
              <Icon type="eye" className={styles.eyeball} />
            ) : (
              <Icon type="eye-invisible" className={styles.eyeball} />
            )}
          </a>
        </div>
      )
    },
    {
      title: "",
      dataIndex: "edit",
      key: "edit",
      align: "center",
      render: (value, record) => (
        <div>
          {this.isEditing(record) ? (
            <span>
              <EditableContext.Consumer>
                {form => (
                  <a
                    href="javascript:;"
                    onClick={() => this.save(form, record.key)}
                    style={{ marginRight: 8 }}
                  >
                    <Icon type="save" className={styles.saveicon} />
                  </a>
                )}
              </EditableContext.Consumer>
              <Popconfirm
                title="Sure to cancel?"
                onConfirm={() => this.cancel(record.key)}
              >
                {this.props.addingNow ? null : (
                  <a>
                    <Icon type="close" className={styles.closeicon} />
                  </a>
                )}
              </Popconfirm>
            </span>
          ) : (
            <a
              disabled={this.props.editingKey !== -1 || !record.actions[0]}
              onClick={() => this.edit(record.key)}
            >
              <Icon type="edit" className={styles.editicon} />
            </a>
          )}
          {
            <Popconfirm
              title="Sure to delete?"
              onConfirm={() => this.props.deleteRow(record.key)}
            >
              <a disabled={this.props.editingKey !== -1 || !record.actions[0]}>
                <Icon type="delete" className={styles.deleteicon} />
              </a>
            </Popconfirm>
          }
        </div>
      )
    }
  ];
  constructor(props) {
    super(props);
  }

  isEditing = record => record.key === this.props.editingKey;

  cancel = () => {
    this.props.setEditingKey(-1);
  };

  save(form, key) {
    form.validateFields((error, row) => {
      if (error) {
        return;
      }
      this.props.setEditingKey(-1);
      this.props.setAddingNow(false);
      this.props.changeRow(key, row);
    });
  }

  edit(key) {
    this.props.setEditingKey(key);
  }

  render() {
    const components = {
      body: {
        cell: EditableCell
      }
    };

    const columns = this.columns.map(col => {
      if (!col.editable) {
        return col;
      }
      return {
        ...col,
        onCell: record => ({
          record,
          dataIndex: col.dataIndex,
          title: col.title,
          proxies: this.props.proxies,
          editing: this.isEditing(record)
        })
      };
    });

    return (
      <EditableContext.Provider value={this.props.form}>
        <Table
          components={components}
          dataSource={this.props.data}
          columns={columns}
          rowClassName="editable-row"
          pagination={{
            //onChange: this.cancel,
            pageSize: 5,
            pagination: false
          }}
        />
      </EditableContext.Provider>
    );
  }
}

const EditableFormTable = Form.create()(EditableTable);
export default EditableFormTable;
