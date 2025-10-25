import React from 'react';
import { IonPage, IonHeader, IonToolbar, IonTitle, IonContent } from '@ionic/react';

const BankDetailsPage: React.FC = () => {
  return (
    <IonPage>
      <IonHeader>
        <IonToolbar color="primary">
          <IonTitle style={{ textAlign: 'center' }}>Bank Details</IonTitle>
        </IonToolbar>
      </IonHeader>

      <IonContent className="ion-padding">
        <p><strong>Bank Name:</strong> HDFC Bank</p>
        <p><strong>Account Number:</strong> 123456789012</p>
        <p><strong>IFSC Code:</strong> HDFC0001234</p>
        <p><strong>Branch:</strong> Koramangala, Bengaluru</p>
      </IonContent>
    </IonPage>
  );
};

export default BankDetailsPage;
