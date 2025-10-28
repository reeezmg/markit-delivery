import React, { useState } from 'react';
import {
    IonPage,
    IonHeader,
    IonToolbar,
    IonTitle,
    IonContent,
    IonCard,
    IonCardContent,
    IonButton,
    IonInput,
    IonItem,
    IonLabel,
    IonButtons,
    IonBackButton,
} from '@ionic/react';
import './EditPersonalDetailsPage.css';

const EditPersonalDetailsPage: React.FC = () => {
    const [email, setEmail] = useState('mohammed@example.com');

    const handleSave = () => {
        console.log('Updated Email:', email);
        alert('Personal details updated successfully!');
    };

    const handleCancel = () => {
        window.history.back();
    };

    return (
        <IonPage>
            <IonHeader>
                <IonToolbar color="primary">
                    <IonButtons slot="start">
                        <IonBackButton defaultHref="/ProfilePage" />
                    </IonButtons>
                    <IonTitle>Edit Personal Details</IonTitle>
                </IonToolbar>
            </IonHeader>

            <IonContent className="edit-personal-content">
                <IonCard className="edit-personal-card">
                    <IonCardContent>
                        <h2 className="edit-title">Update Your Details</h2>

                        <IonItem lines="full" className="edit-input-item">
                            <IonLabel position="stacked">Email</IonLabel>
                            <IonInput
                                type="email"
                                value={email}
                                placeholder="Enter your email"
                                onIonChange={(e) => setEmail(e.detail.value!)}
                            />
                        </IonItem>

                        <div className="personal-info-button-wrapper">
                            <IonButton
                                expand="block"
                                color="medium"
                                shape="round"
                                fill="outline"
                                onClick={handleCancel}
                            >
                                Cancel
                            </IonButton>
                            <IonButton
                                expand="block"
                                color="primary"
                                shape="round"
                                onClick={handleSave}
                            >
                                Save
                            </IonButton>

                        </div>
                    </IonCardContent>
                </IonCard>
            </IonContent>
        </IonPage>
    );
};

export default EditPersonalDetailsPage;
