import React, { useEffect, useRef, useState } from "react";
import {
  IonPage,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  useIonViewDidEnter,
  useIonViewWillEnter,
  IonMenuButton,
  IonButtons,
  IonIcon,
  IonButton,
} from "@ionic/react";
import { callOutline } from "ionicons/icons";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { useHistory } from "react-router-dom";
import SlideToAction from "../../components/SlideToAction";
import WalkthroughStep from "../../components/WalkthroughStep";
import OrderNumberPill from "./OrderNumberPill";
import ContactCallModal from "./ContactCallModal";
import OpenGoogleMapsButton from "./OpenGoogleMapsButton";
import MapLocateButton from "./MapLocateButton";
import {
  getActiveOrder,
  getSteps,
  getAccentColor,
  setCurrentPage,
  getPickupStores,
  getPickupStoreIndex,
} from "./walkthroughSteps";
import { postStepEvent } from "./stepEvents";
import { api } from "../../services/api";
import { getCurrentLocation } from "../../utils/geolocation";
import "./OrderWalkthrough.css";

const GoToPickupPage: React.FC = () => {
  const history = useHistory();
  const mapRef = useRef<L.Map | null>(null);
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const userMarkerRef = useRef<L.Marker | null>(null);

  const order = getActiveOrder();
  const trynbuyId: string | undefined = order.trynbuyId || order.trynbuy_id;
  const steps = getSteps(order.type);
  const accentColor = getAccentColor(order.type);

  const [pickupIdx, setPickupIdxState] = useState(getPickupStoreIndex);
  const pickupStores = getPickupStores();
  const currentStore = pickupStores[pickupIdx] ?? pickupStores[0] ?? {};
  // Step 1 for store 0, step 3 for store 1, etc.
  const currentStep = pickupIdx * 2 + 1;
  const storeLabel = pickupStores.length > 1
    ? `Store ${pickupIdx + 1} of ${pickupStores.length}`
    : undefined;
  const [currentLocation, setCurrentLocation] = useState<[number, number] | null>(null);
  const [swipeError, setSwipeError] = useState("");
  const [contactOpen, setContactOpen] = useState(false);
  const [storeContactName, setStoreContactName] = useState(currentStore.storeName ?? "Pickup Store");
  const [storeContactPhone, setStoreContactPhone] = useState("");
  const SWIPE_RADIUS_METERS = 75;

  const toRadians = (value: number) => (value * Math.PI) / 180;

  const getDistanceMeters = (from: [number, number], to: [number, number]) => {
    const [lat1, lng1] = from;
    const [lat2, lng2] = to;
    const earthRadius = 6371000;
    const dLat = toRadians(lat2 - lat1);
    const dLng = toRadians(lng2 - lng1);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(toRadians(lat1)) * Math.cos(toRadians(lat2)) *
      Math.sin(dLng / 2) * Math.sin(dLng / 2);
    return 2 * earthRadius * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  };

  const zoomToMyLocation = () => {
    if (!mapRef.current || !currentLocation) return;
    mapRef.current.setView(currentLocation, 17, { animate: true });
  };

  const createMarkerLabelIcon = (iconUrl: string, size: [number, number], label: string) =>
    L.divIcon({
      className: "wt-map-label-marker",
      html: `
        <div class="wt-map-label-marker-wrap">
          <img src="${iconUrl}" class="wt-map-label-marker-icon" alt="" />
          <span class="wt-map-label-marker-label">${label}</span>
        </div>
      `,
      iconSize: size,
      iconAnchor: [size[0] / 2, size[1]],
    });

  const syncUserMarker = (userLat: number, userLng: number) => {
    setCurrentLocation([userLat, userLng]);
    setSwipeError("");

    const userIcon = L.icon({
      iconUrl: "https://cdn-icons-png.flaticon.com/512/684/684908.png",
      iconSize: [32, 32],
      iconAnchor: [16, 32],
    });

    if (userMarkerRef.current) {
      userMarkerRef.current.setLatLng([userLat, userLng]);
      return;
    }

    userMarkerRef.current = L.marker([userLat, userLng], { icon: userIcon })
      .addTo(mapRef.current!)
      .bindTooltip("You are here", {
        permanent: true,
        direction: "top",
        offset: [0, -10],
        className: "wt-map-label-tooltip",
      });

    mapRef.current?.setView([userLat, userLng], 15, { animate: true });
  };

  useEffect(() => { setCurrentPage("/GoToPickup"); }, []);

  useEffect(() => {
    let alive = true;
    if (!trynbuyId) return;

    api.get<any>(`/orders/${trynbuyId}`)
      .then((data) => {
        if (!alive) return;
        const stores = Array.isArray(data?.delivery_From) ? data.delivery_From : [];
        const currentName = String(currentStore.storeName ?? "").trim().toLowerCase();
        const matchedStore = stores.find((store: any) => {
          const storeName = String(store?.name ?? "").trim().toLowerCase();
          return currentName && storeName && storeName === currentName;
        }) ?? stores[pickupIdx] ?? stores[0];

        setStoreContactName(matchedStore?.name ?? currentStore.storeName ?? "Pickup Store");
        setStoreContactPhone(String(matchedStore?.phone ?? ""));
      })
      .catch(() => {
        if (!alive) return;
        setStoreContactName(currentStore.storeName ?? "Pickup Store");
        setStoreContactPhone("");
      });

    return () => {
      alive = false;
    };
  }, [trynbuyId, pickupIdx, currentStore.storeName]);

  // Refresh index every time this page is entered — Ionic caches the component
  // so it won't remount when looping back for the next pickup store
  const [sliderReset, setSliderReset] = useState(0);
  useIonViewWillEnter(() => {
    const idx = getPickupStoreIndex();
    setPickupIdxState(idx);
    setSliderReset(r => r + 1);
    postStepEvent(trynbuyId, "GoToPickup", "enter", { storeIndex: idx }, pickupStores[idx]?.companyId);
  });

  useIonViewDidEnter(() => {
    if (mapRef.current) {
      setTimeout(() => {
        mapRef.current?.invalidateSize();
      }, 300);
    }
  });

  useEffect(() => {
    let alive = true;
    const initMap = async () => {
      if (!mapContainerRef.current) return;
      setCurrentLocation(null);
      setSwipeError("");

      const centerLat = currentStore.storeLat ?? 12.8610;
      const centerLng = currentStore.storeLng ?? 74.8499;

      mapRef.current = L.map(mapContainerRef.current, {
        center: [centerLat, centerLng],
        zoom: 13,
      });

      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        maxZoom: 19,
        attribution: "&copy; OpenStreetMap contributors",
      }).addTo(mapRef.current);

      // Pin the destination store if coordinates are available
      if (currentStore.storeLat && currentStore.storeLng) {
        const storeIcon = createMarkerLabelIcon(
          "https://cdn-icons-png.flaticon.com/512/869/869636.png",
          [36, 52],
          "Go here"
        );
        L.marker([currentStore.storeLat, currentStore.storeLng], { icon: storeIcon })
          .addTo(mapRef.current)
          .bindTooltip(currentStore.storeName ?? "Pickup Store", {
            permanent: true,
            direction: "top",
            offset: [0, -10],
            className: "wt-map-label-tooltip",
          });
      }

      setTimeout(() => {
        mapRef.current?.invalidateSize();
      }, 400);

      if (alive) setSwipeError("");
    };

    initMap();

    return () => {
      alive = false;
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
      userMarkerRef.current = null;
    };
  }, [pickupIdx]); // re-init map when switching to a different store

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonButtons slot="start">
            <IonMenuButton />
          </IonButtons>
          <IonTitle>
            {storeLabel ? `Pickup — ${storeLabel}` : "Go to Pickup Location"}
          </IonTitle>
          <IonButtons slot="end">
            <IonButton fill="clear" onClick={() => setContactOpen(true)} aria-label="Open store contact">
              <IonIcon icon={callOutline} size="large" />
            </IonButton>
          </IonButtons>
        </IonToolbar>
      </IonHeader>

      <OrderNumberPill />
      <ContactCallModal
        isOpen={contactOpen}
        name={storeContactName}
        phone={storeContactPhone}
        title="Pickup Store"
        onDismiss={() => setContactOpen(false)}
      />

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

        <MapLocateButton disabled={!currentLocation} onClick={zoomToMyLocation} />

        {/* Fixed bottom card */}
        <div className="wt-map-bottom">
          <WalkthroughStep current={currentStep} steps={steps} accentColor={accentColor} />

          <div className="wt-bottom-location" style={{ marginTop: 12 }}>
            <span className="wt-bottom-location-icon">📍</span>
            <div className="wt-bottom-location-main">
              <div className="wt-bottom-location-copy">
                <p className="wt-bottom-location-name">
                  {currentStore.storeName ?? "Pickup Store"}
                </p>
                <p className="wt-bottom-location-addr">
                  {currentStore.storeAddress ?? "Head to the pickup location"}
                </p>
                <p className="wt-bottom-location-addr" style={{ marginTop: 4 }}>
                  Swipe to verify your live location.
                </p>
              </div>
              <OpenGoogleMapsButton
                label="Go"
                address={currentStore.storeAddress}
                lat={currentStore.storeLat}
                lng={currentStore.storeLng}
              />
            </div>
          </div>

          {swipeError ? <div className="wt-swipe-error">{swipeError}</div> : null}

          <SlideToAction
            text="Arrived at Store"
            color={accentColor}
            resetTrigger={sliderReset}
          onSlideComplete={async () => {
            const storeLat = currentStore.storeLat;
            const storeLng = currentStore.storeLng;
            if (storeLat == null || storeLng == null) {
              setSwipeError("Store coordinates are missing. Please open maps or contact support.");
              setSliderReset((r) => r + 1);
              return;
            }

              try {
                setSwipeError("Checking your live location...");
                const position = await getCurrentLocation({
                  enableHighAccuracy: true,
                  maximumAge: 0,
                  timeout: 15000,
                });
                const liveLocation: [number, number] = [
                  position.coords.latitude,
                  position.coords.longitude,
                ];
                syncUserMarker(liveLocation[0], liveLocation[1]);

                const distance = getDistanceMeters(liveLocation, [storeLat, storeLng]);
              if (distance > SWIPE_RADIUS_METERS) {
                setSwipeError("Move within 75m of the store, then swipe again.");
                setSliderReset((r) => r + 1);
                return;
              }

              setSwipeError("");
              await postStepEvent(trynbuyId, "GoToPickup", "complete", { storeIndex: pickupIdx }, currentStore.companyId);
              history.push("/CollectOrder");
              } catch (error) {
                console.warn("Pickup swipe location check failed:", error);
                setSwipeError("Could not get your live location. Please turn on GPS and try again.");
                setSliderReset((r) => r + 1);
              }
            }}
          />
        </div>
      </IonContent>
    </IonPage>
  );
};

export default GoToPickupPage;
