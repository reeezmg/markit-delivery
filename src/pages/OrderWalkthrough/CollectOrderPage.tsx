import React, { useEffect, useState } from "react";
import {
  IonPage,
  IonHeader,
  IonToolbar,
  IonButtons,
  IonMenuButton,
  IonTitle,
  IonContent,
  IonIcon,
  IonSpinner,
  useIonViewWillEnter,
} from "@ionic/react";
import { cameraOutline } from "ionicons/icons";
import { useHistory } from "react-router";
import SlideToAction from "../../components/SlideToAction";
import WalkthroughStep from "../../components/WalkthroughStep";
import OrderNumberPill from "./OrderNumberPill";
import {
  getActiveOrder,
  getSteps,
  getAccentColor,
  setCurrentPage,
  getPickupStores,
  getPickupStoreIndex,
  setPickupStoreIndex,
  getCurrentPickupStore,
} from "./walkthroughSteps";
import { postStepEvent } from "./stepEvents";
import { api } from "../../services/api";
import { io } from "socket.io-client";
import "./OrderWalkthrough.css";

interface CartItem {
  id: string;
  productName: string;
  variantName: string;
  size: string;
  barcode: string;
  quantity: number;
  price: number;
  storeId?: string;
  storeName?: string;
}

const CollectOrderPage: React.FC = () => {
  const [elapsed, setElapsed] = useState(0); // total seconds elapsed
  const [photo, setPhoto] = useState<string | null>(null);
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [loadingItems, setLoadingItems] = useState(true);
  const [isStorePacked, setIsStorePacked] = useState(false);
  const [pickupOtpInput, setPickupOtpInput] = useState("");
  const [pickupOtpVerified, setPickupOtpVerified] = useState(false);
  const [otpError, setOtpError] = useState(false);
  const [otpLoading, setOtpLoading] = useState(false);
  const router = useHistory();
  const elapsedRef = React.useRef(0);
  const socketRef = React.useRef<ReturnType<typeof io> | null>(null);

  const order = getActiveOrder();
  const steps = getSteps(order.type);
  const accentColor = getAccentColor(order.type);
  const trynbuyId: string | undefined = order.trynbuyId || order.trynbuy_id;

  const applyElapsedSeconds = (seconds: number) => {
    const safe = Math.max(0, Math.floor(seconds || 0));
    elapsedRef.current = safe;
    setElapsed(safe);
  };

  const [pickupIdx, setPickupIdxState] = useState(getPickupStoreIndex);
  const pickupStores = getPickupStores();
  const currentStore = pickupStores[pickupIdx] ?? pickupStores[0] ?? {};
  const currentStoreKey = String(currentStore.companyId ?? currentStore.storeId ?? "").trim();
  // Step 2 for store 0, step 4 for store 1, etc.
  const currentStep = pickupIdx * 2 + 2;
  const storeLabel = pickupStores.length > 1
    ? `Store ${pickupIdx + 1} of ${pickupStores.length}`
    : undefined;

  const isPackedEvent = (event: any) =>
    String(event?.step || "").trim() === "Packed" &&
    String(event?.action || "").trim().toLowerCase() === "complete";

  const getEventCompanyKey = (event: any) =>
    String(
      event?.companyId ??
      event?.company_id ??
      event?.meta?.companyId ??
      event?.meta?.storeId ??
      ""
    ).trim();

  const isCurrentStoreEvent = (event: any) => {
    if (!currentStoreKey) return true;
    const eventCompanyKey = getEventCompanyKey(event);
    if (eventCompanyKey) return eventCompanyKey === currentStoreKey;
    return String(event?.meta?.source || "").trim() === "store-statuses";
  };

  const isStepCompleteEvent = (event: any, stepName: string) =>
    String(event?.step || "").trim() === stepName &&
    String(event?.action || "").trim().toLowerCase() === "complete";

  const getEventDate = (event: any) => {
    const raw = event?.created_at ?? event?.createdAt;
    const date = raw ? new Date(raw) : null;
    return date && Number.isFinite(date.getTime()) ? date : null;
  };

  const getPackedElapsedSeconds = (events: any[]) => {
    let startedAt: Date | null = null;
    let packedAt: Date | null = null;

    for (const event of events) {
      if (!isCurrentStoreEvent(event)) continue;
      if (isStepCompleteEvent(event, "GoToPickup")) {
        startedAt = getEventDate(event) ?? startedAt;
      }
      if (isPackedEvent(event)) {
        packedAt = getEventDate(event) ?? packedAt;
        if (startedAt && packedAt) break;
      }
    }

    if (!startedAt || !packedAt) return null;
    return Math.max(0, Math.floor((packedAt.getTime() - startedAt.getTime()) / 1000));
  };

  const hasStorePackedEvent = (events: any[]) => {
    if (!Array.isArray(events)) return false;
    if (!currentStoreKey) {
      return events.some((event) => isPackedEvent(event));
    }
    return events.some((event) => {
      if (!isPackedEvent(event)) return false;
      return isCurrentStoreEvent(event);
    });
  };

  const hasStoreCollectComplete = (events: any[]) => {
    if (!Array.isArray(events)) return false;
    if (!currentStoreKey) {
      return events.some((event) => {
        const step = String(event?.step || "").trim();
        const action = String(event?.action || "").trim().toLowerCase();
        return step === "CollectOrder" && action === "complete";
      });
    }
    return events.some((event) => {
      if (!isStepCompleteEvent(event, "CollectOrder")) return false;
      return isCurrentStoreEvent(event);
    });
  };

  useEffect(() => {
    if (!trynbuyId) { setLoadingItems(false); return; }
    api.get<any>(`/orders/${trynbuyId}`)
      .then((data) => {
        const allItems: CartItem[] = (data.cart_items ?? []).map((ci: any) => ({
          id: ci.id,
          productName: ci.product?.name ?? "—",
          variantName: ci.variant?.name ?? "—",
          size: ci.item?.size ?? "—",
          barcode: ci.item?.barcode ?? "—",
          quantity: ci.quantity,
          price: ci.variant?.dprice ?? ci.variant?.sprice ?? 0,
          storeId: ci.storeId ?? ci.variant?.companyId ?? ci.product?.companyId,
          storeName: ci.storeName ?? ci.product?.companyName,
        }));

        // Filter to the current pickup store if storeId is available
        const items = currentStore.storeId
          ? allItems.filter((i: any) => i.storeId === currentStore.storeId)
          : allItems;

        setCartItems(items);
      })
      .catch(() => {})
      .finally(() => setLoadingItems(false));
  }, [trynbuyId, pickupIdx]);

  useEffect(() => {
    let alive = true;
    setIsStorePacked(false);

    if (!trynbuyId) {
      return;
    }

    const socket = io(import.meta.env.VITE_SOCKET_URL || "http://localhost:3005", {
      transports: ["websocket"],
    });
    socketRef.current = socket;

    const applyPackedState = (events: any[]) => {
      if (!alive) return;
      const packed = hasStorePackedEvent(events);
      const collected = hasStoreCollectComplete(events);
      setIsStorePacked(packed && !collected);
      if (packed && !collected) {
        const packedElapsed = getPackedElapsedSeconds(events);
        if (packedElapsed !== null) {
          applyElapsedSeconds(packedElapsed);
        }
      }
    };

    const loadPackedState = async () => {
      try {
        const data = await api.get<any>(`/checkout/trynbuy/${trynbuyId}/step-events`);
        applyPackedState(Array.isArray(data?.events) ? data.events : []);
      } catch {
        // Keep waiting for live socket updates if the initial fetch fails.
      }
    };

    const handleDeliveryStepUpdate = (payload: any) => {
      const payloadOrderId = String(payload?.trynbuy_id ?? payload?.trynbuyId ?? "").trim();
      if (payloadOrderId !== String(trynbuyId).trim()) return;

      const step = String(payload?.step || "").trim();
      const action = String(payload?.action || "").trim().toLowerCase();
      if (step === "Packed" && action === "complete") {
        if (isCurrentStoreEvent(payload)) {
          setIsStorePacked(true);
        }
        return;
      }

      if (step === "CollectOrder" && action === "complete") {
        if (isCurrentStoreEvent(payload)) {
          setIsStorePacked(false);
        }
      }
    };

    socket.on("connect", () => {
      socket.emit("joinDeliveryPartners");
    });
    socket.on("deliveryStepUpdate", handleDeliveryStepUpdate);

    void loadPackedState();

    return () => {
      alive = false;
      socket.off("deliveryStepUpdate", handleDeliveryStepUpdate);
      socket.disconnect();
      if (socketRef.current === socket) {
        socketRef.current = null;
      }
    };
  }, [trynbuyId, currentStoreKey]);

  useEffect(() => { setCurrentPage("/CollectOrder"); }, []);

  // Refresh index and restore stopwatch on every page enter (Ionic caches pages)
  const [sliderReset, setSliderReset] = useState(0);
  useIonViewWillEnter(() => {
    const idx = getPickupStoreIndex();
    const store = pickupStores[idx] ?? pickupStores[0] ?? {};
    setPickupIdxState(idx);
    setSliderReset(r => r + 1);
    setPickupOtpVerified(false);
    setPickupOtpInput("");
    setOtpError(false);
    applyElapsedSeconds(0);

    if (trynbuyId) {
      // Query elapsed FIRST — if >0 an enter event already exists; skip re-posting to preserve the original timestamp
      api.post<any>(`/orders/${trynbuyId}/step-elapsed`, { step: "GoToPickup", action: "complete", storeIndex: idx })
        .then((data) => {
          const secs = Number(data?.elapsed_seconds ?? 0);
          if (Number.isFinite(secs) && secs > 0) {
            applyElapsedSeconds(secs);
            // enter event already exists — don't post a new one so the timer persists across refreshes
          }
        })
        .catch(() => {});
    }

    postStepEvent(trynbuyId, "CollectOrder", "enter", {
      storeIndex: idx,
    }, store.companyId);
  });

  const displayMinutes = Math.floor(elapsed / 60);
  const displaySeconds = elapsed % 60;
  const FREE_MINUTES = 3;
  const earning = Math.max(0, displayMinutes - FREE_MINUTES);

  const verifyPickupOtp = async () => {
    setOtpLoading(true);
    setOtpError(false);
    try {
      const res = await api.post<any>(`/orders/${trynbuyId}/verify-pickup-otp`, {
        otp: pickupOtpInput,
        companyId: currentStore.companyId,
      });
      if (res?.valid) {
        setPickupOtpVerified(true);
      } else {
        setOtpError(true);
      }
    } catch {
      setOtpError(true);
    } finally {
      setOtpLoading(false);
    }
  };

  // Stopwatch — counts up
  useEffect(() => {
    if (isStorePacked) return;
    const timer = setInterval(() => {
      setElapsed((e) => {
        const next = e + 1;
        elapsedRef.current = next;
        return next;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [isStorePacked]);

  // Handle Android system / browser back button
  useEffect(() => {
    const handleBackButton = (ev: any) => {
      ev.preventDefault();
      router.push("/HomePage", "root");
    };

    document.addEventListener("ionBackButton", handleBackButton);
    window.onpopstate = () => router.push("/HomePage", "root");

    return () => {
      document.removeEventListener("ionBackButton", handleBackButton);
      window.onpopstate = null;
    };
  }, [router]);

  const handleCollected = async () => {
    await postStepEvent(trynbuyId, "CollectOrder", "complete", {
      storeIndex: pickupIdx,
      elapsedSeconds: elapsedRef.current,
      elapsedMinutes: Math.floor(elapsedRef.current / 60),
    }, (pickupStores[pickupIdx] ?? pickupStores[0] ?? {}).companyId);

    const nextIdx = pickupIdx + 1;
    if (nextIdx < pickupStores.length) {
      // More stores to pick up from — advance index and go back to GoToPickup
      setPickupStoreIndex(nextIdx);
      router.push("/GoToPickup", "forward");
    } else {
      // All stores collected — head to the customer
      router.push("/GoToDrop", "forward");
    }
  };

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonButtons slot="start">
            <IonMenuButton />
          </IonButtons>
          <IonTitle>
            {storeLabel ? `Collect Order — ${storeLabel}` : "Collect Order"}
          </IonTitle>
        </IonToolbar>
      </IonHeader>

      <OrderNumberPill />

      <IonContent fullscreen className="wt-page-bg">
        <div className="wt-content">

          {/* Step indicator */}
          <WalkthroughStep current={currentStep} steps={steps} accentColor={accentColor} />

          {/* TnB badge */}
          {order.type === "Try & Buy" && (
            <div className="wt-tnb-badge">TRY &amp; BUY ORDER</div>
          )}

          {/* Wait timer card */}
          <div className="wt-card">
            <div className="wt-card-title">Wait Timer</div>
            <div
              className="wt-timer-display"
              style={{ color: accentColor }}
            >
              {displayMinutes.toString().padStart(2, "0")}:{displaySeconds.toString().padStart(2, "0")}
            </div>
            <div className="wt-timer-label">
              Free for first 3 min, then &#8377;1/min
            </div>
            <div className="wt-timer-earning">
              <div>
                <div style={{ fontWeight: 600, fontSize: 13, color: "#16a34a" }}>Waiting Fee</div>
                <div style={{ fontSize: 11, color: "#16a34a" }}>&#8377;1 per min after 3 min</div>
              </div>
              <div className="wt-timer-earning-amount">&#8377;{earning}</div>
            </div>
          </div>

          {/* Items card */}
          <div className="wt-card">
            <div className="wt-card-title">
              Items to Collect
              {storeLabel && (
                <span style={{ fontWeight: 400, fontSize: 12, color: "#6b7280", marginLeft: 6 }}>
                  ({storeLabel})
                </span>
              )}
            </div>
            {loadingItems ? (
              <div style={{ textAlign: "center", padding: "16px 0" }}>
                <IonSpinner name="crescent" />
              </div>
            ) : (
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
                  {cartItems.map((item) => (
                    <tr key={item.id}>
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
            )}
          </div>

          {/* Photo upload card */}
          <div className="wt-card">
            <div className="wt-card-title">Upload Photo</div>
            <div
              className="wt-upload-box"
              onClick={() => document.getElementById("collectPhotoInput")?.click()}
            >
              <IonIcon icon={cameraOutline} className="wt-upload-icon" />
              <p className="wt-upload-text">
                {photo ? "Photo added ✓" : "Tap to add photo of the package"}
              </p>
              <input
                id="collectPhotoInput"
                type="file"
                accept="image/*"
                style={{ display: "none" }}
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) setPhoto(URL.createObjectURL(file));
                }}
              />
              {photo && <img src={photo} alt="Preview" className="wt-photo-preview" />}
            </div>
          </div>

        </div>
      </IonContent>

      {/* Fixed bottom bar */}
      <div className="wt-bottom-bar">
        {!pickupOtpVerified && (
          isStorePacked ? (
            <div className="wt-card" style={{ marginBottom: 10 }}>
              <div className="wt-card-title">Item is ready to be picked</div>
              <div style={{ fontSize: 12, color: "#16a34a", marginTop: 4 }}>
                {currentStore.storeName ?? "Store"} has packed the items. Enter the OTP to collect.
              </div>
              <div style={{ display: "flex", gap: 8, alignItems: "center", marginTop: 8 }}>
                <input
                  type="number"
                  inputMode="numeric"
                  maxLength={6}
                  placeholder="6-digit OTP"
                  value={pickupOtpInput}
                  onChange={(e) => { setPickupOtpInput(e.target.value.slice(0, 6)); setOtpError(false); }}
                  style={{
                    flex: 1, border: otpError ? "1.5px solid #ef4444" : "1.5px solid #d1d5db",
                    borderRadius: 8, padding: "8px 12px", fontSize: 18, letterSpacing: 4,
                    fontWeight: 700, outline: "none",
                  }}
                />
                <button
                  onClick={verifyPickupOtp}
                  disabled={otpLoading || pickupOtpInput.length < 6}
                  style={{
                    background: "#16a34a", color: "#fff", border: "none", borderRadius: 8,
                    padding: "8px 16px", fontWeight: 600, fontSize: 14, cursor: "pointer",
                    opacity: otpLoading || pickupOtpInput.length < 6 ? 0.5 : 1,
                  }}
                >
                  {otpLoading ? "..." : "Verify"}
                </button>
              </div>
              {otpError && (
                <p style={{ color: "#ef4444", fontSize: 12, marginTop: 4 }}>Invalid OTP — ask store staff</p>
              )}
            </div>
          ) : (
            <div className="wt-card" style={{ marginBottom: 10 }}>
              <div className="wt-card-title">Waiting for store packing</div>
              <div style={{ fontSize: 12, color: "#6b7280", marginTop: 4 }}>
                OTP will appear here once {currentStore.storeName ?? "this store"} marks the items as packed.
              </div>
            </div>
          )
        )}
        <div className="wt-bottom-location">
          <span className="wt-bottom-location-icon">🏪</span>
          <div>
            <p className="wt-bottom-location-name">
              {currentStore.storeName ?? "Pickup Store"}
            </p>
            <p className="wt-bottom-location-addr">
              {currentStore.storeAddress ?? "Collect items from the store"}
            </p>
          </div>
        </div>
        <SlideToAction
          text={pickupIdx + 1 < pickupStores.length ? "Collected — Next Store →" : "Collected"}
          color={accentColor}
          disabled={!pickupOtpVerified}
          disabledText="Verify store OTP to collect"
          resetTrigger={sliderReset}
          onSlideComplete={handleCollected}
        />
      </div>
    </IonPage>
  );
};

export default CollectOrderPage;

