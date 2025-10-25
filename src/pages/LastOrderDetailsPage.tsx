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
  IonBadge
} from '@ionic/react';

const LastOrderDetailsPage: React.FC = () => {
  const items = [
    { name: 'Veg Biryani', qty: 1, price: 180 },
    { name: 'Cold Coffee', qty: 1, price: 120 },
  ];

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonButtons slot="start">
            <IonBackButton defaultHref="/OrdersPage" />
          </IonButtons>
          <IonTitle>Last Order Details</IonTitle>
        </IonToolbar>
      </IonHeader>

      <IonContent fullscreen>
        <IonCard>
          <IonCardHeader>
            <IonCardTitle>Order #4512</IonCardTitle>
          </IonCardHeader>
          <IonCardContent>
            <IonLabel><strong>From:</strong> The Curry Corner</IonLabel><br />
            <IonLabel><strong>To:</strong> Green Avenue, Block B</IonLabel><br />
            <IonLabel><strong>Customer:</strong> John Doe</IonLabel><br />
            <IonLabel><strong>Start Time:</strong> 12:00 PM</IonLabel><br />
            <IonLabel><strong>End Time:</strong> 12:30 PM</IonLabel><br /><br />

            <IonGrid>
              <IonRow>
                <IonCol><strong>Item</strong></IonCol>
                <IonCol><strong>Qty</strong></IonCol>
                <IonCol><strong>Price</strong></IonCol>
              </IonRow>
              {items.map((item, index) => (
                <IonRow key={index}>
                  <IonCol>{item.name}</IonCol>
                  <IonCol>{item.qty}</IonCol>
                  <IonCol>₹{item.price}</IonCol>
                </IonRow>
              ))}
            </IonGrid>

            <div
              style={{
                marginTop: '16px',
                padding: '10px',
                background: '#f0f0f0',
                borderRadius: '8px',
                textAlign: 'center',
              }}
            >
              <IonLabel>Total Earned: </IonLabel>
              <IonBadge color="success" style={{ marginLeft: '6px' }}>₹230</IonBadge>
            </div>

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
              🗺️ Delivery Route Map
            </div>
          </IonCardContent>
        </IonCard>
      </IonContent>
    </IonPage>
  );
};

export default LastOrderDetailsPage;
