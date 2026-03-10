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
} from "@ionic/react";
import { QRCodeSVG } from "qrcode.react";
import { cameraOutline } from "ionicons/icons";
import { useHistory } from "react-router-dom";
import SlideToAction from "../../components/SlideToAction";
import WalkthroughStep from "../../components/WalkthroughStep";
import { getActiveOrder, TRYNBUY_STEPS, setCurrentPage } from "./walkthroughSteps";
import { api } from "../../services/api";
import "./OrderWalkthrough.css";

interface ReturnedItem {
  id: string;
  productName: string;
  variantName: string;
  size: string;
  barcode: string;
  quantity: number;
  price: number;
}

const TrynbuyReturnCollectPage: React.FC = () => {
  const history = useHistory();
  const order = getActiveOrder();
  const trynbuyId: string | undefined = order.trynbuyId || order.trynbuy_id;

  // Seed from sessionStorage (set by socket event), then overwrite with API data
  const [returnedItems, setReturnedItems] = useState<ReturnedItem[]>(() =>
    (order.returnedItems ?? []).map((i: any) => ({
      id: i.id ?? i.variant?.id,
      productName: i.productName ?? i.product?.name ?? i.name ?? "—",
      variantName: i.variantName ?? i.variant?.name ?? "—",
      size: i.size ?? i.item?.size ?? "—",
      barcode: i.barcode ?? i.item?.barcode ?? "—",
      quantity: i.quantity,
      price: i.price ?? i.variant?.dprice ?? i.variant?.sprice ?? 0,
    }))
  );
  const [loading, setLoading] = useState(!!trynbuyId);
  const [photo, setPhoto] = useState<string | null>(null);

  useEffect(() => { setCurrentPage("/TrynbuyReturnCollect"); }, []);

  // Always fetch from API for rich data (barcode, price) + refresh resilience
  useEffect(() => {
    if (!trynbuyId) return;

    api.get<any>(`/orders/${trynbuyId}`)
      .then((data) => {
        if (Array.isArray(data.returned_items) && data.returned_items.length > 0) {
          setReturnedItems(
            data.returned_items.map((i: any) => ({
              id: i.variant?.id ?? i.id,
              productName: i.product?.name ?? "—",
              variantName: i.variant?.name ?? "—",
              size: i.item?.size ?? "—",
              barcode: i.item?.barcode ?? "—",
              quantity: i.quantity,
              price: i.variant?.dprice ?? i.variant?.sprice ?? 0,
            }))
          );
        }
      })
      .catch((err) => console.error("Failed to fetch order details:", err))
      .finally(() => setLoading(false));
  }, [trynbuyId]);

  // Block back-navigation
  useEffect(() => {
    const handleBackButton = (ev: any) => { ev.preventDefault(); };
    document.addEventListener("ionBackButton", handleBackButton);
    return () => document.removeEventListener("ionBackButton", handleBackButton);
  }, []);

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonButtons slot="start">
            <IonMenuButton />
          </IonButtons>
          <IonTitle>Collect Returns</IonTitle>
        </IonToolbar>
      </IonHeader>

      <IonContent fullscreen className="wt-page-bg">
        <div className="wt-content">

          {/* Step indicator */}
          <WalkthroughStep current={6} steps={TRYNBUY_STEPS} accentColor="#ea580c" />

          {/* TnB badge */}
          <div className="wt-tnb-badge">TRY &amp; BUY — COLLECT RETURNS</div>

          {/* Payment info card */}
          {order.paymentMethod === "CASH" && (
            <div className="wt-card" style={{ textAlign: "center" }}>
              <div className="wt-card-title">Payment — Cash</div>
              <div style={{ fontSize: 36, fontWeight: 800, color: "#16a34a", margin: "8px 0" }}>
                ₹{order.paymentAmount ?? 0}
              </div>
              <div style={{ fontSize: 13, color: "#6b7280" }}>Collect cash from customer</div>
            </div>
          )}

          {order.paymentMethod === "UPI" && (
            <div className="wt-card" style={{ textAlign: "center" }}>
              <div className="wt-card-title">Payment — UPI</div>
              <div style={{ display: "flex", justifyContent: "center", margin: "12px 0" }}>
                <QRCodeSVG
                  value={`upi://pay?pa=9538340789@ibl&am=${order.paymentAmount ?? 0}&cu=INR&tn=Markit+TryBuy`}
                  size={180}
                />
              </div>
              <div style={{ fontSize: 13, fontWeight: 600, color: "#374151", marginBottom: 2 }}>9538340789@ibl</div>
              <div style={{ fontSize: 22, fontWeight: 800, color: "#2563eb" }}>₹{order.paymentAmount ?? 0}</div>
              <div style={{ fontSize: 12, color: "#6b7280", marginTop: 4 }}>Ask customer to scan and pay</div>
            </div>
          )}

          {/* Returned items card */}
          <div className="wt-card">
            <div className="wt-card-title">Items to Collect from Customer</div>

            {loading ? (
              <div style={{ display: "flex", justifyContent: "center", padding: "16px 0" }}>
                <IonSpinner name="crescent" color="warning" />
              </div>
            ) : returnedItems.length === 0 ? (
              <p style={{ color: "#9ca3af", fontSize: 14, marginTop: 8, textAlign: "center", padding: "12px 0" }}>
                Customer kept all items — nothing to return.
              </p>
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
                  {returnedItems.map((item, idx) => (
                    <tr key={item.id ?? idx}>
                      <td>
                        <div style={{ fontWeight: 600 }}>{item.productName}</div>
                        <div style={{ fontSize: 11, color: "#6b7280" }}>{item.variantName}</div>
                      </td>
                      <td>{item.size}</td>
                      <td style={{ fontSize: 11, color: "#6b7280" }}>{item.barcode}</td>
                      <td>{item.quantity}</td>
                      <td>₹{item.price}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>

          {/* Store destination card */}
          <div className="wt-card">
            <div className="wt-card-title">Return To</div>
            <div style={{ display: "flex", alignItems: "flex-start", gap: 10 }}>
              <span style={{ fontSize: 22 }}>🏪</span>
              <div>
                <div className="wt-address-name">{order.storeName ?? "Store"}</div>
                <div className="wt-address-text">{order.storeAddress ?? "Return to store"}</div>
              </div>
            </div>
          </div>

          {/* Photo upload card */}
          <div className="wt-card">
            <div className="wt-card-title">Upload Photo of Returns</div>
            <div
              className="wt-upload-box"
              onClick={() => document.getElementById("returnPhotoInput")?.click()}
            >
              <IonIcon icon={cameraOutline} className="wt-upload-icon" />
              <p className="wt-upload-text">
                {photo ? "Photo added ✓" : "Tap to photograph returned items"}
              </p>
              <input
                id="returnPhotoInput"
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
        <div className="wt-bottom-location">
          <span className="wt-bottom-location-icon">🏪</span>
          <div>
            <p className="wt-bottom-location-name">{order.storeName ?? "Store"}</p>
            <p className="wt-bottom-location-addr">
              {order.storeAddress ?? "Return items to the store"}
            </p>
          </div>
        </div>
        <SlideToAction
          text="Returns Collected"
          color="#ea580c"
          onSlideComplete={() => history.push("/TrynbuyReturnToStore")}
        />
      </div>
    </IonPage>
  );
};

export default TrynbuyReturnCollectPage;
