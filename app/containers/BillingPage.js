// @flow
import { connect } from "react-redux";
import { BILLING } from "../reducers/types";
import Billing from "../components/Billing";

function mapStateToProps(state) {
  return {
    billingAccounts: state.billingData.billingAccounts,
    changed: state.billingData.changed
  };
}

function mapDispatchToProps(dispatch) {
  return {
    addAccount: account => {
      dispatch({ type: BILLING.ADDACCOUNT, account });
    },
    deleteAccount: email => {
      dispatch({ type: BILLING.DELETEACCOUNT, email });
    },
    editAccount: (index, account) => {
      dispatch({ type: BILLING.EDITACCOUNT, index, account });
    }
  };
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(Billing);
