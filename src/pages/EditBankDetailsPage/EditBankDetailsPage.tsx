import React, { useState } from 'react';
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
} from '@ionic/react';
import './EditBankDetailsPage.css';

const EditBankDetailsPage: React.FC = () => {
    const [bankName, setBankName] = useState('HDFC Bank');
    const [accountNumber, setAccountNumber] = useState('123456789012');
    const [ifscCode, setIfscCode] = useState('HDFC0001234');
    const [branch, setBranch] = useState('Koramangala, Bengaluru');

    const handleSave = () => {
        console.log('Saved:', { bankName, accountNumber, ifscCode, branch });
        // You can call your API here
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
                        value={bankName}
                        onIonChange={(e) => setBankName(e.detail.value!)}
                    />
                </IonItem>

                <IonItem>
                    <IonLabel position="stacked">Account Number</IonLabel>
                    <IonInput
                        value={accountNumber}
                        onIonChange={(e) => setAccountNumber(e.detail.value!)}
                    />
                </IonItem>

                <IonItem>
                    <IonLabel position="stacked">IFSC Code</IonLabel>
                    <IonInput
                        value={ifscCode}
                        onIonChange={(e) => setIfscCode(e.detail.value!)}
                    />
                </IonItem>

                <IonItem>
                    <IonLabel position="stacked">Branch</IonLabel>
                    <IonInput
                        value={branch}
                        onIonChange={(e) => setBranch(e.detail.value!)}
                    />
                </IonItem>

                <div className='bank-details-button-wrapper'
                >
                    <IonButton color="medium" routerLink="/BankDetailsPage" fill="outline">
                        Cancel
                    </IonButton>
                    <IonButton color="primary" onClick={handleSave}>
                        Save
                    </IonButton>
                </div>
            </IonContent>
        </IonPage>
    );
};

export default EditBankDetailsPage;
