import React from "react";
import "antd/dist/antd.css";
import styles from "./Account.scss";

import { Table, Input, Popconfirm, Icon } from "antd";

const InputPassword = Input.Password;

class BillingTable extends React.Component {
  columns = [
    {
      title: "Profile Name",
      dataIndex: "ProfileName",
      key: "ProfileName",
      width: 150
    },
    {
      title: "Full Name",
      dataIndex: "FirstNameBilling",
      key: "FirstNameBilling",
      width: 150,
      render: (firstName, record) => `${firstName} ${record.LastNameBilling}`
    },
    {
      title: "Card Info",
      dataIndex: "CardNumber",
      key: "CardNumber",
      render: (card_number, record) => (
        <div>
          <InputPassword
            disabled
            style={{ width: "100px" }}
            value={card_number}
          />
          {record.CardExpirationMonth + "/" + record.CardExpirationYear}
        </div>
      ),
      width: 300
    },
    {
      title: "Billing Address",
      dataIndex: "address1Billing",
      key: "address1Billing",
      render: (billing_address, record) => {
        let addr = billing_address;
        if (record.address2Billing) {
          addr += `, ${record.address2Billing}`;
          if (record.address3Billing) {
            addr += `, ${record.address3Billing}`;
          }
        }
        return addr;
      },
      width: 300
    },
    {
      title: "Email",
      dataIndex: "BillingEmail",
      key: "BillingEmail",
      width: 200
    },
    {
      title: "",
      dataIndex: "edit",
      key: "edit",
      render: (value, record) => (
        <div>
          <a onClick={() => this.props.editRow(record.BillingEmail)}>
            <Icon type="edit" className={styles.editicon} />
          </a>
          {
            <Popconfirm
              title="Sure to delete?"
              onConfirm={() => this.props.deleteRow(record.BillingEmail)}
            >
              <a>
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
    const divisions = [8, 8, 4, 4, 6];
    for (let i = 0; i < 5; i += 1) {
      this.columns[i].width = (window.innerWidth - 100) / divisions[i];
    }
    this.setState({ width: window.innerWidth, height: window.innerHeight });
  }

  render() {
    return (
      <div>
        <Table
          dataSource={this.props.data}
          columns={this.columns}
          pagination={false}
          scroll={{ y: this.state.height - 250 }}
          rowKey="BillingEmail"
        />
      </div>
    );
  }
}

export default BillingTable;
