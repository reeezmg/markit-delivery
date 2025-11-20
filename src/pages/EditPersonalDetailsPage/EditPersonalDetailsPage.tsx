import React, { useState, useEffect } from 'react';
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
    IonToast
} from '@ionic/react';
import './EditPersonalDetailsPage.css';
import { api } from '../../services/api';
import store from '../../utils/storage';

const EditPersonalDetailsPage: React.FC = () => {
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const [showToast, setShowToast] = useState<{ message: string; color: string } | null>(null);

    const loadPartnerDetails = async () => {
        try {
            const storedProfile = await store.get("profile");

            if (storedProfile) {
                setEmail(storedProfile.email || '');
            } else {
                setShowToast({ message: 'No profile found in storage', color: 'warning' });
            }
        } catch (error) {
            console.error('Failed loading partner:', error);
            setShowToast({ message: 'Failed to load details', color: 'danger' });
        }
    };


    useEffect(() => {
        loadPartnerDetails();
    }, []);

    const handleSave = async () => {
        try {
            setLoading(true);

            await api.put('/deliveryPartners/update-profile', { email });

            // update stored profile correctly
            const storedProfile = await store.get("profile");
            if (storedProfile) {
                await store.set("profile", {
                    ...storedProfile,
                    email: email
                });
            }

            setShowToast({ message: 'Personal details updated!', color: 'success' });

        } catch (err) {
            setShowToast({ message: 'Failed to update details', color: 'danger' });
        } finally {
            setLoading(false);
        }
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
                                disabled={loading}
                            >
                                Cancel
                            </IonButton>

                            <IonButton
                                expand="block"
                                color="primary"
                                shape="round"
                                onClick={handleSave}
                                disabled={loading}
                            >
                                {loading ? 'Saving...' : 'Save'}
                            </IonButton>
                        </div>
                    </IonCardContent>
                </IonCard>

                {showToast && (
                    <IonToast
                        isOpen={true}
                        message={showToast.message}
                        duration={1500}
                        color={showToast.color}
                        onDidDismiss={() => setShowToast(null)}
                    />
                )}
            </IonContent>
        </IonPage>
    );
};

export default EditPersonalDetailsPage;
