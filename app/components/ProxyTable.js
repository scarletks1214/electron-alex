import React from "react";
import "antd/dist/antd.css";
import styles from "./Account.scss";

import { Table, Input, Popconfirm, Form, Icon, Spin } from "antd";

const EditableContext = React.createContext();
const InputPassword = Input.Password;

class EditableCell extends React.Component {
  getInput = () => {
    switch (this.props.dataIndex) {
      case "password":
        return <InputPassword style={{ width: 150 }} />;
      default:
        return <Input style={{ width: "150px" }} />;
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
                dataIndex == "ipaddr"
                  ? {
                      required: true,
                      pattern: /^([0-9]+).([0-9]+).([0-9]+).([0-9]+)$/,
                      message: `Please Input ${title}!`
                    }
                  : dataIndex == "port"
                  ? {
                      required: true,
                      pattern: /^\d+$/,
                      message: `Please Input ${title}!`
                    }
                  : {}
              ],
              initialValue: record[dataIndex]
            })(this.getInput())}
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
      title: "IP Address",
      align: "center",
      dataIndex: "ipaddr",
      key: "ipaddr",
      editable: true
    },
    {
      title: "Port Number",
      align: "center",
      dataIndex: "port",
      key: "port",
      editable: true
    },
    {
      title: "Username",
      align: "center",
      dataIndex: "username",
      key: "username",
      editable: true
    },
    {
      title: "Password",
      align: "center",
      dataIndex: "password",
      key: "password",
      editable: true,
      render: (text, record) =>
        record.username ? (
          <InputPassword disabled style={{ width: "100px" }} value={text} />
        ) : null
    },
    {
      title: "Validation",
      align: "center",
      dataIndex: "validation",
      key: "validation",
      render: (actions, record) => (
        <div>
          <a
            disabled={this.props.editingKey == record.key}
            onClick={() => {
              this.props.changeField(record.key, "validation-0", !actions[0]);
              this.props.checkValidation([record], false);
            }}
          >
            {actions[0] ? (
              <Icon type="play-circle" className={styles.play} />
            ) : (
              <Icon type="pause-circle" className={styles.play} />
            )}
          </a>
          <span style={{ marginLeft: "10px" }}>
            {!actions[0] ? (
              <Spin />
            ) : actions[1] ? (
              <Icon
                type="check-circle"
                style={{ color: "green", fontSize: "16px" }}
              />
            ) : (
              <Icon
                type="close-circle"
                style={{ color: "red", fontSize: "16px" }}
              />
            )}
          </span>
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
                <a>
                  <Icon type="close" className={styles.closeicon} />
                </a>
              </Popconfirm>
            </span>
          ) : (
            <a
              disabled={this.props.editingKey !== -1 || !record.validation[0]}
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
              <a
                disabled={
                  (this.props.editingKey !== -1 &&
                    record.key !== this.props.editingKey) ||
                  !record.validation[0]
                }
              >
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
