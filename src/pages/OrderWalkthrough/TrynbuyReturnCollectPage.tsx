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
import { getActiveOrder, getSteps, setCurrentPage, getPickupStores, getReturnStores, setReturnStoreIndex } from "./walkthroughSteps";
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
  companyId?: string;
  companyName?: string;
}

const TrynbuyReturnCollectPage: React.FC = () => {
  const history = useHistory();
  const order = getActiveOrder();
  const trynbuyId: string | undefined = order.trynbuyId || order.trynbuy_id;
  const steps = getSteps("Try & Buy");
  const nPickup = getPickupStores().length;
  const currentStep = nPickup * 2 + 4; // Get Returns step
  const returnStores = getReturnStores();
  const firstReturnStore = returnStores[0];
  const returnDestinationName = returnStores.length > 1
    ? `${firstReturnStore.storeName ?? "Store 1"} + ${returnStores.length - 1} more`
    : (firstReturnStore.storeName ?? order.storeName ?? "Store");
  const returnDestinationAddr = returnStores.length > 1
    ? `Returning to ${returnStores.length} stores`
    : (firstReturnStore.storeAddress ?? order.storeAddress ?? "Return to store");

  // Seed from persisted order state (set by socket event), then overwrite with API data
  const mapReturnedItem = (i: any): ReturnedItem => ({
    id: i.id ?? i.variant?.id,
    productName: i.productName ?? i.product?.name ?? i.name ?? "—",
    variantName: i.variantName ?? i.variant?.name ?? "—",
    size: i.size ?? i.item?.size ?? "—",
    barcode: i.barcode ?? i.item?.barcode ?? "—",
    quantity: i.quantity,
    price: i.price ?? i.variant?.dprice ?? i.variant?.sprice ?? 0,
    companyId: i.companyId ?? i.product?.companyId,
    companyName: i.companyName ?? i.product?.companyName,
  });

  const [returnedItems, setReturnedItems] = useState<ReturnedItem[]>(() =>
    (order.returnedItems ?? []).map(mapReturnedItem)
  );
  const [loading, setLoading] = useState(!!trynbuyId);
  const [photo, setPhoto] = useState<string | null>(null);

  useEffect(() => {
    setCurrentPage("/TrynbuyReturnCollect");
    // Reset so the return-store loop always starts at store 0
    setReturnStoreIndex(0);
  }, []);

  const [sliderReset, setSliderReset] = useState(0);
  // Re-read returned items on every page entry (Ionic caches this component)
  useIonViewWillEnter(() => {
    setSliderReset(r => r + 1);
    postStepEvent(trynbuyId, "TrynbuyReturnCollect", "enter");
    const freshOrder = getActiveOrder();
    const items = (freshOrder.returnedItems ?? []).map(mapReturnedItem);
    if (items.length > 0) setReturnedItems(items);

    // Also re-fetch from API for rich data
    const tid = freshOrder.trynbuyId || freshOrder.trynbuy_id;
    if (tid) {
      setLoading(true);
      api.get<any>(`/orders/${tid}`)
        .then((data) => {
          if (Array.isArray(data.returned_items) && data.returned_items.length > 0) {
            setReturnedItems(data.returned_items.map(mapReturnedItem));
          }
        })
        .catch((err) => console.error("Failed to refresh returned items:", err))
        .finally(() => setLoading(false));
    }
  });

  // Always fetch from API for rich data (barcode, price) + refresh resilience
  useEffect(() => {
    if (!trynbuyId) return;

    api.get<any>(`/orders/${trynbuyId}`)
      .then((data) => {
        if (Array.isArray(data.returned_items) && data.returned_items.length > 0) {
          setReturnedItems(data.returned_items.map(mapReturnedItem));
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

      <OrderNumberPill />

      <IonContent fullscreen className="wt-page-bg">
        <div className="wt-content">

          {/* Step indicator */}
          <WalkthroughStep current={currentStep} steps={steps} accentColor="#ea580c" />

          {/* TnB badge */}
          <div className="wt-tnb-badge">TRY &amp; BUY — COLLECT RETURNS</div>

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
            ) : (() => {
              // Group by store if companyId available
              const storeNameById = new Map(
                returnStores
                  .filter((s) => s.storeId)
                  .map((s) => [s.storeId as string, s.storeName ?? "Store"])
              );
              const groups: Record<string, { storeName: string; items: ReturnedItem[] }> = {};
              for (const item of returnedItems) {
                const key = item.companyId ?? "_all";
                if (!groups[key]) {
                  const storeName = item.companyName ?? (item.companyId ? storeNameById.get(item.companyId) : undefined);
                  groups[key] = { storeName: storeName ?? "Store", items: [] };
                }
                groups[key].items.push(item);
              }
              const orderedKeys = returnStores
                .map((s) => s.storeId)
                .filter((id): id is string => !!id && !!groups[id]);
              const extraKeys = Object.keys(groups).filter((key) => !orderedKeys.includes(key));
              const groupEntries = [...orderedKeys, ...extraKeys].map((key) => [key, groups[key]] as const);
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
                      {group.items.map((item, idx) => (
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
                </div>
              ));
            })()}
          </div>

          {/* Store destination card */}
          <div className="wt-card">
            <div className="wt-card-title">Return To</div>
            <div style={{ display: "flex", alignItems: "flex-start", gap: 10 }}>
              <span style={{ fontSize: 22 }}>🏪</span>
              <div>
                <div className="wt-address-name">{returnDestinationName}</div>
                <div className="wt-address-text">{returnDestinationAddr}</div>
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

        <SlideToAction
          text="Proceed to Payment"
          color="#ea580c"
          resetTrigger={sliderReset}
          onSlideComplete={() => {
            postStepEvent(trynbuyId, "TrynbuyReturnCollect", "complete");
            history.push("/TrynbuyPayment");
          }}
        />
      </div>
    </IonPage>
  );
};

export default TrynbuyReturnCollectPage;

