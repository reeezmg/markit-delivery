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
import "./GoToPickupPage.css";

const GoToDropPage: React.FC = () => {
    const history = useHistory();
    const mapRef = useRef<L.Map | null>(null);
    const mapContainerRef = useRef<HTMLDivElement>(null);
    const [currentLocation, setCurrentLocation] = useState<[number, number] | null>(null);
    const userMarkerRef = useRef<L.Marker | null>(null);

    // Recalculate map size on page enter
    useIonViewDidEnter(() => {
        if (mapRef.current) {
            setTimeout(() => mapRef.current?.invalidateSize(), 300);
        }
    });

    useEffect(() => {
        const initMap = async () => {
            if (!mapContainerRef.current) return;

            // Create map
            mapRef.current = L.map(mapContainerRef.current, {
                center: [12.8610, 74.8499],
                zoom: 13,
            });

            // Add OpenStreetMap tiles
            L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
                maxZoom: 19,
                attribution: "&copy; OpenStreetMap contributors",
            }).addTo(mapRef.current);

            // Fix map render sizing
            setTimeout(() => mapRef.current?.invalidateSize(), 400);

            // Track user location live
            if (navigator.geolocation) {
                navigator.geolocation.watchPosition(
                    async (pos) => {
                        const userLat = pos.coords.latitude;
                        const userLng = pos.coords.longitude;
                        setCurrentLocation([userLat, userLng]);

                        // 🏍️ Create or move the bike marker
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

                        // Fetch route only first time
                        if (!mapRef.current?.hasLayer) return;
                        try {
                            const res = await axios.post("http://localhost:3005/api/deliveryMap", {
                                start: [userLat, userLng],
                            });

                            const { polyline: encoded, waypoints } = res.data;

                            if (encoded) {
                                const decoded = polyline.decode(encoded);

                                // Draw route
                                const routeLine = L.polyline(decoded, {
                                    color: "blue",
                                    weight: 4,
                                }).addTo(mapRef.current!);

                                // Add waypoint markers
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
                {/* 🗺️ MAP CONTAINER */}
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

                {/* FIXED INFO CARD */}
                <div className="pickup-info">
                    <h2>Parika</h2>
                    <p>Near Vijayabank, Marnamikatte, Mangalore</p>

                    {/* ✅ Reusable slider component */}
                    <SlideToAction
                        text="Slide to Arrived"
                        color="var(--ion-color-success, #28a745)"
                        onSlideComplete={() => history.push("/Delivered")}
                    />
                </div>
            </IonContent>
        </IonPage>
    );
};

export default GoToDropPage;
