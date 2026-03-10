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
import { getActiveOrder, TRYNBUY_STEPS, setCurrentPage } from "./walkthroughSteps";
import "./OrderWalkthrough.css";

const TrynbuyWaitingPage: React.FC = () => {
  const history = useHistory();
  const order = getActiveOrder();
  const totalMinutes: number = order.waitingMinutes ?? 30;

  const [minutes, setMinutes] = useState(totalMinutes);
  const [seconds, setSeconds] = useState(0);
  const [elapsed, setElapsed] = useState(0);
  const [customerDone, setCustomerDone] = useState(false);
  const elapsedRef = React.useRef(0);

  useEffect(() => { setCurrentPage("/TrynbuyWaiting"); }, []);

  // Reset on every page enter (Ionic caches pages — state survives navigation)
  useIonViewWillEnter(() => {
    setCustomerDone(false);
    setElapsed(0);
    elapsedRef.current = 0;
    setMinutes(totalMinutes);
    setSeconds(0);
  });

  // Listen for customer proceed signal from server
  useEffect(() => {
    const socket = io(import.meta.env.VITE_SOCKET_URL || "http://localhost:3005", {
      transports: ["websocket"],
    });

    socket.on("connect", () => {
      socket.emit("joinDeliveryPartners");
    });

    socket.on("customerProceedPayment", (data: { trynbuyId: string; paymentMethod: string; amount: number; returnedItems?: any[] }) => {
      const activeOrder = getActiveOrder();
      const activeId = activeOrder.trynbuyId || activeOrder.trynbuy_id;
      if (!activeId || activeId === data.trynbuyId) {
        const updated = {
          ...activeOrder,
          paymentMethod: data.paymentMethod,
          paymentAmount: data.amount,
          returnedItems: data.returnedItems ?? [],
          elapsedSeconds: elapsedRef.current,
        };
        sessionStorage.setItem("activeOrder", JSON.stringify(updated));
        setCustomerDone(true);
      }
    });

    return () => { socket.disconnect(); };
  }, []);

  useEffect(() => {
    const timer = setInterval(() => {
      setElapsed((e) => { elapsedRef.current = e + 1; return e + 1; });
      setSeconds((s) => {
        if (s > 0) return s - 1;
        if (minutes > 0) {
          setMinutes((m) => m - 1);
          return 59;
        }
        return 0;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [minutes]);

  const minutesElapsed = Math.floor(elapsed / 60);
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

      <IonContent fullscreen className="wt-page-bg">
        <div className="wt-content">

          {/* Step indicator */}
          <WalkthroughStep current={5} steps={TRYNBUY_STEPS} accentColor="#ea580c" />

          {/* TnB badge */}
          <div className="wt-tnb-badge">
            {customerDone ? "CUSTOMER DONE — SWIPE TO CONTINUE" : "TRY & BUY — WAITING FOR CUSTOMER"}
          </div>

          {/* Wait timer card */}
          <div className="wt-card">
            <div className="wt-card-title">Waiting Time</div>
            <div className="wt-timer-display" style={{ color: "#ea580c" }}>
              {minutes.toString().padStart(2, "0")}:{seconds.toString().padStart(2, "0")}
            </div>
            <div className="wt-timer-label">
              Earning ₹1 per min while waiting (up to {totalMinutes} mins)
            </div>
            <div className="wt-timer-earning">
              <div>
                <div style={{ fontWeight: 600, fontSize: 13, color: "#16a34a" }}>Waiting Earned</div>
                <div style={{ fontSize: 11, color: "#16a34a" }}>So far this stop</div>
              </div>
              <div className="wt-timer-earning-amount">₹{earning}</div>
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
          onSlideComplete={() => history.push("/TrynbuyReturnCollect")}
        />
      </div>
    </IonPage>
  );
};

export default TrynbuyWaitingPage;
