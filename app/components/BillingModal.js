import React from "react";
import { Modal, Checkbox } from "antd";
import { Row, Col, Input, Form, Icon, Typography } from "antd";
import styles from "./Billing.scss";

const { Text } = Typography;

class InputGroup extends React.Component {
  inputRef = [];

  constructor(props) {
    super(props);
    this.state = {
      values: []
    };
  }

  resetFields = () => {
    const { form, fieldsList, data, onChangeField } = this.props;
    fieldsList.forEach(field => {
      const value = {};
      value[field.name] = data ? data[field.name] : "";
      form.setFieldsValue(value);
    });
    if (this.props.title === "BILLING") {
      fieldsList.forEach(field => onChangeField(field.name));
    }
  };
  onChangeField = (field, e) => {
    if (this.props.title === "BILLING") {
      this.props.onChangeField(field, e.target.value);
    }
  };
  isNumber = (rule, value, cb) => {
    if (isNaN(value)) {
      cb("This field should be number");
    } else {
      cb();
    }
  };
  isVisa = (rule, value, cb) => {
    if (
      value !== "VISA" &&
      value !== "MASTERCARD" &&
      value !== "DISCOVER" &&
      value !== "AMEX"
    ) {
      cb("Please enter one of the following {VISA; MASTERCARD; DISCOVER; AMEX");
    } else {
      cb();
    }
  };
  render() {
    const { fieldsList, title, form, disabled, data } = this.props;
    const { getFieldDecorator } = form;
    return (
      <div>
        <h1 style={{ display: "inline" }}>{title}</h1>
        <a
          className={styles.reload}
          onClick={this.resetFields}
          disabled={disabled}
        >
          <Icon
            type="reload"
            style={{
              fontSize: "24px"
            }}
          />
        </a>
        {fieldsList.map((field, index) => (
          <Form.Item key={field.name} style={{ marginBottom: "0px" }}>
            {getFieldDecorator(field.name, {
              rules: [
                {
                  validator:
                    field.name === "CardNumber"
                      ? this.isNumber
                      : field.name === "CardType"
                      ? this.isVisa
                      : null,
                  required:
                    field.name.includes("address2") ||
                    field.name.includes("address3")
                      ? false
                      : true,
                  message:
                    field.name === "CardType"
                      ? "Please enter one of the following {VISA; MASTERCARD; DISCOVER; AMEX"
                      : `Please input the ${field.placeholder}!`
                }
              ],
              initialValue: data ? data[field.name] : ""
            })(
              <Input
                placeholder={field.placeholder}
                disabled={disabled}
                onChange={e => this.onChangeField(field.name, e)}
              />
            )}
          </Form.Item>
        ))}
      </div>
    );
  }
}

class BillingModal extends React.Component {
  billingFieldsList = [
    {
      name: "FirstNameBilling",
      placeholder: "First name"
    },
    {
      name: "LastNameBilling",
      placeholder: "Last name"
    },
    {
      name: "BillingEmail",
      placeholder: "Email address"
    },
    {
      name: "address1Billing",
      placeholder: "Address"
    },
    {
      name: "address2Billing",
      placeholder: "Address2"
    },
    {
      name: "address3Billing",
      placeholder: "Address3"
    },
    {
      name: "zipCodeBilling",
      placeholder: "Postal code"
    },
    {
      name: "cityBilling",
      placeholder: "City"
    },
    {
      name: "stateBilling",
      placeholder: "State"
    },
    {
      name: "countryBilling",
      placeholder: "Country"
    },
    {
      name: "phoneBilling",
      placeholder: "Phone number"
    }
  ];

  shippingFieldsList = [
    {
      name: "FirstNameShipping",
      placeholder: "First name"
    },
    {
      name: "LasttNameShipping",
      placeholder: "Last name"
    },
    {
      name: "ShippingEmail",
      placeholder: "Email address"
    },
    {
      name: "address1Shipping",
      placeholder: "Address"
    },
    {
      name: "address2Shipping",
      placeholder: "Address2"
    },
    {
      name: "address3Shipping",
      placeholder: "Address3"
    },
    {
      name: "zipCodeShipping",
      placeholder: "Postal code"
    },
    {
      name: "cityShipping",
      placeholder: "City"
    },
    {
      name: "stateShipping",
      placeholder: "State"
    },
    {
      name: "countryShipping",
      placeholder: "Country"
    },
    {
      name: "phoneShipping",
      placeholder: "Phone number"
    }
  ];

