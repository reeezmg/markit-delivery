import React from "react";
import {
    IonPage,
    IonContent,
    IonButton,
    IonIcon,
} from "@ionic/react";
import { checkmarkCircleOutline } from "ionicons/icons";
import "./DeliverySuccessPage.css";

const DeliverySuccessPage: React.FC = () => {
    const earnings = 120;

    return (
        <IonPage>
            <IonContent className="success-content" fullscreen>
                <div className="success-container">
                    {/* ✅ Checkmark animation area */}
                    <div className="checkmark-container">
                        <IonIcon icon={checkmarkCircleOutline} className="checkmark-icon" />
                        <div className="confetti"></div>
                    </div>

                    {/* 🧾 Success text */}
                    <h2 className="success-title">Delivery Completed!</h2>
                    <p className="success-message">
                        Your delivery has been successfully completed.
                        You’ve earned:
                    </p>

                    {/* 💰 Earnings display */}
                    <div className="earnings-box">
                        <h1>₹{earnings}</h1>
                        <p>Delivery Earnings</p>
                    </div>

                    {/* 🚀 CTA Button */}
                    <IonButton expand="block" className="success-btn" routerLink="/HomePage">
                        Back to Home
                    </IonButton>
                </div>
            </IonContent>
        </IonPage>
    );
};

export default DeliverySuccessPage;
