import React, { useEffect, useState } from "react";
import {
  IonPage,
  IonHeader,
  IonToolbar,
  IonButtons,
  IonMenuButton,
  IonTitle,
  IonContent,
  useIonViewWillEnter,
} from "@ionic/react";
import { useHistory } from "react-router-dom";
import { io } from "socket.io-client";
import SlideToAction from "../../components/SlideToAction";
import WalkthroughStep from "../../components/WalkthroughStep";
import OrderNumberPill from "./OrderNumberPill";
import { getActiveOrder, getSteps, setCurrentPage, getPickupStores, setActiveOrder } from "./walkthroughSteps";
import { postStepEvent } from "./stepEvents";
import { api } from "../../services/api";
import "./OrderWalkthrough.css";

const TrynbuyWaitingPage: React.FC = () => {
  const history = useHistory();
  const order = getActiveOrder();
  const trynbuyId: string | undefined = order.trynbuyId || order.trynbuy_id;
  const totalMinutes: number = Math.round(Number(order.waitingMinutes ?? order.waiting_time ?? 15) || 15);
  const steps = getSteps("Try & Buy");
  const nPickup = getPickupStores().length;
  const currentStep = nPickup * 2 + 3; // Waiting comes after GoToCustomer + Delivered

  const [elapsed, setElapsed] = useState(0);
  const [customerDone, setCustomerDone] = useState(false);
  const elapsedRef = React.useRef(0);

  const buildReturnStores = (returned: any[]) => {
    const companyIds = [...new Set(returned.map((i: any) => i.companyId).filter(Boolean))];
    const pickupStores = getPickupStores();
    return companyIds.length > 0
      ? pickupStores.filter(s => companyIds.includes(s.storeId))
      : [];
  };

  const applyElapsedSeconds = (seconds: number) => {
    const safe = Math.max(0, Math.floor(seconds || 0));
    elapsedRef.current = safe;
    setElapsed(safe);
  };

  /** Fetch full order from DB, update persisted order state with returned items + returnStores.
   *  Returns true if the customer decision is recorded in DB. */
  const fetchAndUpdateOrder = async (trynbuyId: string): Promise<boolean> => {
    try {
      const data = await api.get<any>(`/orders/${trynbuyId}`);
      const status = data?.order_status;
      const isDone = ["DECISION_DONE", "RETURNED", "COMPLETED"].includes(String(status || "").toUpperCase());

      const activeOrder = getActiveOrder();
      const dbWaitingMinutes = Number(data?.waiting_time ?? 0);
      if (isDone && Number.isFinite(dbWaitingMinutes) && dbWaitingMinutes > 0) {
        // waiting_time is actual only after payment is done
        applyElapsedSeconds(dbWaitingMinutes * 60);
      }
      if (!isDone) return false;
      const returned = (data.returned_items ?? []).map((ri: any) => ({
        id: ri.variant?.id ?? ri.id,
        name: ri.product?.name ?? "",
        size: ri.item?.size ?? "",
        quantity: ri.quantity,
        companyId: ri.product?.companyId,
      }));
      const cartItems = Array.isArray(data.cart_items) ? data.cart_items : activeOrder.cartItems;
      // Derive which pickup stores actually have returned items
      const returnStores = buildReturnStores(returned);

      const updated = {
        ...activeOrder,
        cartItems,
        returnedItems: returned,
        returnStores,
        elapsedSeconds: (Number.isFinite(dbWaitingMinutes) && dbWaitingMinutes > 0)
          ? Math.round(dbWaitingMinutes * 60)
          : elapsedRef.current,
        paymentMethod: data.payment_method ?? activeOrder.paymentMethod,
        paymentAmount: activeOrder.paymentAmount ?? data.payment_amount ?? data.customer_grand_total ?? data.grand_total,
      };
      // Persist the refreshed order state for the later payment / success screens.
      await setActiveOrder(updated);
      return true;
    } catch (err) {
      console.error("Failed to fetch order for return data:", err);
      return false;
    }
  };

  useEffect(() => { setCurrentPage("/TrynbuyWaiting"); }, []);

  // Reset on every page enter (Ionic caches pages — state survives navigation)
  const [sliderReset, setSliderReset] = useState(0);
  useIonViewWillEnter(() => {
    setCustomerDone(false);
    applyElapsedSeconds(0);
    setSliderReset(r => r + 1);

    // Check DB in case customer already proceeded before this page opened (missed socket event)
    const activeOrder = getActiveOrder();
    const trynbuyId: string | undefined = activeOrder.trynbuyId || activeOrder.trynbuy_id;
    if (trynbuyId) {
      postStepEvent(trynbuyId, "TrynbuyWaiting", "enter");
      // Ensure order is marked delivered before customer payment step
      api.post(`/orders/${trynbuyId}/delivered`).catch(() => {});

      // Customer wait starts from the durable Delivered complete event.
      api.post<any>(`/orders/${trynbuyId}/step-elapsed`, { step: "Delivered", action: "complete" })
        .then((data) => {
          const secs = Number(data?.elapsed_seconds ?? 0);
          if (Number.isFinite(secs) && secs > 0) {
            applyElapsedSeconds(secs);
          }
        })
        .catch(() => {});

      // Check order status for customer-done state
      api.post<any>(`/orders/${trynbuyId}/waiting-start`)
        .then((data) => {
          const status = String(data?.order_status || "").toUpperCase();
          const dbWaitingMinutes = Number(data?.waiting_time ?? 0);
          if (["DECISION_DONE", "RETURNED", "COMPLETED"].includes(status) && Number.isFinite(dbWaitingMinutes) && dbWaitingMinutes > 0) {
            applyElapsedSeconds(dbWaitingMinutes * 60);
          }
          if (["DECISION_DONE", "RETURNED", "COMPLETED"].includes(status)) {
            setCustomerDone(true);
            fetchAndUpdateOrder(trynbuyId).catch(() => {});
          }
        })
        .catch(() => {});
    }
  });

  // Listen for customer proceed signal from server
  useEffect(() => {
    const socket = io(import.meta.env.VITE_SOCKET_URL || "http://localhost:3005", {
      transports: ["websocket"],
    });

    socket.on("connect", () => {
      socket.emit("joinDeliveryPartners");
    });

    socket.on("customerProceedPayment", async (data: { trynbuyId: string; paymentMethod?: string; amount?: number; returnedItems?: any[] }) => {
      const activeOrder = getActiveOrder();
      const activeId = activeOrder.trynbuyId || activeOrder.trynbuy_id;
      if (!activeId || activeId === data.trynbuyId) {
        // Optimistically unlock slider using socket payload, then refresh from DB
        const returned = Array.isArray(data.returnedItems) ? data.returnedItems : [];
        const returnStores = buildReturnStores(returned);
        const updated = {
          ...activeOrder,
          cartItems: activeOrder.cartItems ?? [],
          returnedItems: returned,
          returnStores,
          paymentMethod: data.paymentMethod ?? activeOrder.paymentMethod,
          paymentAmount: data.amount ?? activeOrder.paymentAmount,
          elapsedSeconds: elapsedRef.current,
        };
        await setActiveOrder(updated);
        setCustomerDone(true);

        // Socket is just a trigger - fetch full data from DB when possible
        const done = await fetchAndUpdateOrder(data.trynbuyId);
        if (done) setCustomerDone(true);
      }
    });

    return () => { socket.disconnect(); };
  }, []);

  useEffect(() => {
    if (customerDone) return;
    const timer = setInterval(() => {
      setElapsed((e) => {
        const next = e + 1;
        elapsedRef.current = next;
        return next;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [customerDone]);

  const minutesElapsed = Math.floor(elapsed / 60);
  const displayMinutes = minutesElapsed;
  const displaySeconds = elapsed % 60;
  const earning = minutesElapsed;

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonButtons slot="start">
            <IonMenuButton />
          </IonButtons>
          <IonTitle>Waiting for Customer</IonTitle>
        </IonToolbar>
      </IonHeader>

      <OrderNumberPill />

      <IonContent fullscreen className="wt-page-bg">
        <div className="wt-content">

          {/* Step indicator */}
          <WalkthroughStep current={currentStep} steps={steps} accentColor="#ea580c" />

          {/* TnB badge */}
          <div className="wt-tnb-badge">
            {customerDone ? "CUSTOMER DONE — SWIPE TO CONTINUE" : "TRY & BUY — WAITING FOR CUSTOMER"}
          </div>

          {/* Wait timer card */}
          <div className="wt-card">
            <div className="wt-card-title">Waiting Time</div>
            <div className="wt-timer-display" style={{ color: "#ea580c" }}>
              {displayMinutes.toString().padStart(2, "0")}:{displaySeconds.toString().padStart(2, "0")}
            </div>
            <div className="wt-timer-label">
              Waiting period is {totalMinutes} mins
            </div>
            <div className="wt-timer-earning">
              <div>
                <div style={{ fontWeight: 600, fontSize: 13, color: "#16a34a" }}>Waiting Earned</div>
                <div style={{ fontSize: 11, color: "#16a34a" }}>So far this stop</div>
              </div>
              <div className="wt-timer-earning-amount">&#8377;{earning}</div>
            </div>
          </div>

          {/* What's happening card */}
          <div className="wt-card">
            <div className="wt-card-title">Try &amp; Buy Steps</div>
            <div className="wt-flow-steps">
              <div className="wt-flow-step done">
                <div className="wt-flow-step-dot">✓</div>
                <span className="wt-flow-step-text">Items delivered to customer</span>
              </div>
              <div className="wt-flow-step active">
                <div className="wt-flow-step-dot">●</div>
                <span className="wt-flow-step-text">Customer is trying on items</span>
              </div>
              <div className="wt-flow-step pending">
                <div className="wt-flow-step-dot">3</div>
                <span className="wt-flow-step-text">You'll collect returned items</span>
              </div>
              <div className="wt-flow-step pending">
                <div className="wt-flow-step-dot">4</div>
                <span className="wt-flow-step-text">Return items to store</span>
              </div>
            </div>
          </div>

          {/* Customer address card */}
          {order.deliveryAddress && (
            <div className="wt-card">
              <div className="wt-card-title">Customer Address</div>
              <div className="wt-address-text">{order.deliveryAddress}</div>
            </div>
          )}

        </div>
      </IonContent>

      {/* Fixed bottom bar */}
      <div className="wt-bottom-bar">
        <div className="wt-bottom-location">
          <span className="wt-bottom-location-icon">⏱️</span>
          <div>
            <p className="wt-bottom-location-name">Waiting at Customer</p>
            <p className="wt-bottom-location-addr">
              {order.deliveryAddress ?? "Customer's address"}
            </p>
          </div>
        </div>
        <SlideToAction
          text="Customer Done"
          color="#ea580c"
          disabled={!customerDone}
          disabledText="Waiting for customer..."
          resetTrigger={sliderReset}
          onSlideComplete={async () => {
            await postStepEvent(trynbuyId, "TrynbuyWaiting", "complete", {
              elapsedSeconds: elapsedRef.current,
              elapsedMinutes: Math.floor(elapsedRef.current / 60),
            });
            const freshOrder = getActiveOrder();
            const hasReturns = (freshOrder.returnedItems ?? []).length > 0;
            history.push(hasReturns ? "/TrynbuyReturnCollect" : "/TrynbuyPayment");
          }}
        />
      </div>
    </IonPage>
  );
};

export default TrynbuyWaitingPage;
