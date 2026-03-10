import React, { useEffect, useRef } from "react";
import {
  IonPage,
  IonContent,
  IonButton,
  IonIcon,
} from "@ionic/react";
import { checkmarkOutline } from "ionicons/icons";
import { getActiveOrder, setCurrentPage } from "./walkthroughSteps";
import { api } from "../../services/api";
import "./DeliverySuccessPage.css";

const DeliverySuccessPage: React.FC = () => {
  const order = getActiveOrder();
  const isTnB = order.type === "Try & Buy";
  const savedRef = useRef(false);

  // --- Real calculated values ---
  // deliveryFee comes from order.deliveryFee (set in newDeliveryOrder socket payload)
  const deliveryFee: number = order.deliveryFee ?? 0;

  // Waiting fee: ₹1 per elapsed minute, capped at the max fee from the order
  const elapsedMinutes: number = Math.floor((order.elapsedSeconds ?? 0) / 60);
  const waitingFeeMax: number = order.waitingFeeMax ?? 0;
  const waitingFeeEarned: number = isTnB
    ? Math.min(elapsedMinutes, waitingFeeMax)
    : 0;

  const distance: number = order.distance ?? order.distanceKm ?? 0;
  const totalEarnings: number = deliveryFee + waitingFeeEarned;
  const trynbuyId: string | undefined = order.trynbuyId || order.trynbuy_id;

  // Save earnings to DB once on mount
  useEffect(() => {
    if (savedRef.current || !trynbuyId) return;
    savedRef.current = true;

    api.post("/partner/earnings", {
      trynbuyId,
      deliverFees: deliveryFee,
      waitingFees: waitingFeeEarned,
      distance,
      waitingTime: elapsedMinutes,
    }).catch((err) => console.error("Failed to save earnings:", err));

    // Clear the active order and current page tracking
    sessionStorage.removeItem("activeOrder");
    setCurrentPage(null);
  }, []);

  return (
    <IonPage>
      <IonContent className="success-content" fullscreen>
        <div className="success-container">

          {/* Animated checkmark circle */}
          <div className="success-check-circle">
            <IonIcon icon={checkmarkOutline} className="success-check-icon" />
          </div>

          {/* Title */}
          <h2 className="success-title">Order Complete!</h2>

          {/* Order type badge */}
          <span className={`success-type-badge ${isTnB ? "trynbuy" : "standard"}`}>
            {isTnB ? "TRY & BUY" : "STANDARD DELIVERY"}
          </span>

          {/* Total earnings */}
          <div className="success-earnings-card">
            <div className="success-earnings-label">You Earned</div>
            <div className="success-earnings-amount">₹{totalEarnings}</div>
            <div className="success-earnings-sub">Added to your wallet</div>
          </div>

          {/* Stat boxes */}
          <div className="success-stats-row">
            <div className="success-stat-box">
              <div className="success-stat-value">₹{deliveryFee}</div>
              <div className="success-stat-label">Delivery Fee</div>
            </div>
            {isTnB && (
              <div className="success-stat-box">
                <div className="success-stat-value">₹{waitingFeeEarned}</div>
                <div className="success-stat-label">Waiting Fee</div>
              </div>
            )}
            <div className="success-stat-box">
              <div className="success-stat-value">{distance} km</div>
              <div className="success-stat-label">Distance</div>
            </div>
            {isTnB && (
              <div className="success-stat-box">
                <div className="success-stat-value">{elapsedMinutes} min</div>
                <div className="success-stat-label">Wait Time</div>
              </div>
            )}
          </div>

          {/* Back to Home */}
          <IonButton
            expand="block"
            className="success-home-btn"
            routerLink="/HomePage"
          >
            Back to Home
          </IonButton>

        </div>
      </IonContent>
    </IonPage>
  );
};

export default DeliverySuccessPage;
