import React, { useEffect, useRef } from "react";
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
} from "@ionic/react";
import { callOutline } from "ionicons/icons";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { useHistory } from "react-router-dom";
import SlideToAction from "../../components/SlideToAction";
import WalkthroughStep from "../../components/WalkthroughStep";
import { getActiveOrder, TRYNBUY_STEPS, setCurrentPage } from "./walkthroughSteps";
import "./OrderWalkthrough.css";

const TrynbuyReturnToStorePage: React.FC = () => {
  const history = useHistory();
  const mapRef = useRef<L.Map | null>(null);
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const userMarkerRef = useRef<L.Marker | null>(null);
  const order = getActiveOrder();

  useEffect(() => { setCurrentPage("/TrynbuyReturnToStore"); }, []);

  useIonViewDidEnter(() => {
    if (mapRef.current) {
      setTimeout(() => mapRef.current?.invalidateSize(), 300);
    }
  });

  useEffect(() => {
    if (!mapContainerRef.current) return;

    mapRef.current = L.map(mapContainerRef.current, {
      center: [12.861, 74.8499],
      zoom: 13,
    });

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      maxZoom: 19,
      attribution: "&copy; OpenStreetMap contributors",
    }).addTo(mapRef.current);

    setTimeout(() => mapRef.current?.invalidateSize(), 400);

    const storeLat = order.storeLat;
    const storeLng = order.storeLng;
    if (storeLat && storeLng && mapRef.current) {
      const storeIcon = L.icon({
        iconUrl: "https://cdn-icons-png.flaticon.com/512/869/869636.png",
        iconSize: [36, 36],
        iconAnchor: [18, 36],
      });
      L.marker([storeLat, storeLng], { icon: storeIcon })
        .addTo(mapRef.current)
        .bindPopup(order.storeName ?? "Store")
        .openPopup();
      mapRef.current.setView([storeLat, storeLng], 14);
    }

    if (navigator.geolocation) {
      navigator.geolocation.watchPosition(
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
        (err) => console.error("Location error:", err),
        { enableHighAccuracy: true }
      );
    }

    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, []);

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonButtons slot="start">
            <IonMenuButton />
          </IonButtons>
          <IonTitle>Return to Store</IonTitle>
          <IonButtons slot="end">
            <IonIcon icon={callOutline} size="large" style={{ marginRight: "12px" }} />
          </IonButtons>
        </IonToolbar>
      </IonHeader>

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
          <WalkthroughStep current={7} steps={TRYNBUY_STEPS} accentColor="#ea580c" />

          <div className="wt-bottom-location" style={{ marginTop: 12 }}>
            <span className="wt-bottom-location-icon">🏪</span>
            <div>
              <p className="wt-bottom-location-name">{order.storeName ?? "Store"}</p>
              <p className="wt-bottom-location-addr">
                {order.storeAddress ?? "Return items to the store"}
              </p>
            </div>
          </div>

          <SlideToAction
            text="Arrived at Store"
            color="#ea580c"
            onSlideComplete={() => history.push("/TrynbuyReturned")}
          />
        </div>
      </IonContent>
    </IonPage>
  );
};

export default TrynbuyReturnToStorePage;
