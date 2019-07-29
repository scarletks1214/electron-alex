import React from "react";
import { Modal, Button, Icon, Select } from "antd";
import { billingFileFormats } from "../utils";
import { ipcRenderer } from "electron";

const remote = require("electron").remote;
const dialog = remote.dialog;
const fs = require("fs");

const Option = Select.Option;

class ImportBillingModal extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      fileType: null
    };
  }
  setFileType = name => {
    const index = billingFileFormats.findIndex(fmt => fmt.name === name);
    this.setState({ fileType: billingFileFormats[index].format });
  };
  importFile = () => {
    dialog.showOpenDialog(filePath => {
      if (filePath === undefined) {
        console.log("No file selected");
        return;
      }

      const index = filePath[0].lastIndexOf("/");
      const tPath = filePath[0].slice(0, index);
      let name = filePath[0].slice(index + 1, filePath[0].length);
      name = "__" + name;

      ipcRenderer.sendSync("convertProfile", {
        src_path: filePath[0],
        dst_path: tPath + "/" + name,
        src_format: this.state.fileType,
        dst_format: "defJSON"
      });

      setTimeout(
        () =>
          fs.readFile(tPath + "/" + name, "utf-8", (err, data) => {
            if (err) {
              alert("An error ocurred reading the file :" + err.message);
              return;
            }

            this.props.addImportedAccounts(JSON.parse(data));
            fs.unlink(tPath + "/" + name, () => {});
          }),
        500
      );
    });
  };
  render() {
    const { fileType } = this.state;
    const { importVisible, onCancel } = this.props;
    return (
      <Modal
        centered
        width={400}
        visible={importVisible}
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
          onClick={this.importFile}
        >
          <Icon type="folder" style={{ fontSize: "35px" }} />
          <h1
            style={{
              display: "inline",
              marginLeft: "20px",
              color: fileType === null ? "black" : "white"
            }}
          >
            IMPORT FILE
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
            <Option value={format.name} key={index}>
              {format.name}
            </Option>
          ))}
        </Select>
      </Modal>
    );
  }
}

export default ImportBillingModal;
