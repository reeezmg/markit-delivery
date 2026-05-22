import React from "react";
import { getActiveOrder } from "./walkthroughSteps";
import "./OrderWalkthrough.css";

const orderNumberKeys = [
  "orderNumber",
  "order_number",
  "orderNo",
  "order_no",
  "invoiceNo",
  "invoice_no",
  "billNo",
  "bill_no",
  "trynbuyId",
  "trynbuy_id",
];

const getOrderNumber = () => {
  const order = getActiveOrder();
  for (const key of orderNumberKeys) {
    const value = order[key];
    if (value !== undefined && value !== null && String(value).trim()) {
      return String(value).trim();
    }
  }
  return "";
};

const OrderNumberPill: React.FC = () => {
  const orderNumber = getOrderNumber();
  if (!orderNumber) return null;

  return (
    <div className="wt-order-number-pill" aria-label={`Order number ${orderNumber}`}>
      <span className="wt-order-number-label">Order</span>
      <span className="wt-order-number-value">#{orderNumber}</span>
    </div>
  );
};

export default OrderNumberPill;
