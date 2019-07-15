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
      title: "Profile Name",
      align: "center",
      dataIndex: "profilename",
      key: "profilename",
      editable: true
    },
    {
      title: "Full Name",
      align: "center",
      dataIndex: "fullname",
      key: "fullname",
      editable: true
    },
    {
      title: "Card Info",
      align: "center",
      dataIndex: "cardinfo",
      key: "cardinfo",
      editable: true,
      render: (text, record) => (
        <InputPassword disabled style={{ width: "100px" }} value={text} />
      )
    },
    {
      title: "Billing Address",
      align: "center",
      dataIndex: "address",
      key: "address",
      editable: true
    },
    {
      title: "Email",
      align: "center",
      dataIndex: "email",
      key: "email"
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
    this.state = {
      width: 0,
      height: 0
    };
    this.updateWindowDimensions = this.updateWindowDimensions.bind(this);
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

  componentDidMount() {
    this.updateWindowDimensions();
    window.addEventListener("resize", this.updateWindowDimensions);
  }

  componentWillUnmount() {
    window.removeEventListener("resize", this.updateWindowDimensions);
  }

  updateWindowDimensions() {
    this.setState({ width: window.innerWidth, height: window.innerHeight });
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

    if (this.ref) console.log(this.ref.getBoundingClientRect());

    return (
      <div>
        <EditableContext.Provider value={this.props.form}>
          <Table
            components={components}
            dataSource={this.props.data}
            columns={columns}
            rowClassName="editable-row"
            pagination={false}
            scroll={{ y: this.state.height - 250 }}
          />
        </EditableContext.Provider>
      </div>
    );
  }
}

const EditableFormTable = Form.create()(EditableTable);
export default EditableFormTable;
