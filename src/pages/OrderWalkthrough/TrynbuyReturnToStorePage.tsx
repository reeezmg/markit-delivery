import React, { useEffect, useRef, useState } from "react";
import {
  IonPage,
  IonHeader,
  IonToolbar,
  IonButtons,
  IonMenuButton,
  IonTitle,
  IonIcon,
  IonContent,
  useIonViewDidEnter,
  useIonViewWillEnter,
} from "@ionic/react";
import { callOutline } from "ionicons/icons";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { useHistory } from "react-router-dom";
import SlideToAction from "../../components/SlideToAction";
import WalkthroughStep from "../../components/WalkthroughStep";
import OrderNumberPill from "./OrderNumberPill";
import {
  getSteps,
  getActiveOrder,
  setCurrentPage,
  getPickupStores,
  getReturnStores,
  getReturnStoreIndex,
  getCurrentReturnStore,
} from "./walkthroughSteps";
import { postStepEvent } from "./stepEvents";
import { watchLocation } from "../../utils/geolocation";
import "./OrderWalkthrough.css";

const TrynbuyReturnToStorePage: React.FC = () => {
  const history = useHistory();
  const mapRef = useRef<L.Map | null>(null);
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const userMarkerRef = useRef<L.Marker | null>(null);
  const watchCleanupRef = useRef<null | (() => Promise<void> | void)>(null);

  const order = getActiveOrder();
  const trynbuyId: string | undefined = order.trynbuyId || order.trynbuy_id;
  const [returnIdx, setReturnIdxState] = useState(getReturnStoreIndex);
  const returnStores = getReturnStores();
  const currentStore = returnStores[returnIdx] ?? returnStores[0] ?? {};
  const steps = getSteps("Try & Buy");
  const nPickup = getPickupStores().length;
  // ReturnToStore step: after 2N pickup steps + 5 common steps, then 2 per return store
  const currentStep = nPickup * 2 + 6 + returnIdx * 2;
  const storeLabel = returnStores.length > 1
    ? `Store ${returnIdx + 1} of ${returnStores.length}`
    : undefined;

  useEffect(() => { setCurrentPage("/TrynbuyReturnToStore"); }, []);

  // Refresh index every time this page is entered — Ionic caches the component
  // so it won't remount when looping back for the next return store
  const [sliderReset, setSliderReset] = useState(0);
  useIonViewWillEnter(() => {
    const idx = getReturnStoreIndex();
    setReturnIdxState(idx);
    setSliderReset(r => r + 1);
    postStepEvent(trynbuyId, "TrynbuyReturnToStore", "enter", { storeIndex: idx }, returnStores[idx]?.companyId);
  });

  useIonViewDidEnter(() => {
    if (mapRef.current) {
      setTimeout(() => mapRef.current?.invalidateSize(), 300);
    }
  });

  useEffect(() => {
    if (!mapContainerRef.current) return;

    const storeLat = currentStore.storeLat;
    const storeLng = currentStore.storeLng;

    mapRef.current = L.map(mapContainerRef.current, {
      center: [storeLat ?? 12.861, storeLng ?? 74.8499],
      zoom: 13,
    });

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      maxZoom: 19,
      attribution: "&copy; OpenStreetMap contributors",
    }).addTo(mapRef.current);

    setTimeout(() => mapRef.current?.invalidateSize(), 400);

    if (storeLat && storeLng && mapRef.current) {
      const storeIcon = L.icon({
        iconUrl: "https://cdn-icons-png.flaticon.com/512/869/869636.png",
        iconSize: [36, 36],
        iconAnchor: [18, 36],
      });
      L.marker([storeLat, storeLng], { icon: storeIcon })
        .addTo(mapRef.current)
        .bindPopup(currentStore.storeName ?? "Store")
        .openPopup();
      mapRef.current.setView([storeLat, storeLng], 14);
    }

    void (async () => {
      try {
        const cleanup = await watchLocation(
          { enableHighAccuracy: true, maximumAge: 10000, timeout: 10000 },
          (pos) => {
            const lat = pos.coords.latitude;
            const lng = pos.coords.longitude;

            const bikeIcon = L.icon({
              iconUrl: "https://cdn-icons-png.flaticon.com/512/889/889720.png",
              iconSize: [40, 40],
              iconAnchor: [20, 40],
            });

            if (userMarkerRef.current) {
              userMarkerRef.current.setLatLng([lat, lng]);
            } else {
              userMarkerRef.current = L.marker([lat, lng], { icon: bikeIcon })
                .addTo(mapRef.current!)
                .bindPopup("You are here")
                .openPopup();
            }
          },
          (err) => console.error("Location error:", err)
        );
        watchCleanupRef.current = cleanup;
      } catch (err) {
        console.error("Location watch failed:", err);
      }
    })();

    return () => {
      void watchCleanupRef.current?.();
      watchCleanupRef.current = null;
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, [returnIdx]); // re-init map when switching to next return store

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonButtons slot="start">
            <IonMenuButton />
          </IonButtons>
          <IonTitle>
            {storeLabel ? `Return to Store — ${storeLabel}` : "Return to Store"}
          </IonTitle>
          <IonButtons slot="end">
            <IonIcon icon={callOutline} size="large" style={{ marginRight: "12px" }} />
          </IonButtons>
        </IonToolbar>
      </IonHeader>

      <OrderNumberPill />

      <IonContent fullscreen scrollY={false}>
        {/* Map container */}
        <div
          ref={mapContainerRef}
          id="map"
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            zIndex: 0,
          }}
        />

        {/* Fixed bottom card */}
        <div className="wt-map-bottom">
          <WalkthroughStep current={currentStep} steps={steps} accentColor="#ea580c" />

          <div className="wt-bottom-location" style={{ marginTop: 12 }}>
            <span className="wt-bottom-location-icon">🏪</span>
            <div>
              <p className="wt-bottom-location-name">
                {currentStore.storeName ?? "Store"}
                {storeLabel && (
                  <span style={{ fontWeight: 400, fontSize: 12, color: "#6b7280", marginLeft: 6 }}>
                    ({storeLabel})
                  </span>
                )}
              </p>
              <p className="wt-bottom-location-addr">
                {currentStore.storeAddress ?? "Return items to the store"}
              </p>
            </div>
          </div>

          <SlideToAction
            text="Arrived at Store"
            color="#ea580c"
            resetTrigger={sliderReset}
            onSlideComplete={() => {
              postStepEvent(trynbuyId, "TrynbuyReturnToStore", "complete", { storeIndex: returnIdx }, currentStore.companyId);
              history.push("/TrynbuyReturned");
            }}
          />
        </div>
      </IonContent>
    </IonPage>
  );
};

export default TrynbuyReturnToStorePage;
