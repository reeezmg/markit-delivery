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

const CollectOrderPage: React.FC = () => {
  const [elapsed, setElapsed] = useState(0); // total seconds elapsed
  const [photo, setPhoto] = useState<string | null>(null);
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [loadingItems, setLoadingItems] = useState(true);
  const router = useHistory();

  const order = getActiveOrder();
  const steps = getSteps(order.type);
  const accentColor = getAccentColor(order.type);
  const trynbuyId: string | undefined = order.trynbuyId || order.trynbuy_id;

  useEffect(() => {
    if (!trynbuyId) { setLoadingItems(false); return; }
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
      .finally(() => setLoadingItems(false));
  }, [trynbuyId]);

  useEffect(() => { setCurrentPage("/CollectOrder"); }, []);

  // Reset stopwatch on every page enter (Ionic caches pages)
  useIonViewWillEnter(() => {
    setElapsed(0);
  });

  const displayMinutes = Math.floor(elapsed / 60);
  const displaySeconds = elapsed % 60;
  const earning = displayMinutes; // ₹1 per completed minute

  // Stopwatch — counts up
  useEffect(() => {
    const timer = setInterval(() => {
      setElapsed((e) => e + 1);
    }, 1000);
    return () => clearInterval(timer);
  }, []);

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

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonButtons slot="start">
            <IonMenuButton />
          </IonButtons>
          <IonTitle>Collect Order</IonTitle>
        </IonToolbar>
      </IonHeader>

      <IonContent fullscreen className="wt-page-bg">
        <div className="wt-content">

          {/* Step indicator */}
          <WalkthroughStep current={2} steps={steps} accentColor={accentColor} />

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
              Earning ₹1 per min while waiting (up to 20 mins)
            </div>
            <div className="wt-timer-earning">
              <div>
                <div style={{ fontWeight: 600, fontSize: 13, color: "#16a34a" }}>Waiting Fee</div>
                <div style={{ fontSize: 11, color: "#16a34a" }}>₹1 per min</div>
              </div>
              <div className="wt-timer-earning-amount">₹{earning}</div>
            </div>
          </div>

          {/* Items card */}
          <div className="wt-card">
            <div className="wt-card-title">Items to Collect</div>
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
        <div className="wt-bottom-location">
          <span className="wt-bottom-location-icon">🏪</span>
          <div>
            <p className="wt-bottom-location-name">
              {order.storeName ?? "Pickup Store"}
            </p>
            <p className="wt-bottom-location-addr">
              {order.storeAddress ?? "Collect items from the store"}
            </p>
          </div>
        </div>
        <SlideToAction
          text="Collected"
          color={accentColor}
          onSlideComplete={() => router.push("/GoToDrop", "forward")}
        />
      </div>
    </IonPage>
  );
};

export default CollectOrderPage;
