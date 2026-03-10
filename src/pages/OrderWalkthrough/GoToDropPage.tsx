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
} from "@ionic/react";
import { callOutline } from "ionicons/icons";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import axios from "axios";
import polyline from "polyline";
import { useHistory } from "react-router-dom";
import SlideToAction from "../../components/SlideToAction";
import WalkthroughStep from "../../components/WalkthroughStep";
import { getActiveOrder, getSteps, getAccentColor, setCurrentPage } from "./walkthroughSteps";
import "./OrderWalkthrough.css";

const GoToDropPage: React.FC = () => {
  const history = useHistory();
  const mapRef = useRef<L.Map | null>(null);
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const [currentLocation, setCurrentLocation] = useState<[number, number] | null>(null);
  const userMarkerRef = useRef<L.Marker | null>(null);

  const order = getActiveOrder();
  const steps = getSteps(order.type);
  const accentColor = getAccentColor(order.type);

  useEffect(() => { setCurrentPage("/GoToDrop"); }, []);

  useIonViewDidEnter(() => {
    if (mapRef.current) {
      setTimeout(() => mapRef.current?.invalidateSize(), 300);
    }
  });

  useEffect(() => {
    const initMap = async () => {
      if (!mapContainerRef.current) return;

      mapRef.current = L.map(mapContainerRef.current, {
        center: [12.8610, 74.8499],
        zoom: 13,
      });

      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        maxZoom: 19,
        attribution: "&copy; OpenStreetMap contributors",
      }).addTo(mapRef.current);

      setTimeout(() => mapRef.current?.invalidateSize(), 400);

      if (navigator.geolocation) {
        navigator.geolocation.watchPosition(
          async (pos) => {
            const userLat = pos.coords.latitude;
            const userLng = pos.coords.longitude;
            setCurrentLocation([userLat, userLng]);

            const bikeIcon = L.icon({
              iconUrl: "https://cdn-icons-png.flaticon.com/512/889/889720.png",
              iconSize: [40, 40],
              iconAnchor: [20, 40],
            });

            if (userMarkerRef.current) {
              userMarkerRef.current.setLatLng([userLat, userLng]);
            } else {
              userMarkerRef.current = L.marker([userLat, userLng], { icon: bikeIcon })
                .addTo(mapRef.current!)
                .bindPopup("You are here")
                .openPopup();
            }

            if (!mapRef.current?.hasLayer) return;
            try {
              const res = await axios.post("http://localhost:3005/api/deliveryMap", {
                start: [userLat, userLng],
              });

              const { polyline: encoded, waypoints } = res.data;

              if (encoded) {
                const decoded = polyline.decode(encoded);

                const routeLine = L.polyline(decoded, {
                  color: "blue",
                  weight: 4,
                }).addTo(mapRef.current!);

                if (Array.isArray(waypoints)) {
                  waypoints.forEach((wp: any, i: number) => {
                    if (wp.location && wp.location.length === 2) {
                      L.marker([wp.location[1], wp.location[0]])
                        .addTo(mapRef.current!)
                        .bindPopup(`Stop ${i + 1}`);
                    }
                  });
                }

                mapRef.current!.fitBounds(routeLine.getBounds());
              }
            } catch (err) {
              console.error("Error loading route:", err);
            }
          },
          (err) => {
            console.error("Location error:", err);
            alert("Unable to get your current location. Please enable GPS.");
          },
          { enableHighAccuracy: true }
        );
      }
    };

    initMap();

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
          <IonTitle>Go to Drop Location</IonTitle>
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
          <WalkthroughStep current={3} steps={steps} accentColor={accentColor} />

          <div className="wt-bottom-location" style={{ marginTop: 12 }}>
            <span className="wt-bottom-location-icon">📍</span>
            <div>
              <p className="wt-bottom-location-name">Customer Location</p>
              <p className="wt-bottom-location-addr">
                {order.deliveryAddress ?? "Drop location"}
              </p>
            </div>
          </div>

          <SlideToAction
            text="Arrived at Customer"
            color={accentColor}
            onSlideComplete={() => history.push("/Delivered")}
          />
        </div>
      </IonContent>
    </IonPage>
  );
};

export default GoToDropPage;
