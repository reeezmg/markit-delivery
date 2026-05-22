import React, { useEffect, useMemo, useState } from "react";
import {
  IonPage,
  IonHeader,
  IonToolbar,
  IonButtons,
  IonMenuButton,
  IonTitle,
  IonContent,
  IonSpinner,
  useIonViewWillEnter,
} from "@ionic/react";
import { QRCodeSVG } from "qrcode.react";
import { useHistory } from "react-router-dom";
import SlideToAction from "../../components/SlideToAction";
import WalkthroughStep from "../../components/WalkthroughStep";
import OrderNumberPill from "./OrderNumberPill";
import { getActiveOrder, getSteps, setCurrentPage, getPickupStores, getReturnStores, setActiveOrder } from "./walkthroughSteps";
import { postStepEvent } from "./stepEvents";
import { api } from "../../services/api";
import "./OrderWalkthrough.css";

interface OrderItem {
  id: string;
  productName: string;
  variantName: string;
  size: string;
  barcode: string;
  quantity: number;
  price: number;
  companyId?: string;
  companyName?: string;
  itemId?: string;
  status?: string;
}

const PAYMENT_UPI_ID = "9538340789@ibl";
const roundMoney = (value: number) => Math.round((Number(value) || 0) * 100) / 100;
const firstPositiveAmount = (...values: unknown[]) => {
  for (const value of values) {
    const numeric = Number(value);
    if (Number.isFinite(numeric) && numeric > 0) return roundMoney(numeric);
  }
  return 0;
};
const resolveCustomerFee = (customerFee: unknown) => {
  const numeric = Number(customerFee);
  return Number.isFinite(numeric) ? roundMoney(Math.max(0, numeric)) : 0;
};

const mapOrderItem = (item: any): OrderItem => ({
  id: item?.itemId ?? item?.item?.id ?? item?.id ?? item?.variant?.id ?? `${item?.product?.id ?? "item"}-${item?.item?.id ?? "x"}`,
  productName: item?.productName ?? item?.product?.name ?? item?.name ?? "—",
  variantName: item?.variantName ?? item?.variant?.name ?? "—",
  size: item?.size ?? item?.item?.size ?? "—",
  barcode: item?.barcode ?? item?.item?.barcode ?? "—",
  quantity: Number(item?.quantity ?? 0),
  price: Number(item?.price ?? item?.variant?.dprice ?? item?.variant?.sprice ?? 0),
  companyId: item?.companyId ?? item?.product?.companyId,
  companyName: item?.companyName ?? item?.product?.companyName,
  itemId: item?.itemId ?? item?.item?.id,
  status: typeof item?.status === "string" ? item.status.toUpperCase() : undefined,
});

const getItemMatchKey = (item: Partial<OrderItem>) =>
  item.itemId
  || [
    item.companyId ?? "_all",
    item.productName ?? "—",
    item.variantName ?? "—",
    item.size ?? "—",
    item.barcode ?? "—",
  ].join("::");

const aggregateItems = (items: OrderItem[]) => {
  const grouped = new Map<string, OrderItem>();

  for (const item of items) {
    const key = [
      item.companyId ?? "_all",
      item.productName,
      item.variantName,
      item.size,
      item.barcode,
      item.price,
    ].join("::");
    const existing = grouped.get(key);
    if (existing) {
      existing.quantity += item.quantity;
      continue;
    }
    grouped.set(key, { ...item });
  }

  return Array.from(grouped.values());
};

const buildKeptItems = (cartItems: OrderItem[], returnedItems: OrderItem[]) => {
  const hasReturnedStatuses = cartItems.some((item) => item.status === "RETURNED");
  if (hasReturnedStatuses) {
    return aggregateItems(cartItems.filter((item) => item.status !== "RETURNED"));
  }

  const returnedQtyByItemId = new Map<string, number>();
  for (const item of returnedItems) {
    const key = getItemMatchKey(item);
    if (!key) continue;
    returnedQtyByItemId.set(key, (returnedQtyByItemId.get(key) || 0) + item.quantity);
  }

  const keptLines = cartItems.reduce<OrderItem[]>((acc, item) => {
    const key = getItemMatchKey(item);
    const returnedQty = key ? (returnedQtyByItemId.get(key) || 0) : 0;
    const keptQty = Math.max(0, item.quantity - returnedQty);
    if (keptQty <= 0) return acc;
    acc.push({ ...item, quantity: keptQty });
    return acc;
  }, []);

  return aggregateItems(keptLines);
};

