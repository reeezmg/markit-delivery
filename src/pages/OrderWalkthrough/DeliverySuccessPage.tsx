import React, { useRef, useState } from "react";
import {
  IonPage,
  IonContent,
  IonButton,
  IonIcon,
  IonModal,
  useIonViewWillEnter,
} from "@ionic/react";
import { checkmarkOutline } from "ionicons/icons";
import { clearActiveOrder, getActiveOrder, setCurrentPage } from "./walkthroughSteps";
import OrderNumberPill from "./OrderNumberPill";
import { api } from "../../services/api";
import "./DeliverySuccessPage.css";
import { useIncomingOrderPopup } from "../../components/IncomingOrderPopupContext";

type StoreWaitingEntry = {
  companyId?: string | null;
  waitingTime?: number | null;
  waitingFees?: number | null;
};

const normalizeStoreWaitings = (value: unknown): StoreWaitingEntry[] => {
  if (typeof value === "string") {
    try {
      return normalizeStoreWaitings(JSON.parse(value));
    } catch {
      return [];
    }
  }

  if (Array.isArray(value)) {
    return value
      .map((entry) => ({
        companyId: entry?.companyId ?? null,
        waitingTime: Number(entry?.waitingTime ?? 0),
        waitingFees: Number(entry?.waitingFees ?? 0),
      }))
      .filter((entry) => entry.companyId || entry.waitingTime || entry.waitingFees);
  }

  return [];
};

const firstEarningsDetail = (value: unknown): any | null => {
  if (Array.isArray(value)) return value[0] ?? null;
  if (typeof value === "string") {
    try {
      return firstEarningsDetail(JSON.parse(value));
    } catch {
      return null;
    }
  }
  return null;
};

