import React, { useState } from "react";
import {
    IonPage,
    IonHeader,
    IonToolbar,
    IonButtons,
    IonBackButton,
    IonTitle,
    IonContent,
    IonInput,
    IonTextarea,
    IonButton,
    IonLabel
} from "@ionic/react";
import "./HelpSupportPage.css";

const HelpSupportPage: React.FC = () => {
    const [title, setTitle] = useState("");
    const [query, setQuery] = useState("");

    const handleSubmit = () => {
        if (!title || !query) {
            alert("Please fill out all fields.");
            return;
        }
        console.log("Submitted:", { title, query });
        alert("Your grievance has been submitted successfully!");
        setTitle("");
        setQuery("");
    };

    return (
        <IonPage>
            <IonHeader>
                <IonToolbar color="primary">
                    <IonButtons slot="start">
                        <IonBackButton defaultHref="/HomePage" />
                    </IonButtons>
                    <IonTitle>Help & Support</IonTitle>
                </IonToolbar>
            </IonHeader>

            <IonContent className="ion-padding help-content">
                <div className="help-container">
                    <p className="help-description">
                        If you are experiencing any issues, please let us know. We will try
                        to solve them as soon as possible.
                    </p>

                    <IonLabel className="input-label">Title</IonLabel>
                    <IonInput
                        value={title}
                        onIonChange={(e) => setTitle(e.detail.value!)}
                        placeholder="Add your grievance title here"
                        className="help-input"
                    />

                    <IonLabel className="input-label">Explain the problem</IonLabel>
                    <IonTextarea
                        value={query}
                        onIonChange={(e) => setQuery(e.detail.value!)}
                        placeholder="Type your query here"
                        autoGrow={true}
                        className="help-textarea"
                    />

                    <IonButton
                        expand="block"
                        className="submit-btn"
                        onClick={handleSubmit}
                    >
                        SUBMIT
                    </IonButton>

                    <p className="contact-info">
                        You can contact us on this number{" "}
                        <a href="tel:1234567892">1234567892</a>
                    </p>
                </div>
            </IonContent>
        </IonPage>
    );
};

export default HelpSupportPage;
