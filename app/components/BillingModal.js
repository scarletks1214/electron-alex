import React from "react";
import { Modal, Checkbox } from "antd";
import { Row, Col, Input, Form, Icon } from "antd";

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
  onChangeField = field => {
    if (this.props.title === "BILLING") {
      this.props.onChangeField(field);
    }
  };
  render() {
    const { fieldsList, title, form, disabled, data } = this.props;
    const { getFieldDecorator } = form;
    return (
      <div>
        <h1 style={{ display: "inline" }}>{title}</h1>
        <a
          style={{
            display: "inline",
            float: "right",
            marginTop: "10px"
          }}
          onClick={this.resetFields}
          disabled={disabled}
        >
          <Icon type="reload" style={{ fontSize: "24px" }} />
        </a>
        {fieldsList.map((field, index) => (
          <Form.Item key={field.name} style={{ marginBottom: "10px" }}>
            {getFieldDecorator(field.name, {
              rules: [
                {
                  required: true,
                  message: `Please input the ${field.placeholder}!`
                }
              ],
              initialValue: data ? data[field.name] : ""
            })(
              <Input
                placeholder={field.placeholder}
                disabled={disabled}
                onChange={value => this.onChangeField(field.name)}
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

  onChangeField = fieldName => {
    if (this.state.disabled) {
      const index = this.billingFieldsList.findIndex(
        field => field.name === fieldName
      );
      this.setShippingAsBilling(index);
    }
  };

  constructor(props) {
    super(props);
    this.state = {
      disabled: false
    };
  }

  setShippingAsBilling = index => {
    const val = {};
    const { form } = this.props;
    val[this.shippingFieldsList[index].name] = form.getFieldsValue([
      this.billingFieldsList[index].name
    ])[this.billingFieldsList[index].name];
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
        width={1000}
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
                  Use Billing Address as Shipping Address
                </Checkbox>
              )}
            </Form.Item>
            <Form.Item style={{ marginBottom: "0px" }}>
              {getFieldDecorator("CheckoutOncePerWebsite", {
                initialValue: data ? data.CheckoutOncePerWebsite : false
              })(<Checkbox>Enable One-time Checkout</Checkbox>)}
            </Form.Item>
          </Row>
        </Form>
      </Modal>
    );
  }
}

export default Form.create({ name: "BillingForm" })(BillingModal);
