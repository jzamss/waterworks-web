import React, { useState } from "react";
import {
  Panel,
  Text,
  Button,
  FormPanel,
  ActionBar,
  Label,
  Spacer,
  Service,
  Error,
  Title,
  Table,
  TableColumn,
  BackLink,
  currencyFormat,
  Decimal
} from "rsi-react-web-components";

import PayOption from "../components/PayOption";

const txntype = "waterworks";
const origin = "filipizen";

const OnlineWaterworksBilling = (props) => {
  const [mode, setMode] = useState("initial");
  const [error, setError] = useState();
  const [loading, setLoading] = useState(false);
  const [refno, setRefno] = useState();
  const [showPayOption, setShowPayOption] = useState(false);
  const [bill, setBill] = useState({ details: [] });
  const [year, setYear] = useState();
  const [qtr, setQtr] = useState();
  const [barcode, setBarcode] = useState();

  const { partner, page, onCancel, onSubmit } = props;

  const getBilling = async (billOptions = {}) => {
    const svc = await Service.lookupAsync(`${partner.id}:WaterworksOnlineBillingService`)
    const params = { txntype, refno, ...billOptions }
    return await svc.getBilling(params)
  }

  const loadBill = (billOptions = {}) => {
    setLoading(true);
    setError(null);
    getBilling(billOptions).then(bill => {
      console.log("BILL", bill)
      setBill(bill);
      setBarcode(`51030:${bill.billno}`);
      setMode("viewbill");
      setLoading(false);
    }).catch(err => {
      setError(err.toString());
      setLoading(false)
    })
  }

  const payOptionHandler = (billOption) => {
    setShowPayOption(false);
    loadBill(billOption);
  };

  const printBill = () => {
    window.print();
  };

  const confirmPayment = () => {
    onSubmit({
      refno,
      txntype,
      origin,
      orgcode: partner.id,
      billtoyear: bill.billtoyear,
      billtoqtr: bill.billtoqtr,
      paidby: bill.paidby,
      paidbyaddress: bill.paidbyaddress,
      amount: bill.amount,
      info: {txntype },
      paymentdetails: `Wateworks Account No. ${bill.acctno}`
    });
  };

  const errorMsg = error || props.error;

  return (
    <React.Fragment>
      <Title>{page.title}</Title>
      <Panel visibleWhen={mode === "initial"}>
        <Label labelStyle={styles.subtitle}>Initial Information</Label>
        <Spacer />
        <Error msg={errorMsg} />
        <Text
          caption="Account No."
          name="refno"
          value={refno}
          onChange={setRefno}
          readOnly={loading}
          autoFocus={true}
        />
        <ActionBar>
          <Button caption="Back" variant="text" action={onCancel} />
          <Button
            caption="Next"
            action={loadBill}
            loading={loading}
            disabled={loading}
          />
        </ActionBar>
      </Panel>

      <Panel visibleWhen={mode === "viewbill"}>
        <Label labelStyle={styles.subtitle}>Billing Information</Label>
        <Spacer />
        <Error msg={error} />
        <FormPanel context={bill} handler={setBill}>
          <Text name="acctno" caption="Account No." readOnly />
          <Text name="acctname" caption="Account Name" readOnly />
          <Text name="address.text" caption="Address" readOnly />
          <Text name="classificationid" caption="Classification" readOnly />
          <Text name="billno" caption="Last Bill Period" readOnly />
          <Panel row>
            <Text name="monthname" caption="Bill Month" readOnly />
            <Text name="year" caption="Bill Year" readOnly />
          </Panel>
          <Panel row>
            <Text name="meter.size.title" caption="Meter Size" readOnly />
            <Text name="consumption.prev.reading" caption="Previous Reading" readOnly />
            <Text name="consumption.reading" caption="Current Reading" readOnly />
            <Text name="consumption.volume" caption="Consumption" readOnly />
          </Panel>
          <Spacer />
          <h4>Bill Details</h4>
          <Table items={bill.items} showPagination={false}>
            <TableColumn expr="item.title" caption="Account" />
            <TableColumn expr="remarks" caption="Particulars" />
            <TableColumn
              expr={item =>  currencyFormat(item.amount)}
              caption="Amount Due"
              type="decimal"
              align="right"
            />
          </Table>
          <Panel style={styles.totalContainer}>
            <h4 style={styles.total}>TOTAL</h4>
            <h4 style={styles.amount}>{currencyFormat(bill.amount)}</h4>
          </Panel>
        </FormPanel>
        <ActionBar disabled={loading}>
          <BackLink caption="Back" action={() => props.onBack()} />
          <Panel row>
            <Button caption="Print" action={printBill} variant="outlined" />
            <Button caption="Confirm Payment" action={confirmPayment} />
          </Panel>
        </ActionBar>

        <PayOption
          initialValue={
            bill && {
              billtoyear: bill.billtoyear,
              billtoqtr: bill.billtoqtr
            }
          }
          open={showPayOption}
          onAccept={payOptionHandler}
          onCancel={() => setShowPayOption(false)}
        />
      </Panel>
    </React.Fragment>
  );
};

const styles = {
  subtitle: {
    fontSize: 16,
    fontWeight: 400,
    opacity: 0.8,
    color: "green"
  },
  totalContainer: {
    display: "flex",
    justifyContent: "flex-end",
    marginTop: -10
  },
  total: {
    fontWeight: 800,
    marginRight: 40,
  },
  amount: {
    marginRight: 20,
  }
};

export default OnlineWaterworksBilling;
