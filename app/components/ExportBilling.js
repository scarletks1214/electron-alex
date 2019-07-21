import React from "react";
import { Modal, Button, Icon, Select } from "antd";
import { billingFileFormats } from "../utils";

const remote = require("electron").remote;
const dialog = remote.dialog;
const fs = require("fs");

const Option = Select.Option;

class ExportBillingModal extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      fileType: null
    };
  }
  setFileType = fileType => {
    this.setState({ fileType });
  };
  exportFile = () => {
    dialog.showSaveDialog(filePath => {
      if (filePath === undefined) {
        console.log("You didn't save the file");
        return;
      }
      this.props.exportAccounts(filePath, this.state.fileType);
    });
  };
  render() {
    const { fileType } = this.state;
    const { exportVisible, onCancel } = this.props;
    return (
      <Modal
        centered
        width={400}
        visible={exportVisible}
        okText="Save"
        onCancel={onCancel}
        footer={[
          <Button key="back" onClick={onCancel}>
            Cancel
          </Button>
        ]}
      >
        <Button
          type="primary"
          disabled={fileType === null}
          style={{ height: "70px", padding: "0px 65px", marginTop: "30px" }}
          onClick={this.exportFile}
        >
          <Icon type="folder" style={{ fontSize: "35px" }} />
          <h1
            style={{
              display: "inline",
              marginLeft: "20px",
              color: fileType === null ? "black" : "white"
            }}
          >
            EXPORT FILE
          </h1>
        </Button>
        <Select
          placeholder="SELECT FILE TYPE"
          onChange={this.setFileType}
          style={{
            width: "345px",
            marginTop: "10px",
            marginBottom: "250px"
          }}
        >
          {billingFileFormats.map((format, index) => (
            <Option value={format} key={index}>
              {format}
            </Option>
          ))}
        </Select>
      </Modal>
    );
  }
}

export default ExportBillingModal;
