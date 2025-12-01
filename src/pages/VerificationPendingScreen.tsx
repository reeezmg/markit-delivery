import React from "react";
import { IonPage, IonContent, IonButton } from "@ionic/react";
import "./VerificationPendingScreen.css";

const VerificationPendingScreen = () => {
    const closeApp = () => {
        // For apps inside capacitor / ionic build:
        if ((window as any)?.Capacitor) {
            (window as any).Capacitor.App.exitApp();
        } else {
            alert("Close the app manually.");
        }
    };

    return (
        <IonPage>
            <IonContent className="pending-screen">
                <div className="pending-box">
                    <h2>Your Verification is Pending</h2>
                    <p>
                        Your documents have been submitted successfully.
                        Our team will verify your details shortly.
                    </p>
                    <p>You will receive an email once verified.</p>

                    <IonButton expand="block" className="close-btn" onClick={closeApp}>
                        Close App
                    </IonButton>
                </div>
            </IonContent>
        </IonPage>
    );
};

export default VerificationPendingScreen;
