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
import { cameraOutline } from "ionicons/icons";
import { useHistory } from "react-router-dom";
import SlideToAction from "../../components/SlideToAction";
import WalkthroughStep from "../../components/WalkthroughStep";
import { getActiveOrder, getSteps, getAccentColor, setCurrentPage } from "./walkthroughSteps";
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
}

const DeliveredPage: React.FC = () => {
  const [photo, setPhoto] = useState<string | null>(null);
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);
  const history = useHistory();

  const order = getActiveOrder();
  const steps = getSteps(order.type);
  const accentColor = getAccentColor(order.type);
  const trynbuyId: string | undefined = order.trynbuyId || order.trynbuy_id;

  useEffect(() => { setCurrentPage("/Delivered"); }, []);

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

      <IonContent fullscreen className="wt-page-bg">
        <div className="wt-content">

          {/* Step indicator */}
          <WalkthroughStep current={4} steps={steps} accentColor={accentColor} />

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
                      <td>₹{item.price}</td>
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
          onSlideComplete={() => {
            try {
              const activeOrder = JSON.parse(sessionStorage.getItem("activeOrder") || "{}");
              if (activeOrder.type === "Try & Buy") {
                history.push("/TrynbuyWaiting");
              } else {
                history.push("/DeliverySuccessPage");
              }
            } catch {
              history.push("/DeliverySuccessPage");
            }
          }}
        />
      </div>
    </IonPage>
  );
};

export default DeliveredPage;
