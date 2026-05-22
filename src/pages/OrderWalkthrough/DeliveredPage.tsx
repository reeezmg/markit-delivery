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
import { useHistory } from "react-router-dom";
import SlideToAction from "../../components/SlideToAction";
import WalkthroughStep from "../../components/WalkthroughStep";
import OrderNumberPill from "./OrderNumberPill";
import { getActiveOrder, getSteps, getAccentColor, setCurrentPage, getPickupStores } from "./walkthroughSteps";
import { postStepEvent } from "./stepEvents";
import { api } from "../../services/api";
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

const DeliveredPage: React.FC = () => {
  const [photo, setPhoto] = useState<string | null>(null);
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [deliveryOtpInput, setDeliveryOtpInput] = useState("");
  const [deliveryOtpVerified, setDeliveryOtpVerified] = useState(false);
  const [otpError, setOtpError] = useState(false);
  const [otpLoading, setOtpLoading] = useState(false);
  const history = useHistory();

  const order = getActiveOrder();
  const trynbuyId: string | undefined = order.trynbuyId || order.trynbuy_id;
  const steps = getSteps(order.type);
  const accentColor = getAccentColor(order.type);
  const pickupStores = getPickupStores();
  const nPickup = pickupStores.length;
  const storeNameById = new Map(
    pickupStores
      .filter((s) => s.storeId)
      .map((s) => [s.storeId as string, s.storeName ?? "Store"])
  );
  // Delivered is the step after GoToDrop
  const currentStep = nPickup * 2 + 2;

  const [sliderReset, setSliderReset] = useState(0);
  useEffect(() => { setCurrentPage("/Delivered"); }, []);

  useIonViewWillEnter(() => {
    setSliderReset(r => r + 1);
    setDeliveryOtpVerified(false);
    setDeliveryOtpInput("");
    setOtpError(false);
    postStepEvent(trynbuyId, "Delivered", "enter");
  });

  const verifyDeliveryOtp = async () => {
    setOtpLoading(true);
    setOtpError(false);
    try {
      const res = await api.post<any>(`/orders/${trynbuyId}/verify-delivery-otp`, {
        otp: deliveryOtpInput,
      });
      if (res?.valid) {
        setDeliveryOtpVerified(true);
      } else {
        setOtpError(true);
      }
    } catch {
      setOtpError(true);
    } finally {
      setOtpLoading(false);
    }
  };

  useEffect(() => {
    if (!trynbuyId) { setLoading(false); return; }
    api.get<any>(`/orders/${trynbuyId}`)
      .then((data) => {
        const items: CartItem[] = (data.cart_items ?? []).map((ci: any) => ({
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
        setCartItems(items);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [trynbuyId]);

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonButtons slot="start">
            <IonMenuButton />
          </IonButtons>
          <IonTitle>Complete Delivery</IonTitle>
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

          {/* Delivery address card */}
          <div className="wt-card">
            <div className="wt-card-title">Delivery Address</div>
            <div className="wt-address-name">Customer</div>
            <div className="wt-address-text">
              {order.deliveryAddress ?? "Customer's address"}
            </div>
          </div>

          {/* Items delivered card */}
          <div className="wt-card">
            <div className="wt-card-title">Items Delivered</div>
            {loading ? (
              <div style={{ textAlign: "center", padding: "16px 0" }}>
                <IonSpinner name="crescent" />
              </div>
            ) : cartItems.length === 0 ? (
              <p style={{ color: "#9ca3af", fontSize: 14, marginTop: 8, textAlign: "center", padding: "12px 0" }}>
                No items found for this delivery.
              </p>
            ) : (() => {
              const groups: Record<string, { storeName: string; items: CartItem[] }> = {};
              for (const item of cartItems) {
                const key = item.storeId ?? "_all";
                if (!groups[key]) {
                  const storeName = item.storeName ?? (item.storeId ? storeNameById.get(item.storeId) : undefined);
                  groups[key] = { storeName: storeName ?? "Store", items: [] };
                }
                groups[key].items.push(item);
              }
              const groupEntries = Object.entries(groups);
              const multiGroup = groupEntries.length > 1;

              return groupEntries.map(([key, group]) => (
                <div key={key} style={multiGroup ? { marginBottom: 16 } : undefined}>
                  {multiGroup && (
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
                      {group.items.map((item) => (
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
                </div>
              ));
            })()}
          </div>

          {/* Photo upload card */}
          <div className="wt-card">
            <div className="wt-card-title">Upload Photo</div>
            <div
              className="wt-upload-box"
              onClick={() => document.getElementById("deliveredPhotoInput")?.click()}
            >
              <IonIcon icon={cameraOutline} className="wt-upload-icon" />
              <p className="wt-upload-text">
                {photo ? "Photo added ✓" : "Tap to add photo of the delivery"}
              </p>
              <input
                id="deliveredPhotoInput"
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
        {!deliveryOtpVerified && (
          <div className="wt-card" style={{ marginBottom: 10 }}>
            <div className="wt-card-title">Enter Customer OTP to Confirm Delivery</div>
            <div style={{ display: "flex", gap: 8, alignItems: "center", marginTop: 8 }}>
              <input
                type="number"
                inputMode="numeric"
                maxLength={6}
                placeholder="6-digit OTP"
                value={deliveryOtpInput}
                onChange={(e) => { setDeliveryOtpInput(e.target.value.slice(0, 6)); setOtpError(false); }}
                style={{
                  flex: 1, border: otpError ? "1.5px solid #ef4444" : "1.5px solid #d1d5db",
                  borderRadius: 8, padding: "8px 12px", fontSize: 18, letterSpacing: 4,
                  fontWeight: 700, outline: "none",
                }}
              />
              <button
                onClick={verifyDeliveryOtp}
                disabled={otpLoading || deliveryOtpInput.length < 6}
                style={{
                  background: "#6366f1", color: "#fff", border: "none", borderRadius: 8,
                  padding: "8px 16px", fontWeight: 600, fontSize: 14, cursor: "pointer",
                  opacity: otpLoading || deliveryOtpInput.length < 6 ? 0.5 : 1,
                }}
              >
                {otpLoading ? "..." : "Verify"}
              </button>
            </div>
            {otpError && (
              <p style={{ color: "#ef4444", fontSize: 12, marginTop: 4 }}>Invalid OTP — ask the customer</p>
            )}
          </div>
        )}
        <div className="wt-bottom-location">
          <span className="wt-bottom-location-icon">📍</span>
          <div>
            <p className="wt-bottom-location-name">Customer</p>
            <p className="wt-bottom-location-addr">
              {order.deliveryAddress ?? "Customer's address"}
            </p>
          </div>
        </div>
        <SlideToAction
          text="Confirm Delivery"
          color={accentColor}
          disabled={!deliveryOtpVerified}
          disabledText="Verify customer OTP first"
          resetTrigger={sliderReset}
          onSlideComplete={async () => {
            await postStepEvent(trynbuyId, "Delivered", "complete");
            const activeOrder = getActiveOrder();
            const activeId = activeOrder.trynbuyId || activeOrder.trynbuy_id || trynbuyId;
            if (activeId) {
              api.post(`/orders/${activeId}/delivered`).catch(() => {});
            }

            if (activeOrder.type === "Try & Buy") {
              history.push("/TrynbuyWaiting");
            } else {
              history.push("/DeliverySuccessPage");
            }
          }}
        />
      </div>
    </IonPage>
  );
};

export default DeliveredPage;
