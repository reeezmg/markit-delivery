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
import { getActiveOrder, getSteps, getAccentColor, setCurrentPage, getPickupStores } from "./walkthroughSteps";
import { postStepEvent } from "./stepEvents";
import { api } from "../../services/api";
import { getCurrentLocation } from "../../utils/geolocation";
import "./OrderWalkthrough.css";

const GoToDropPage: React.FC = () => {
  const history = useHistory();
  const mapRef = useRef<L.Map | null>(null);
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const [currentLocation, setCurrentLocation] = useState<[number, number] | null>(null);
  const [destinationLocation, setDestinationLocation] = useState<[number, number] | null>(null);
  const [swipeError, setSwipeError] = useState("");
  const [contactOpen, setContactOpen] = useState(false);
  const [customerContactName, setCustomerContactName] = useState("Customer");
  const [customerContactPhone, setCustomerContactPhone] = useState("");
  const userMarkerRef = useRef<L.Marker | null>(null);
  const destinationMarkerRef = useRef<L.Marker | null>(null);

  const order = getActiveOrder();
  const trynbuyId: string | undefined = order.trynbuyId || order.trynbuy_id;
  const steps = getSteps(order.type);
  const accentColor = getAccentColor(order.type);
  const nPickup = getPickupStores().length;
  // GoToDrop is the step immediately after all pickup/collect pairs
  const currentStep = nPickup * 2 + 1;
  const toRadians = (value: number) => (value * Math.PI) / 180;
  const getDistanceMeters = (from: [number, number], to: [number, number]) => {
    const [lat1, lng1] = from;
    const [lat2, lng2] = to;
    const earthRadius = 637100000;
    const dLat = toRadians(lat2 - lat1);
    const dLng = toRadians(lng2 - lng1);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(toRadians(lat1)) * Math.cos(toRadians(lat2)) *
      Math.sin(dLng / 2) * Math.sin(dLng / 2);
    return 2 * earthRadius * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  };

  const syncUserMarker = (userLat: number, userLng: number) => {
    setCurrentLocation([userLat, userLng]);
    setSwipeError("");

    const bikeIcon = L.icon({
      iconUrl: "https://cdn-icons-png.flaticon.com/512/889/889720.png",
      iconSize: [40, 40],
      iconAnchor: [20, 40],
    });

    if (userMarkerRef.current) {
      userMarkerRef.current.setLatLng([userLat, userLng]);
      return;
    }

    userMarkerRef.current = L.marker([userLat, userLng], { icon: bikeIcon })
      .addTo(mapRef.current!)
      .bindTooltip("You are here", {
        permanent: true,
        direction: "top",
        offset: [0, -10],
        className: "wt-map-label-tooltip",
      });

    mapRef.current?.setView([userLat, userLng], 15, { animate: true });
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

  const isValidLatLng = (coords: [number, number]) =>
    Number.isFinite(coords[0]) &&
    Number.isFinite(coords[1]) &&
    Math.abs(coords[0]) <= 90 &&
    Math.abs(coords[1]) <= 180;

  const resolveDestinationLocation = (source: [number, number] | null, target: [number, number] | null) => {
    if (!target) return null;
    if (!source) return isValidLatLng(target) ? target : null;

    const direct = target;
    const swapped: [number, number] = [target[1], target[0]];

    if (!isValidLatLng(direct) && isValidLatLng(swapped)) return swapped;
    if (isValidLatLng(direct) && isValidLatLng(swapped)) {
      const directDistance = getDistanceMeters(source, direct);
      const swappedDistance = getDistanceMeters(source, swapped);
      if (swappedDistance + 100000 < directDistance) {
        return swapped;
      }
    }
    return isValidLatLng(direct) ? direct : null;
  };

  const [sliderReset, setSliderReset] = useState(0);
  useEffect(() => { setCurrentPage("/GoToDrop"); }, []);

  useEffect(() => {
    let alive = true;
    if (!trynbuyId) return;

    api.get<any>(`/orders/${trynbuyId}`)
      .then((data) => {
        if (!alive) return;
        const deliveryTarget = data?.delivery_To ?? data?.delivery_to ?? null;
        const lat = Number(deliveryTarget?.lat);
        const lng = Number(deliveryTarget?.lng);
        if (Number.isFinite(lat) && Number.isFinite(lng)) {
          setDestinationLocation([lat, lng]);
        }
        const customer = data?.client_Details ?? data?.client_details ?? {};
        setCustomerContactName(customer?.name ?? "Customer");
        setCustomerContactPhone(String(customer?.phone ?? ""));
      })
      .catch(() => {
        if (!alive) return;
        setCustomerContactName("Customer");
        setCustomerContactPhone("");
      });

    return () => { alive = false; };
  }, [trynbuyId]);

  const resolvedDestinationLocation = resolveDestinationLocation(null, destinationLocation);

  const zoomToMyLocation = () => {
    if (!mapRef.current || !currentLocation) return;
    mapRef.current.setView(currentLocation, 17, { animate: true });
  };

  useEffect(() => {
    if (!mapRef.current || !resolvedDestinationLocation) return;

    const destinationIcon = createMarkerLabelIcon(
      "https://cdn-icons-png.flaticon.com/512/869/869636.png",
      [36, 52],
      "Go here"
    );

    if (destinationMarkerRef.current) {
      destinationMarkerRef.current.setLatLng(resolvedDestinationLocation);
      return;
    }

    destinationMarkerRef.current = L.marker(resolvedDestinationLocation, { icon: destinationIcon })
      .addTo(mapRef.current)
      .bindTooltip("Customer location", {
        permanent: true,
        direction: "top",
        offset: [0, -10],
        className: "wt-map-label-tooltip",
      });
  }, [resolvedDestinationLocation]);

  useIonViewWillEnter(() => {
    setSliderReset(r => r + 1);
    postStepEvent(trynbuyId, "GoToDrop", "enter");
  });

  useIonViewDidEnter(() => {
    if (mapRef.current) {
      setTimeout(() => mapRef.current?.invalidateSize(), 300);
    }
  });

  useEffect(() => {
    const initMap = async () => {
      if (!mapContainerRef.current) return;
      setCurrentLocation(null);
      setSwipeError("");

      mapRef.current = L.map(mapContainerRef.current, {
        center: [12.8610, 74.8499],
        zoom: 13,
      });

      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        maxZoom: 19,
        attribution: "&copy; OpenStreetMap contributors",
      }).addTo(mapRef.current);

      setTimeout(() => mapRef.current?.invalidateSize(), 400);

      setSwipeError("");
    };

    initMap();

    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
      destinationMarkerRef.current = null;
    };
  }, []);

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonButtons slot="start">
            <IonMenuButton />
          </IonButtons>
          <IonTitle>Go to Drop Location</IonTitle>
          <IonButtons slot="end">
            <IonButton fill="clear" onClick={() => setContactOpen(true)} aria-label="Open customer contact">
              <IonIcon icon={callOutline} size="large" />
            </IonButton>
          </IonButtons>
        </IonToolbar>
      </IonHeader>

      <OrderNumberPill />
      <ContactCallModal
        isOpen={contactOpen}
        name={customerContactName}
        phone={customerContactPhone}
        title="Customer"
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
                <p className="wt-bottom-location-name">Customer Location</p>
                <p className="wt-bottom-location-addr">
                  {order.deliveryAddress ?? "Drop location"}
                </p>
                <p className="wt-bottom-location-addr" style={{ marginTop: 4 }}>
                  Swipe to verify your live location.
                </p>
              </div>
              <OpenGoogleMapsButton
                label="Go"
                address={order.deliveryAddress}
                lat={resolvedDestinationLocation?.[0]}
                lng={resolvedDestinationLocation?.[1]}
              />
            </div>
          </div>

          {swipeError ? <div className="wt-swipe-error">{swipeError}</div> : null}

          <SlideToAction
            text="Arrived at Customer"
            color={accentColor}
            resetTrigger={sliderReset}
            onSlideComplete={async () => {
              if (!destinationLocation) {
                setSwipeError("Getting destination coordinates. Please try again in a moment.");
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

                const targetLocation = resolveDestinationLocation(liveLocation, destinationLocation);
                if (!targetLocation) {
                  setSwipeError("Customer coordinates are invalid. Please contact support.");
                  setSliderReset((r) => r + 1);
                  return;
                }

                setSwipeError("");
                postStepEvent(trynbuyId, "GoToDrop", "complete");
                history.push("/Delivered");
              } catch (error) {
                console.warn("Drop swipe location check failed:", error);
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

export default GoToDropPage;
