import React, { useState, useRef } from "react";
import {
    IonPage,
    IonHeader,
    IonToolbar,
    IonButtons,
    IonMenuButton,
    IonTitle,
    IonIcon,
    IonContent,
} from "@ionic/react";
import { callOutline, arrowForward } from "ionicons/icons";
import { useHistory } from "react-router-dom";
import "./GoToPickupPage.css";

const GoToPickupPage: React.FC = () => {
    const history = useHistory();
    const [sliderPosition, setSliderPosition] = useState(0);
    const sliderRef = useRef<HTMLDivElement>(null);
    const handleRef = useRef<HTMLDivElement>(null);

    // --- SLIDER LOGIC ---
    const handleTouchMove = (e: React.TouchEvent<HTMLDivElement>) => {
        const touch = e.touches[0];
        const slider = sliderRef.current;
        const handle = handleRef.current;
        if (!slider || !handle) return;

        const rect = slider.getBoundingClientRect();
        const newPos = Math.min(
            Math.max(0, touch.clientX - rect.left - handle.offsetWidth / 2),
            rect.width - handle.offsetWidth
        );
        setSliderPosition(newPos);
    };

    const handleTouchEnd = () => {
        const slider = sliderRef.current;
        if (!slider) return;

        if (sliderPosition > slider.offsetWidth * 0.7) {
            setSliderPosition(slider.offsetWidth - 50);
            setTimeout(() => history.push("/CollectOrder"), 300);
        } else {
            setSliderPosition(0);
        }
    };

    return (
        <IonPage>
            <IonHeader>
                <IonToolbar>
                    <IonButtons slot="start">
                        <IonMenuButton />
                    </IonButtons>
                    <IonTitle>Go to Pickup Food</IonTitle>
                    <IonButtons slot="end">
                        <IonIcon icon={callOutline} size="large" style={{ marginRight: "12px" }} />
                    </IonButtons>
                </IonToolbar>
            </IonHeader>

            {/* Disable scroll on the page itself */}
            <IonContent fullscreen scrollY={false}>
                <div className="order-id-bar">Order Id : 22063260127****</div>

                {/* MAP */}
                <div className="map-wrapper">
                    <div className="map-container">
                        <iframe
                            title="Pickup Map"
                            width="100%"
                            height="100%"
                            frameBorder="0"
                            style={{ border: 0 }}
                            src="https://www.google.com/maps/embed/v1/place?key=YOUR_GOOGLE_MAPS_API_KEY&q=Ira+The+Fresh+Kitchen,Mangalore"
                            allowFullScreen
                        ></iframe>

                        <div className="pickup-marker">Pick up here</div>
                        <div className="eta-circle">
                            <span>39</span>
                            <p>mins</p>
                        </div>
                        <button className="go-to-pickup-btn">▲ Go to pickup</button>
                    </div>
                </div>

                {/* FIXED BOTTOM CARD */}
                <div className="pickup-info">
                    <h2>Parika</h2>
                    <p>Near Vijayabank, Marnamikatte, Mangalore</p>

                    <div
                        className="slider-button"
                        ref={sliderRef}
                        onTouchMove={handleTouchMove}
                        onTouchEnd={handleTouchEnd}
                    >
                        <div
                            className="slider-handle"
                            ref={handleRef}
                            style={{ left: `${sliderPosition}px` }}
                        >
                            <IonIcon icon={arrowForward} />
                        </div>
                        <span className={`slider-text ${sliderPosition > 60 ? "sliding" : ""}`}>
                            Slide to Arrived
                        </span>
                    </div>
                </div>
            </IonContent>

        </IonPage>
    );
};

export default GoToPickupPage;
