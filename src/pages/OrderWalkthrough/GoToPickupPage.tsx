import React, { useEffect, useRef, useState } from "react";
import {
    IonPage,
    IonHeader,
    IonToolbar,
    IonTitle,
    IonContent,
    useIonViewDidEnter,
    IonMenuButton,
    IonButtons,
    IonIcon,
} from "@ionic/react";
import {
    callOutline
} from "ionicons/icons";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import axios from "axios";
import polyline from "polyline";
import { useHistory } from "react-router-dom";
import SlideToAction from "../../components/SlideToAction";

const GoToPickupPage: React.FC = () => {
    const history = useHistory();
    const mapRef = useRef<L.Map | null>(null);
    const mapContainerRef = useRef<HTMLDivElement>(null);
    const [currentLocation, setCurrentLocation] = useState<[number, number] | null>(null);

    // ✅ Recalculate map layout every time the page becomes active
    useIonViewDidEnter(() => {
        if (mapRef.current) {
            setTimeout(() => {
                mapRef.current?.invalidateSize();
            }, 300);
        }
    });

    useEffect(() => {
        const initMap = async () => {
            if (!mapContainerRef.current) return;

            // 🗺️ Create the Leaflet map
            mapRef.current = L.map(mapContainerRef.current, {
                center: [12.8610, 74.8499], // Default center until we get user location
                zoom: 13,
            });

            // 🧱 Add OpenStreetMap tiles
            L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
                maxZoom: 19,
                attribution: "&copy; OpenStreetMap contributors",
            }).addTo(mapRef.current);

            // 🕒 Fix map size after render
            setTimeout(() => {
                mapRef.current?.invalidateSize();
            }, 400);

            try {
                // 📍 1️⃣ Get the user's current location
                navigator.geolocation.getCurrentPosition(
                    async (pos) => {
                        const userLat = pos.coords.latitude;
                        const userLng = pos.coords.longitude;
                        setCurrentLocation([userLat, userLng]);

                        // Add a marker for the user's current location
                        L.marker([userLat, userLng], {
                            icon: L.icon({
                                iconUrl: "https://cdn-icons-png.flaticon.com/512/684/684908.png",
                                iconSize: [32, 32],
                                iconAnchor: [16, 32],
                            }),
                        })
                            .addTo(mapRef.current!)
                            .bindPopup("You are here")
                            .openPopup();


                        // 📡 2️⃣ Fetch route data from Express API, sending current location
                        const res = await axios.post("http://localhost:3005/api/deliveryMap", {
                            start: [userLat, userLng],
                        });

                        const { polyline: encoded, waypoints } = res.data;

                        if (encoded) {
                            // 🔓 Decode the encoded polyline into coordinates
                            const decoded = polyline.decode(encoded);

                            // 🟦 Draw the route line
                            const routeLine = L.polyline(decoded, {
                                color: "blue",
                                weight: 4,
                            }).addTo(mapRef.current!);

                            // 📍 Add waypoint markers
                            if (Array.isArray(waypoints)) {
                                waypoints.forEach((wp: any, i: number) => {
                                    if (wp.location && wp.location.length === 2) {
                                        L.marker([wp.location[1], wp.location[0]])
                                            .addTo(mapRef.current!)
                                            .bindPopup(`Stop ${i + 1}`);
                                    }
                                });
                            }

                            // 🔍 Fit map to route
                            mapRef.current!.fitBounds(routeLine.getBounds());
                        }
                    },
                    (err) => {
                        console.error("❌ Error getting location:", err);
                        alert("Unable to get your current location. Please enable GPS.");
                    },
                    { enableHighAccuracy: true }
                );
            } catch (err) {
                console.error("❌ Error loading route:", err);
            }
        };

        initMap();

        // 🧹 Cleanup on unmount
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
                    <IonTitle>Go to Pickup Location</IonTitle>
                    <IonButtons slot="end">
                        <IonIcon icon={callOutline} size="large" style={{ marginRight: "12px" }} />
                    </IonButtons>
                </IonToolbar>
            </IonHeader>

            <IonContent fullscreen scrollY={false}>
                {/* 🗺️ Map container */}
                <div
                    ref={mapContainerRef}
                    id="map"
                    style={{
                        height: "100%",
                        width: "100%",
                        position: "absolute",
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        zIndex: 0,
                    }}
                />
                <div className="pickup-info">
                    <h2>Parika</h2>
                    <p>Near Vijayabank, Marnamikatte, Mangalore</p>

                    {/* ✅ Reusable slider component */}
                    <SlideToAction
                        text="Slide to Arrived"
                        color="var(--ion-color-success, #28a745)"
                        onSlideComplete={() => history.push("/CollectOrder")}
                    />
                </div>
            </IonContent>
        </IonPage>
    );
};

export default GoToPickupPage;
