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
import {
  getActiveOrder,
  getSteps,
  setCurrentPage,
  getPickupStores,
  getReturnStores,
  getReturnStoreIndex,
  setReturnStoreIndex,
  getCurrentReturnStore,
} from "./walkthroughSteps";
import { postStepEvent } from "./stepEvents";
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
  storeId?: string;
}

const TrynbuyReturnedPage: React.FC = () => {
  const history = useHistory();
  const order = getActiveOrder();
  const trynbuyId: string | undefined = order.trynbuyId || order.trynbuy_id;

  const [returnIdx, setReturnIdxState] = useState(getReturnStoreIndex);
  const returnStores = getReturnStores();
  const currentStore = returnStores[returnIdx] ?? returnStores[0] ?? {};
  const steps = getSteps("Try & Buy");
  const nPickup = getPickupStores().length;
  // Submit step: one after ReturnToStore for this return store
  const currentStep = nPickup * 2 + 7 + returnIdx * 2;
  const storeLabel = returnStores.length > 1
    ? `Store ${returnIdx + 1} of ${returnStores.length}`
    : undefined;

  const [sliderReset, setSliderReset] = useState(0);
  // Refresh index + returned items on every page entry — Ionic caches this component
  useIonViewWillEnter(() => {
    setReturnIdxState(getReturnStoreIndex());
    setSliderReset(r => r + 1);
    postStepEvent(trynbuyId, "TrynbuyReturned", "enter", { storeIndex: getReturnStoreIndex() }, returnStores[getReturnStoreIndex()]?.companyId);

    // Re-read returned items from persisted order state
    const freshOrder = getActiveOrder();
    const items = (freshOrder.returnedItems ?? []).map((i: any) => ({
      id: i.id ?? i.variant?.id,
      productName: i.productName ?? i.product?.name ?? i.name ?? "—",
      variantName: i.variantName ?? i.variant?.name ?? i.name ?? "—",
      size: i.size ?? i.item?.size ?? "—",
      barcode: i.barcode ?? i.item?.barcode ?? "—",
      quantity: i.quantity,
      price: i.price ?? i.dprice ?? i.sprice ?? i.variant?.dprice ?? i.variant?.sprice ?? 0,
      storeId: i.storeId ?? i.variant?.companyId ?? i.product?.companyId,
    }));
    if (items.length > 0) setAllReturnedItems(items);

    // Also re-fetch from API
    const tid = freshOrder.trynbuyId || freshOrder.trynbuy_id;
    if (tid) {
      setLoading(true);
      api.get<any>(`/orders/${tid}`)
        .then((data) => {
          if (Array.isArray(data.returned_items) && data.returned_items.length > 0) {
            setAllReturnedItems(
              data.returned_items.map((i: any) => ({
                id: i.variant?.id ?? i.id,
                productName: i.product?.name ?? "—",
                variantName: i.variant?.name ?? "—",
                size: i.item?.size ?? "—",
                barcode: i.item?.barcode ?? "—",
                quantity: i.quantity,
                price: i.variant?.dprice ?? i.variant?.sprice ?? 0,
                storeId: i.storeId ?? i.variant?.companyId ?? i.product?.companyId,
              }))
            );
          }
        })
        .catch((err) => console.error("Failed to refresh returned items:", err))
        .finally(() => setLoading(false));
    }
  });

  const [allReturnedItems, setAllReturnedItems] = useState<ReturnedItem[]>(() =>
    (order.returnedItems ?? []).map((i: any) => ({
      id: i.id ?? i.variant?.id,
      productName: i.productName ?? i.product?.name ?? i.name ?? "—",
      variantName: i.variantName ?? i.variant?.name ?? i.name ?? "—",
      size: i.size ?? i.item?.size ?? "—",
      barcode: i.barcode ?? i.item?.barcode ?? "—",
      quantity: i.quantity,
      price: i.price ?? i.dprice ?? i.sprice ?? i.variant?.dprice ?? i.variant?.sprice ?? 0,
      storeId: i.storeId ?? i.variant?.companyId ?? i.product?.companyId,
    }))
  );
  const [loading, setLoading] = useState(!!trynbuyId);
  const [photo, setPhoto] = useState<string | null>(null);

  useEffect(() => { setCurrentPage("/TrynbuyReturned"); }, []);

  useEffect(() => {
    if (!trynbuyId) return;
    api.get<any>(`/orders/${trynbuyId}`)
      .then((data) => {
        if (Array.isArray(data.returned_items) && data.returned_items.length > 0) {
          setAllReturnedItems(
            data.returned_items.map((i: any) => ({
              id: i.variant?.id ?? i.id,
              productName: i.product?.name ?? "—",
              variantName: i.variant?.name ?? "—",
              size: i.item?.size ?? "—",
              barcode: i.item?.barcode ?? "—",
              quantity: i.quantity,
              price: i.variant?.dprice ?? i.variant?.sprice ?? 0,
              storeId: i.storeId ?? i.variant?.companyId ?? i.product?.companyId,
            }))
          );
        }
      })
      .catch((err) => console.error("Failed to fetch order details:", err))
      .finally(() => setLoading(false));
  }, [trynbuyId]);

  // Show only items belonging to the current return store (fall back to all items for single-store)
  const returnedItems = currentStore.storeId
    ? allReturnedItems.filter((i) => i.storeId === currentStore.storeId)
    : allReturnedItems;

  const handleComplete = () => {
    postStepEvent(trynbuyId, "TrynbuyReturned", "complete", { storeIndex: returnIdx }, currentStore.companyId);
    const nextIdx = returnIdx + 1;
    if (nextIdx < returnStores.length) {
      // More return stores remaining — advance and go back to ReturnToStore
      setReturnStoreIndex(nextIdx);
      history.push("/TrynbuyReturnToStore");
    } else {
      // All stores done
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
          <IonTitle>
            {storeLabel ? `Submit Returns — ${storeLabel}` : "Submit Returns"}
          </IonTitle>
        </IonToolbar>
      </IonHeader>

      <OrderNumberPill />

      <IonContent fullscreen className="wt-page-bg">
        <div className="wt-content">

          {/* Step indicator */}
          <WalkthroughStep current={currentStep} steps={steps} accentColor="#ea580c" />

          {/* TnB badge */}
          <div className="wt-tnb-badge">
            {storeLabel ? `TRY & BUY — ${storeLabel.toUpperCase()}` : "TRY & BUY — FINAL STEP"}
          </div>

          {/* Store destination card */}
          <div className="wt-card">
            <div className="wt-card-title">Returning To</div>
            <div style={{ display: "flex", alignItems: "flex-start", gap: 10 }}>
              <span style={{ fontSize: 22 }}>🏪</span>
              <div>
                <div className="wt-address-name">{currentStore.storeName ?? "Store"}</div>
                <div className="wt-address-text">{currentStore.storeAddress ?? "Store location"}</div>
              </div>
            </div>
          </div>

          {/* Returned items card */}
          <div className="wt-card">
            <div className="wt-card-title">
              Items Being Returned
              {storeLabel && (
                <span style={{ fontWeight: 400, fontSize: 12, color: "#6b7280", marginLeft: 6 }}>
                  ({storeLabel})
                </span>
              )}
            </div>
            {loading ? (
              <div style={{ display: "flex", justifyContent: "center", padding: "16px 0" }}>
                <IonSpinner name="crescent" color="warning" />
              </div>
            ) : returnedItems.length === 0 ? (
              <p style={{ color: "#9ca3af", fontSize: 14, marginTop: 8, textAlign: "center", padding: "12px 0" }}>
                No items to return to this store.
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
                      <td>&#8377;{item.price}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>

          {/* Photo upload card */}
          <div className="wt-card">
            <div className="wt-card-title">Proof of Return to Store</div>
            <div
              className="wt-upload-box"
              onClick={() => document.getElementById("returnedPhotoInput")?.click()}
            >
              <IonIcon icon={cameraOutline} className="wt-upload-icon" />
              <p className="wt-upload-text">
                {photo ? "Photo added ✓" : "Tap to photograph items at store counter"}
              </p>
              <input
                id="returnedPhotoInput"
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
            <p className="wt-bottom-location-name">{currentStore.storeName ?? "Store"}</p>
            <p className="wt-bottom-location-addr">
              Hand over the returned items to the store staff
            </p>
          </div>
        </div>
        <SlideToAction
          text={returnIdx + 1 < returnStores.length ? "Submitted — Next Store →" : "Returns Submitted"}
          color="#16a34a"
          resetTrigger={sliderReset}
          onSlideComplete={handleComplete}
        />
      </div>
    </IonPage>
  );
};

export default TrynbuyReturnedPage;
