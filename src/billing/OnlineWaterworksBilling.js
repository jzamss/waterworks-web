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

  const loadBill = (billOptions = {}) => {
    setLoading(true);
    setError(null);

    // TODO: remove mock data
    const bill = {
      acctno: "WB-00001",
      acctname: "NAZARENO, ELMO",
      lastbillperiod: "May 20, 2020",
      classification: "RESIDENTIAL",
      billperiod: "04-20-2020 - 05-20-2020",
      prevreading: 1000,
      currentreading: 1030,
      consumption: 30,
      amount: 500,
      details: [
        { particulars: "PREV BAL (APRIL 2020)", amount: 200 },
        { particulars: "WATER SALES", amount: 300 }
      ]
    };

    setBill(bill);
    setBarcode(`51030:${bill.acctno}`);
    setMode("viewbill");
    setLoading(false);

    // const svc = Service.lookup(`${partner.id}:EPaymentService`);
    // const params = { txntype, refno, ...billOptions };

    // svc.getBilling(params, (err, bill) => {
    //   if (err) {
    //     setError(err);
    //   } else {
    //     setBill(bill.info);
    //     setBarcode(`51030:${bill.info.billno}`);
    //     setMode("viewbill");
    //     setLoading(false);
    //   }
    //   setLoading(false);
    // });
  };

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
      paymentdetails: `Wateworks Account No. ${bill.acctno}`
    });
  };

  return (
    <React.Fragment>
      <Title>{page.title}</Title>
      <Panel visibleWhen={mode === "initial"}>
        <Label labelStyle={styles.subtitle}>Initial Information</Label>
        <Spacer />
        <Error msg={error} />
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
          <Text name="classification" caption="Classification" readOnly />
          <Panel row>
            <Text name="prevreading" caption="Previous Reading" readOnly />
            <Text name="currentreading" caption="Current Reading" readOnly />
            <Text name="consumption" caption="Consumption (cu.m)" readOnly />
          </Panel>
          <Text name="lastbillperiod" caption="Last Bill Period" readOnly />
          <Spacer />
          <h4>Bill Details</h4>
          <Table items={bill.details} showPagination={false}>
            <TableColumn expr="particulars" caption="Particulars" />
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
