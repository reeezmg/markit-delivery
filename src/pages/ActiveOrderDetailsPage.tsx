import React from 'react';
import {
  IonPage,
  IonHeader,
  IonToolbar,
  IonButtons,
  IonBackButton,
  IonTitle,
  IonContent,
  IonCard,
  IonCardHeader,
  IonCardTitle,
  IonCardContent,
  IonLabel,
  IonGrid,
  IonRow,
  IonCol,
} from '@ionic/react';




const ActiveOrderDetailsPage: React.FC = () => {
  const items = [
    { name: 'Paneer Butter Masala', qty: 2 },
    { name: 'Garlic Naan', qty: 4 },
    { name: 'Jeera Rice', qty: 1 },
  ];

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonButtons slot="start">
            <IonBackButton defaultHref="/OrdersPage" />
          </IonButtons>
          <IonTitle>Order #4529 Details</IonTitle>
        </IonToolbar>
      </IonHeader>

      <IonContent fullscreen>
        <IonCard>
          <IonCardHeader>
            <IonCardTitle>Restaurant: The Spice Hub</IonCardTitle>
          </IonCardHeader>
          <IonCardContent>
            <IonLabel><strong>Customer:</strong> John Doe</IonLabel><br />
            <IonLabel><strong>From:</strong> The Spice Hub</IonLabel><br />
            <IonLabel><strong>To:</strong> Green Avenue</IonLabel><br /><br />

            <IonGrid>
              <IonRow>
                <IonCol><strong>Item</strong></IonCol>
                <IonCol><strong>Qty</strong></IonCol>
              </IonRow>
              {items.map((item, index) => (
                <IonRow key={index}>
                  <IonCol>{item.name}</IonCol>
                  <IonCol>{item.qty}</IonCol>
                </IonRow>
              ))}
            </IonGrid>

            <div
              style={{
                height: '200px',
                background: '#ddd',
                marginTop: '20px',
                borderRadius: '8px',
                textAlign: 'center',
                lineHeight: '200px',
              }}
            >
              🗺️ Map Placeholder
            </div>
          </IonCardContent>
        </IonCard>
      </IonContent>
    </IonPage>
  );
};

export default ActiveOrderDetailsPage;
