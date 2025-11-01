import React from "react";
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
import { callOutline } from "ionicons/icons";
import { useHistory } from "react-router-dom";
import SlideToAction from "../../components/SlideToAction";
import "./GoToPickupPage.css";

const GoToPickupPage: React.FC = () => {
    const history = useHistory();

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
                {/* Order ID Bar */}
                <div className="order-id-bar">Order Id : 22063260127****</div>

                {/* MAP Section */}
                <div className="map-wrapper">
                    <div className="map-container">
                        <iframe
                            title="Pickup Map"
                            width="100%"
                            height="100%"
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