const DeliverySuccessPage: React.FC = () => {
  const { markDriverAvailable } = useIncomingOrderPopup();
  const savedCashRef = useRef<string | null>(null);

  const [deliveryFee, setDeliveryFee] = useState(0);
  const [waitingFeeEarned, setWaitingFeeEarned] = useState(0);
  const [storeWaitMinutes, setStoreWaitMinutes] = useState(0);
  const [storeWaitFee, setStoreWaitFee] = useState(0);
  const [elapsedMinutes, setElapsedMinutes] = useState(0);
  const [isTnB, setIsTnB] = useState(false);
  const [tips, setTips] = useState(0);
  const [totalEarnings, setTotalEarnings] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [showBreakdownModal, setShowBreakdownModal] = useState(false);
  const [isCancellationOnly, setIsCancellationOnly] = useState(false);

  // useIonViewWillEnter fires on every page entry (even when Ionic keeps the
  // component cached in the DOM), so we always read fresh persisted data.
  useIonViewWillEnter(() => {
    const order = getActiveOrder();
    const trynbuyId: string | undefined = order.trynbuyId || order.trynbuy_id;

    // Guard: if persisted order state is already cleared (Ionic can fire this twice
    // during route transitions), skip — keep the state from the first invocation.
    if (!trynbuyId) return;

    const fee: number = order.deliveryFee ?? 0;
    const cancellationOnly = !!order.cancellationOnly;
    const tnb = order.type === "Try & Buy";

    setDeliveryFee(fee);
    setIsCancellationOnly(cancellationOnly);
    setWaitingFeeEarned(0);
    setElapsedMinutes(0);
    setIsTnB(tnb);
    setTips(0);
    setTotalEarnings(fee);

    if (cancellationOnly) {
      setWaitingFeeEarned(0);
      setStoreWaitMinutes(0);
      setStoreWaitFee(0);
      setElapsedMinutes(0);
      setTips(0);
      setTotalEarnings(fee);
      return;
    }

    // Earnings are written earlier by accept / collect / customer-done events.
    // This page only displays the persisted delivery_partner_earnings snapshot.
    api.get(`/orders/${trynbuyId}`)
      .then((data: any) => {
        const earnings = firstEarningsDetail(data?.earnings_details);
        const storeWaitings = normalizeStoreWaitings(earnings?.store_waitings);
        const savedDeliveryFee = Number(earnings?.deliverFees ?? 0);
        const actualDeliveryFee = Number.isFinite(savedDeliveryFee) ? Math.max(0, savedDeliveryFee) : 0;
        const storeMinutes = storeWaitings.reduce((sum, entry) => sum + Number(entry.waitingTime ?? 0), 0);
        const storeFee = storeWaitings.reduce((sum, entry) => sum + Number(entry.waitingFees ?? 0), 0);
        const savedWaitingFee = Number(earnings?.waitingFees ?? 0);
        const savedWaitingTime = Number(earnings?.waiting_time ?? savedWaitingFee);
        const actualWaiting = tnb ? Math.max(0, savedWaitingFee) : 0;
        const actualElapsed = tnb ? Math.max(0, Math.floor(savedWaitingTime || savedWaitingFee || 0)) : 0;
        const savedTips = Number(earnings?.tips ?? 0);
        setDeliveryFee(actualDeliveryFee);
        setStoreWaitMinutes(storeMinutes);
        setStoreWaitFee(storeFee);
        setElapsedMinutes(actualElapsed);
        setWaitingFeeEarned(actualWaiting);
        setTips(savedTips);
        setTotalEarnings(actualDeliveryFee + actualWaiting + savedTips + storeFee);
      })
      .catch((err) => {
        console.error("Failed to load persisted earnings:", err);
      });

    // Record cash collected for this order once (wallet credit)
    if (savedCashRef.current !== trynbuyId) {
      savedCashRef.current = trynbuyId;

      const sessionPaymentMethod = String(order?.paymentMethod || "").toUpperCase();
      const sessionPaymentAmount = Number(order?.paymentAmount || 0);

      if (sessionPaymentMethod === "CASH" && sessionPaymentAmount > 0) {
        api.post("/partner/wallet/collect-cash", {
          trynbuyId,
          amount: sessionPaymentAmount,
          billId: order?.billId || order?.bill_id || null,
          note: "Cash collected",
        }).catch((err) => console.error("Failed to save cash collection:", err));
      } else {
        api.get(`/orders/${trynbuyId}`)
          .then((order: any) => {
            const paymentMethod = String(order?.payment_method || "").toUpperCase();
            if (paymentMethod !== "CASH") return null;

            const grandTotal = Number(order?.grand_total || 0);
            const subtotal = Number(order?.subtotal || 0);
            const totalDiscount = Number(order?.total_discount || 0);
            const shipping = Number(order?.shipping || 0);
            const totalBill = grandTotal > 0 ? grandTotal : subtotal - totalDiscount + shipping;

            if (totalBill > 0) {
              return api.post("/partner/wallet/collect-cash", {
                trynbuyId,
                amount: totalBill,
                billId: order?.bill_id || null,
                note: "Cash collected",
              });
            }
            return null;
          })
          .catch((err) => console.error("Failed to save cash collection:", err));
      }
    }

  });

  const finalizeOrder = async () => {
    const order = getActiveOrder();
    const trynbuyId: string | undefined = order.trynbuyId || order.trynbuy_id;
    if (!trynbuyId || submitting) return;

    setSubmitting(true);
    try {
      await api.post(`/orders/${trynbuyId}/complete`);
      await markDriverAvailable(trynbuyId);
      await clearActiveOrder();
      setCurrentPage(null);
      window.location.href = "/HomePage";
    } catch (err) {
      console.error("Failed to complete order:", err);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <IonPage>
      <OrderNumberPill />

      <IonContent className="success-content" fullscreen>
        <div className="success-shell">
          <div className="success-hero">
            <div className="success-hero-glow" />
            <div className="success-check-circle">
              <IonIcon icon={checkmarkOutline} className="success-check-icon" />
            </div>
            <div className="success-title-wrap">
              <h2 className="success-title">{isCancellationOnly ? "Order Cancelled" : "Order Complete"}</h2>
              <p className="success-subtitle">
                {isCancellationOnly
                  ? "The cancellation result has been recorded in your earnings."
                  : "The delivery is done and the earnings are in motion."}
              </p>
            </div>
            <span className={`success-type-badge ${isTnB ? "trynbuy" : "standard"}`}>
              {isTnB ? "TRY & BUY" : "STANDARD DELIVERY"}
            </span>
          </div>

          <div className="success-earnings-card">
            <div className="success-earnings-label">Total added to wallet</div>
            <div className="success-earnings-amount">&#8377;{totalEarnings}</div>
            <div className="success-earnings-sub">
              {isCancellationOnly
                ? "Includes the final cancellation payout for this order."
                : "Includes delivery fee, waiting, store wait, and tips"}
            </div>
          </div>

          <IonButton
            fill="clear"
            className="success-details-btn"
            onClick={() => setShowBreakdownModal(true)}
          >
            Earnings details
          </IonButton>

          <IonButton
            expand="block"
            className="success-home-btn"
            disabled={submitting}
            onClick={finalizeOrder}
          >
            {submitting ? "Returning..." : "Return to Home"}
          </IonButton>
        </div>

        <IonModal
          isOpen={showBreakdownModal}
          onDidDismiss={() => setShowBreakdownModal(false)}
          breakpoints={[0, 0.58]}
          initialBreakpoint={0.58}
          handleBehavior="cycle"
          className="success-breakdown-modal"
        >
          <div className="success-breakdown-sheet">
            <div className="success-breakdown-sheet-header">
              <div>
                <div className="success-card-title">Earnings Breakdown</div>
                <div className="success-breakdown-note">Paired values are shown together.</div>
              </div>

            </div>

            <div className="success-breakdown-list">
              <div className="success-breakdown-row">
                <span>Delivery fee</span>
                <strong>&#8377;{deliveryFee}</strong>
              </div>
              {isTnB && (
                <div className="success-breakdown-row">
                  <span>Customer waiting fee + timer</span>
                  <strong>&#8377;{waitingFeeEarned} / {elapsedMinutes} min</strong>
                </div>
              )}
              {(storeWaitFee > 0 || storeWaitMinutes > 0) && (
                <div className="success-breakdown-row">
                  <span>Store wait fee + timer</span>
                  <strong>&#8377;{storeWaitFee} / {storeWaitMinutes} min</strong>
                </div>
              )}
              {tips > 0 && (
                <div className="success-breakdown-row">
                  <span>Tips</span>
                  <strong>&#8377;{tips}</strong>
                </div>
              )}
            </div>
          </div>
        </IonModal>
      </IonContent>
    </IonPage>
  );
};

export default DeliverySuccessPage;
