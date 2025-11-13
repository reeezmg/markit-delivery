import React, { useEffect, useState } from 'react';
import {
    IonPage,
    IonHeader,
    IonToolbar,
    IonTitle,
    IonContent,
    IonInput,
    IonItem,
    IonLabel,
    IonButton,
    IonButtons,
    IonBackButton,
    IonToast,
    IonLoading,
} from '@ionic/react';
import './EditBankDetailsPage.css';
import store from '../../utils/storage';
import { api } from '../../services/api';

const EditBankDetailsPage: React.FC = () => {
    const [user, setUser] = useState<any>({});
    const [bankDetails, setBankDetails] = useState<any>({
        bankName: '',
        accountNumber: '',
        ifscCode: '',
        branch: '',
        upiId: ''
    });
    const [loading, setLoading] = useState(false);
    const [toastMessage, setToastMessage] = useState('');

    // ✅ Load stored profile once
    useEffect(() => {
        const loadProfile = async () => {
            const storedProfile = await store.get('profile');
            if (storedProfile) {
                setUser(storedProfile);
                setBankDetails(storedProfile.bankDetails || {});
            }
        };
        loadProfile();
    }, []);

    const handleChange = (field: string, value: string) => {
        setBankDetails((prev: any) => ({
            ...prev,
            [field]: value
        }));
    };

    const handleSave = async () => {
        setLoading(true);
        try {
            // ✅ call backend API
            const response: any = await api.put('/deliveryPartners/update-bank', {
                ifsc: bankDetails.ifscCode,
                account_no: bankDetails.accountNumber,
                bank_name: bankDetails.bankName,
                upi_id: bankDetails.upiId,
                branch: bankDetails.branch
            });

            // ✅ update store with new bank details
            const updatedUser = {
                ...user,
                bankDetails: {
                    bankName: response.bankName || bankDetails.bankName,
                    accountNumber: response.accountNo || bankDetails.accountNumber,
                    ifscCode: response.ifsc || bankDetails.ifscCode,
                    branch: response.branch || bankDetails.branch,
                    upiId: response.upiId || bankDetails.upiId
                }
            };

            await store.set('profile', updatedUser);
            setUser(updatedUser);

            setToastMessage('Bank details updated successfully!');
        } catch (error) {
            console.error('Failed to update bank details:', error);
            setToastMessage('Failed to update bank details');
        } finally {
            setLoading(false);
        }
    };

    return (
        <IonPage>
            <IonHeader>
                <IonToolbar color="primary">
                    <IonButtons slot="start">
                        <IonBackButton defaultHref="/BankDetailsPage" />
                    </IonButtons>
                    <IonTitle>Edit Bank Details</IonTitle>
                </IonToolbar>
            </IonHeader>

            <IonContent className="ion-padding">
                <IonItem>
                    <IonLabel position="stacked">Bank Name</IonLabel>
                    <IonInput
                        value={bankDetails.bankName || ''}
                        onIonChange={(e) => handleChange('bankName', e.detail.value!)}
                    />
                </IonItem>

                <IonItem>
                    <IonLabel position="stacked">Account Number</IonLabel>
                    <IonInput
                        value={bankDetails.accountNumber || ''}
                        onIonChange={(e) => handleChange('accountNumber', e.detail.value!)}
                    />
                </IonItem>

                <IonItem>
                    <IonLabel position="stacked">IFSC Code</IonLabel>
                    <IonInput
                        value={bankDetails.ifscCode || ''}
                        onIonChange={(e) => handleChange('ifscCode', e.detail.value!)}
                    />
                </IonItem>

                <IonItem>
                    <IonLabel position="stacked">Branch</IonLabel>
                    <IonInput
                        value={bankDetails.branch || ''}
                        onIonChange={(e) => handleChange('branch', e.detail.value!)}
                    />
                </IonItem>
                {/* 
                <IonItem>
                    <IonLabel position="stacked">UPI ID</IonLabel>
                    <IonInput
                        value={bankDetails.upiId || ''}
                        onIonChange={(e) => handleChange('upiId', e.detail.value!)}
                    />
                </IonItem> */}

                <div className="bank-details-button-wrapper">
                    <IonButton color="medium" routerLink="/ProfilePage" fill="outline">
                        Cancel
                    </IonButton>
                    <IonButton color="primary" onClick={handleSave}>
                        Save
                    </IonButton>
                </div>

                <IonLoading isOpen={loading} message="Saving..." />
                <IonToast
                    isOpen={!!toastMessage}
                    message={toastMessage}
                    duration={2000}
                    onDidDismiss={() => setToastMessage('')}
                />
            </IonContent>
        </IonPage>
    );
};

export default EditBankDetailsPage;
