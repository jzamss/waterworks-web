import React from "react";

import { EPayment } from "rsi-react-filipizen-components";
import OnlineWaterworksBilling from "./OnlineWaterworksBilling";

const WaterworksBillingWebController = (props) => {
  const module = {
    title: "Waterworks Tax Online Billing",
    component: OnlineWaterworksBilling
  };
  return <EPayment module={module} {...props} />;
};

export default WaterworksBillingWebController;
