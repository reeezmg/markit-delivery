import React from 'react';
import { IonPage, IonHeader, IonToolbar, IonTitle, IonContent } from '@ionic/react';

const PersonalDetailsPage: React.FC = () => {
  return (
    <IonPage>
      <IonHeader>
        <IonToolbar color="primary">
          <IonTitle style={{ textAlign: 'center' }}>Personal Details</IonTitle>
        </IonToolbar>
      </IonHeader>

      <IonContent className="ion-padding">
        <p><strong>Name:</strong> Mohammed</p>
        <p><strong>Email:</strong> mohammed@example.com</p>
        <p><strong>Phone:</strong> +91 9876543210</p>
        <p><strong>Address:</strong> 123, Main Street, Bengaluru</p>
      </IonContent>
    </IonPage>
  );
};

export default PersonalDetailsPage;