  cardInfoFieldsList = [
    {
      name: "NameOnCard",
      placeholder: "Name on payment card"
    },
    {
      name: "CardType",
      placeholder: "{VISA; MASTERCARD; DISCOVER; AMEX}"
    },
    {
      name: "CardNumber",
      placeholder: "Card number"
    },
    {
      name: "CardExpirationMonth",
      placeholder: "Expiration Month"
    },
    {
      name: "CardExpirationYear",
      placeholder: "Expiration Year"
    },
    {
      name: "CardSecurityCode",
      placeholder: "CVV"
    }
  ];

  profileFieldsList = [
    {
      name: "ProfileName",
      placeholder: "Name"
    }
  ];

  onChangeField = (fieldName, value) => {
    if (this.state.disabled) {
      const index = this.billingFieldsList.findIndex(
        field => field.name === fieldName
      );
      this.setShippingAsBilling(index, value);
    }
  };

  constructor(props) {
    super(props);
    this.state = {
      disabled: false
    };
  }

  setShippingAsBilling = (index, value) => {
    const val = {};
    const { form } = this.props;
    val[this.shippingFieldsList[index].name] = value
      ? value
      : form.getFieldsValue([this.billingFieldsList[index].name])[
          this.billingFieldsList[index].name
        ];
    form.setFieldsValue(val);
  };

  setBillingtoShipping = e => {
    if (e.target.checked) {
      this.shippingFieldsList.forEach((field, index) => {
        this.setShippingAsBilling(index);
      });
      this.setState({ disabled: true });
    } else {
      this.setState({ disabled: false });
    }
  };
  render() {
    const { formVisible, onCancel, onSave, form, data } = this.props;
    const { getFieldDecorator } = form;
    return (
      <Modal
        visible={formVisible}
        maskClosable={false}
        onCancel={onCancel}
        onOk={onSave}
        okText="Save"
        width={900}
        centered
      >
        <Form style={{ marginTop: "20px" }}>
          <Row gutter={30}>
            <Col span={8}>
              <InputGroup
                fieldsList={this.billingFieldsList}
                title="BILLING"
                form={form}
                onChangeField={this.onChangeField}
                data={data}
              />
            </Col>
            <Col span={8}>
              <InputGroup
                fieldsList={this.shippingFieldsList}
                title="SHIPPING"
                form={form}
                disabled={this.state.disabled}
                data={data}
              />
            </Col>
            <Col span={8}>
              <InputGroup
                fieldsList={this.cardInfoFieldsList}
                title="CARD INFO"
                form={form}
                data={data}
              />
              <InputGroup
                fieldsList={this.profileFieldsList}
                title="PROFILE"
                form={form}
                data={data}
              />
            </Col>
          </Row>
          <Row>
            <Form.Item style={{ marginBottom: "0px" }}>
              {getFieldDecorator("ShippingAsBilling", {
                initialValue: data ? data.ShippingAsBilling : false
              })(
                <Checkbox onChange={this.setBillingtoShipping}>
                  <Text style={{ color: "black" }}>
                    Use Billing Address as Shipping Address
                  </Text>
                </Checkbox>
              )}
            </Form.Item>
            <Form.Item style={{ marginBottom: "0px" }}>
              {getFieldDecorator("CheckoutOncePerWebsite", {
                initialValue: data ? data.CheckoutOncePerWebsite : false
              })(
                <Checkbox>
                  <Text style={{ color: "black" }}>
                    Enable One-time Checkout
                  </Text>
                </Checkbox>
              )}
            </Form.Item>
          </Row>
        </Form>
      </Modal>
    );
  }
}

export default Form.create({ name: "BillingForm" })(BillingModal);