const buildReturnedItems = (cartItems: OrderItem[], returnedItems: OrderItem[]) => {
  if (returnedItems.length > 0) {
    return aggregateItems(returnedItems);
  }

  return aggregateItems(cartItems.filter((item) => item.status === "RETURNED"));
};

const TrynbuyPaymentPage: React.FC = () => {
  const history = useHistory();
  const order = getActiveOrder();
  const trynbuyId: string | undefined = order.trynbuyId || order.trynbuy_id;
  const steps = getSteps("Try & Buy");
  const nPickup = getPickupStores().length;
  const currentStep = nPickup * 2 + 5; // Payment comes after Get Returns

  const [sliderReset, setSliderReset] = useState(0);
  const [loading, setLoading] = useState(!!trynbuyId);
  const [paymentMethod, setPaymentMethod] = useState(String(order.paymentMethod || order.payment_method || "").toUpperCase());
  const [paymentAmount, setPaymentAmount] = useState(firstPositiveAmount(order.paymentAmount, order.customer_grand_total, order.grand_total));
  const [keptItems, setKeptItems] = useState<OrderItem[]>([]);
  const [returnedItems, setReturnedItems] = useState<OrderItem[]>([]);
  const [deliveryFeeAmount, setDeliveryFeeAmount] = useState(
    resolveCustomerFee(order.delivery_fees_customer)
  );
  const [waitingFeeAmount, setWaitingFeeAmount] = useState(
    resolveCustomerFee(order.waiting_fees_customer)
  );
  const [cancellationFeeAmount, setCancellationFeeAmount] = useState(
    firstPositiveAmount(order.cancellationFeeAmount, order.customer_cancellation_fees)
  );
  const returnStores = getReturnStores();

  const keptSubtotal = useMemo(
    () => roundMoney(keptItems.reduce((sum, item) => sum + item.price * item.quantity, 0)),
    [keptItems]
  );
  const fallbackTotal = useMemo(
    () => roundMoney(keptSubtotal + deliveryFeeAmount + waitingFeeAmount + cancellationFeeAmount),
    [keptSubtotal, deliveryFeeAmount, waitingFeeAmount, cancellationFeeAmount]
  );
  const displayAmount = useMemo(() => {
    if (paymentAmount <= 0) return fallbackTotal;
    if (fallbackTotal > 0 && paymentAmount <= keptSubtotal) {
      return fallbackTotal;
    }
    return paymentAmount;
  }, [paymentAmount, fallbackTotal, keptSubtotal]);

  const paymentIsCash = paymentMethod === "CASH";
  const paymentIsUpi = paymentMethod === "UPI";
  const hasPaymentAmount = displayAmount > 0;

  useEffect(() => { setCurrentPage("/TrynbuyPayment"); }, []);

  const refreshOrder = async () => {
    if (!trynbuyId) {
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      const data = await api.get<any>(`/orders/${trynbuyId}`);
      const freshOrder = getActiveOrder();
      const cartItems = Array.isArray(data?.cart_items) ? data.cart_items.map(mapOrderItem) : [];
      const apiReturnedItems = Array.isArray(data?.returned_items) ? data.returned_items.map(mapOrderItem) : [];
      const resolvedReturnedItems = buildReturnedItems(cartItems, apiReturnedItems);
      const kept = buildKeptItems(cartItems, resolvedReturnedItems);
      const keptSubtotalAmount = roundMoney(kept.reduce((sum, item) => sum + item.price * item.quantity, 0));
      const resolvedDeliveryFee = resolveCustomerFee(
        data?.delivery_fees_customer ?? freshOrder.delivery_fees_customer
      );
      const resolvedWaitingFee = resolveCustomerFee(
        data?.waiting_fees_customer ?? freshOrder.waiting_fees_customer
      );
      // markit_bills.customer_cancellation_fees is the cancellation fee from past
      // cancelled orders that the customer paid off as part of this order. Show it
      // as a separate line and roll it into the fallback total.
      const resolvedCancellationFee = firstPositiveAmount(
        data?.customer_cancellation_fees,
        freshOrder.cancellationFeeAmount,
        freshOrder.customer_cancellation_fees
      );
      const resolvedPaymentAmount = firstPositiveAmount(
        freshOrder.paymentAmount,
        data?.payment_amount,
        data?.customer_grand_total,
        keptSubtotalAmount + resolvedDeliveryFee + resolvedWaitingFee + resolvedCancellationFee
      );
      const resolvedPaymentMethod = String(data?.payment_method ?? data?.markit_payment_method ?? freshOrder.paymentMethod ?? "").toUpperCase();

      setKeptItems(kept);
      setReturnedItems(resolvedReturnedItems);
      setPaymentMethod(resolvedPaymentMethod);
      setDeliveryFeeAmount(resolvedDeliveryFee);
      setWaitingFeeAmount(resolvedWaitingFee);
      setCancellationFeeAmount(resolvedCancellationFee);
      setPaymentAmount(resolvedPaymentAmount);

      await setActiveOrder({
        ...freshOrder,
        cartItems,
        returnedItems: resolvedReturnedItems,
        returnStores: Array.isArray(freshOrder.returnStores) ? freshOrder.returnStores : returnStores,
        paymentMethod: resolvedPaymentMethod || freshOrder.paymentMethod,
        paymentAmount: resolvedPaymentAmount,
        delivery_fees_customer: resolvedDeliveryFee,
        waiting_fees_customer: resolvedWaitingFee,
        deliveryFeesCustomer: resolvedDeliveryFee,
        waitingFeesCustomer: resolvedWaitingFee,
        deliveryFeeAmount: resolvedDeliveryFee,
        waitingFeeAmount: resolvedWaitingFee,
        cancellationFeeAmount: resolvedCancellationFee,
        shipping: data?.shipping ?? freshOrder.shipping,
        waiting_fee: data?.waiting_fee ?? freshOrder.waiting_fee,
      });
    } catch (err) {
      console.error("Failed to refresh payment order:", err);
      const fallbackCart = Array.isArray(order.cartItems) ? order.cartItems.map(mapOrderItem) : [];
      const fallbackReturned = Array.isArray(order.returnedItems) ? order.returnedItems.map(mapOrderItem) : [];
      const resolvedFallbackReturned = buildReturnedItems(fallbackCart, fallbackReturned);
      const fallbackKept = buildKeptItems(fallbackCart, resolvedFallbackReturned);
      const fallbackDeliveryFee = resolveCustomerFee(order.delivery_fees_customer);
      const fallbackWaitingFee = resolveCustomerFee(order.waiting_fees_customer);
      const fallbackCancellationFee = firstPositiveAmount(order.cancellationFeeAmount, order.customer_cancellation_fees);
      setKeptItems(fallbackKept);
      setReturnedItems(resolvedFallbackReturned);
      setDeliveryFeeAmount(fallbackDeliveryFee);
      setWaitingFeeAmount(fallbackWaitingFee);
      setCancellationFeeAmount(fallbackCancellationFee);
      setPaymentAmount(firstPositiveAmount(
        order.paymentAmount,
        order.customer_grand_total,
        fallbackKept.reduce((sum, item) => sum + item.price * item.quantity, 0) + fallbackDeliveryFee + fallbackWaitingFee + fallbackCancellationFee
      ));
    } finally {
      setLoading(false);
    }
  };

  useIonViewWillEnter(() => {
    setSliderReset((r) => r + 1);

    postStepEvent(trynbuyId, "DecisionDone", "enter", {
      paymentMethod: paymentMethod || null,
      keptItemCount: keptItems.length,
      returnStoreCount: returnStores.length,
    });

    refreshOrder().catch(() => {});
  });

  const keptStoreEntries = useMemo(() => {
    const grouped: Record<string, { storeName: string; items: OrderItem[] }> = {};
    for (const item of keptItems) {
      const key = item.companyId ?? "_all";
      if (!grouped[key]) {
        grouped[key] = { storeName: item.companyName ?? "Store", items: [] };
      }
      grouped[key].items.push(item);
    }
    return Object.entries(grouped);
  }, [keptItems]);

  const returnedStoreEntries = useMemo(() => {
    const grouped: Record<string, { storeName: string; items: OrderItem[] }> = {};
    for (const item of returnedItems) {
      const key = item.companyId ?? "_all";
      if (!grouped[key]) {
        grouped[key] = { storeName: item.companyName ?? "Store", items: [] };
      }
      grouped[key].items.push(item);
    }
    return Object.entries(grouped);
  }, [returnedItems]);

  const handleComplete = () => {
    const activeOrder = getActiveOrder();

    if (returnStores.length > 0) {
      history.push("/TrynbuyReturnToStore");
    } else {
      history.push("/DeliverySuccessPage");
    }
  };

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonButtons slot="start">
            <IonMenuButton />
          </IonButtons>
          <IonTitle>Payment</IonTitle>
        </IonToolbar>
      </IonHeader>

      <OrderNumberPill />

      <IonContent fullscreen className="wt-page-bg">
        <div className="wt-content">
          <WalkthroughStep current={currentStep} steps={steps} accentColor="#ea580c" />

          <div className="wt-tnb-badge">TRY &amp; BUY PAYMENT</div>

          <div className="wt-card" style={{ textAlign: "center" }}>
            <div className="wt-card-title">
              {paymentIsCash ? "Payment — Cash" : paymentIsUpi ? "Payment — UPI" : "Payment"}
            </div>

            {loading ? (
              <div style={{ display: "flex", justifyContent: "center", padding: "16px 0" }}>
                <IonSpinner name="crescent" color="warning" />
              </div>
            ) : hasPaymentAmount ? (
              <>
                {paymentIsCash && (
                  <>
                    <div style={{ fontSize: 36, fontWeight: 800, color: "#16a34a", margin: "8px 0" }}>
                      &#8377;{displayAmount}
                    </div>
                    <div style={{ display: "grid", gap: 4, justifyContent: "center", marginTop: 10, fontSize: 12, color: "#6b7280" }}>
                      <div>Items: &#8377;{keptSubtotal}</div>
                      <div>Customer Delivery Fee: &#8377;{deliveryFeeAmount}</div>
                      <div>Customer Waiting Fee: &#8377;{waitingFeeAmount}</div>
                      {cancellationFeeAmount > 0 && <div>Previous Cancellation Fees: &#8377;{cancellationFeeAmount}</div>}
                    </div>
                    <div style={{ fontSize: 13, color: "#6b7280" }}>Collect cash from customer</div>
                  </>
                )}

                {paymentIsUpi && (
                  <>
                    <div style={{ display: "flex", justifyContent: "center", margin: "12px 0" }}>
                      <QRCodeSVG
                        value={`upi://pay?pa=${PAYMENT_UPI_ID}&am=${displayAmount}&cu=INR&tn=Markit+TryBuy`}
                        size={180}
                      />
                    </div>
                    <div style={{ fontSize: 13, fontWeight: 600, color: "#374151", marginBottom: 2 }}>{PAYMENT_UPI_ID}</div>
                    <div style={{ fontSize: 22, fontWeight: 800, color: "#2563eb" }}>&#8377;{displayAmount}</div>
                    <div style={{ display: "grid", gap: 4, justifyContent: "center", marginTop: 10, fontSize: 12, color: "#6b7280" }}>
                      <div>Items: &#8377;{keptSubtotal}</div>
                      <div>Customer Delivery Fee: &#8377;{deliveryFeeAmount}</div>
                      <div>Customer Waiting Fee: &#8377;{waitingFeeAmount}</div>
                      {cancellationFeeAmount > 0 && <div>Previous Cancellation Fees: &#8377;{cancellationFeeAmount}</div>}
                    </div>
                    <div style={{ fontSize: 12, color: "#6b7280", marginTop: 4 }}>Ask customer to scan and pay</div>
                  </>
                )}

                {!paymentIsCash && !paymentIsUpi && (
                  <>
                    <div style={{ fontSize: 36, fontWeight: 800, color: "#ea580c", margin: "8px 0" }}>
                      &#8377;{displayAmount}
                    </div>
                    <div style={{ display: "grid", gap: 4, justifyContent: "center", marginTop: 10, fontSize: 12, color: "#6b7280" }}>
                      <div>Items: &#8377;{keptSubtotal}</div>
                      <div>Customer Delivery Fee: &#8377;{deliveryFeeAmount}</div>
                      <div>Customer Waiting Fee: &#8377;{waitingFeeAmount}</div>
                      {cancellationFeeAmount > 0 && <div>Previous Cancellation Fees: &#8377;{cancellationFeeAmount}</div>}
                    </div>
                    <div style={{ fontSize: 13, color: "#6b7280" }}>Payment method not set yet</div>
                  </>
                )}
              </>
            ) : (
              <>
                <div style={{ fontSize: 28, fontWeight: 800, color: "#ea580c", margin: "10px 0" }}>
                  No payment due
                </div>
                <div style={{ fontSize: 13, color: "#6b7280" }}>
                  Customer returned all items. Continue to close the order.
                </div>
              </>
            )}
          </div>

          <div className="wt-card">
            <div className="wt-card-title">Kept Items</div>
            {keptItems.length === 0 ? (
              <p style={{ color: "#9ca3af", fontSize: 14, marginTop: 8, textAlign: "center", padding: "12px 0" }}>
                No items are being kept by the customer.
              </p>
            ) : (
              keptStoreEntries.map(([key, group]) => (
                <div key={key} style={keptStoreEntries.length > 1 ? { marginBottom: 16 } : undefined}>
                  {keptStoreEntries.length > 1 && (
                    <div style={{ fontWeight: 600, fontSize: 13, color: "#374151", marginBottom: 4, marginTop: 8 }}>
                      {group.storeName}
                    </div>
                  )}
                  <table className="wt-table">
                    <thead>
                      <tr>
                        <th>Product</th>
                        <th>Size</th>
                        <th>Barcode</th>
                        <th>Qty</th>
                        <th>Price</th>
                      </tr>
                    </thead>
                    <tbody>
                      {group.items.map((item, idx) => (
                        <tr key={item.id ?? idx}>
                          <td>
                            <div style={{ fontWeight: 600 }}>{item.productName}</div>
                            <div style={{ fontSize: 11, color: "#6b7280" }}>{item.variantName}</div>
                          </td>
                          <td>{item.size}</td>
                          <td style={{ fontSize: 11, color: "#6b7280" }}>{item.barcode}</td>
                          <td>{item.quantity}</td>
                          <td>&#8377;{item.price}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ))
            )}
          </div>

          <div className="wt-card">
            <div className="wt-card-title">Return Items</div>
            {returnedItems.length === 0 ? (
              <p style={{ color: "#9ca3af", fontSize: 14, marginTop: 8, textAlign: "center", padding: "12px 0" }}>
                No items are being returned by the customer.
              </p>
            ) : (
              returnedStoreEntries.map(([key, group]) => (
                <div key={key} style={returnedStoreEntries.length > 1 ? { marginBottom: 16 } : undefined}>
                  {returnedStoreEntries.length > 1 && (
                    <div style={{ fontWeight: 600, fontSize: 13, color: "#374151", marginBottom: 4, marginTop: 8 }}>
                      {group.storeName}
                    </div>
                  )}
                  <table className="wt-table">
                    <thead>
                      <tr>
                        <th>Product</th>
                        <th>Size</th>
                        <th>Barcode</th>
                        <th>Qty</th>
                        <th>Price</th>
                      </tr>
                    </thead>
                    <tbody>
                      {group.items.map((item, idx) => (
                        <tr key={`${item.id}-${idx}`}>
                          <td>
                            <div style={{ fontWeight: 600 }}>{item.productName}</div>
                            <div style={{ fontSize: 11, color: "#6b7280" }}>{item.variantName}</div>
                          </td>
                          <td>{item.size}</td>
                          <td style={{ fontSize: 11, color: "#6b7280" }}>{item.barcode}</td>
                          <td>{item.quantity}</td>
                          <td>&#8377;{item.price}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ))
            )}
          </div>
        </div>
      </IonContent>

      <div className="wt-bottom-bar">
        <div className="wt-bottom-location">
          <span className="wt-bottom-location-icon">💳</span>
          <div>
            <p className="wt-bottom-location-name">Payment Ready</p>
            <p className="wt-bottom-location-addr">
              {hasPaymentAmount ? `Collect ₹${displayAmount} from the customer` : "Nothing left to collect"}
            </p>
          </div>
        </div>
        <SlideToAction
          text="Payment Done"
          color="#ea580c"
          resetTrigger={sliderReset}
          onSlideComplete={handleComplete}
        />
      </div>
    </IonPage>
  );
};

export default TrynbuyPaymentPage;
