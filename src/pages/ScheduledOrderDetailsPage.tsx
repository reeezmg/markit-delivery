import React, { useEffect, useState } from 'react';
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
  IonGrid,
  IonRow,
  IonCol,
  IonLabel,
  IonBadge
} from '@ionic/react';

const ScheduledOrderDetailsPage: React.FC = () => {
  const [remainingTime, setRemainingTime] = useState('01:25:00'); // 1 hour 25 min

  // simple countdown timer
  useEffect(() => {
    const interval = setInterval(() => {
      setRemainingTime(prev => {
        const [h, m, s] = prev.split(':').map(Number);
        const total = h * 3600 + m * 60 + s - 1;
        if (total <= 0) return '00:00:00';
        const hh = String(Math.floor(total / 3600)).padStart(2, '0');
        const mm = String(Math.floor((total % 3600) / 60)).padStart(2, '0');
        const ss = String(total % 60).padStart(2, '0');
        return `${hh}:${mm}:${ss}`;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const items = [
    { name: 'Iced Latte', qty: 1, price: 120 },
    { name: 'Chocolate Croissant', qty: 2, price: 160 },
  ];

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonButtons slot="start">
            <IonBackButton defaultHref="/OrdersPage" />
          </IonButtons>
          <IonTitle>Scheduled Order Details</IonTitle>
        </IonToolbar>
      </IonHeader>

      <IonContent fullscreen>
        <IonCard>
          <IonCardHeader>
            <IonCardTitle>Order #4531</IonCardTitle>
          </IonCardHeader>

          <IonCardContent>
            <IonLabel><strong>From:</strong> Brew & Bite Café</IonLabel><br />
            <IonLabel><strong>To:</strong> Blue Orchid Apartments</IonLabel><br />
            <IonLabel><strong>Customer:</strong> Sarah Ali</IonLabel><br />
            <IonLabel><strong>Scheduled Time:</strong> 5:30 PM</IonLabel><br /><br />

            <div style={{ marginBottom: '12px' }}>
              <IonLabel><strong>Time Remaining:</strong> </IonLabel>
              <IonBadge color="tertiary" style={{ marginLeft: '6px' }}>{remainingTime}</IonBadge>
            </div>

            <IonGrid>
              <IonRow>
                <IonCol><strong>Item</strong></IonCol>
                <IonCol><strong>Qty</strong></IonCol>
                <IonCol><strong>Price</strong></IonCol>
              </IonRow>
              {items.map((item, i) => (
                <IonRow key={i}>
                  <IonCol>{item.name}</IonCol>
                  <IonCol>{item.qty}</IonCol>
                  <IonCol>₹{item.price}</IonCol>
                </IonRow>
              ))}
            </IonGrid>

            <div
              style={{
                marginTop: '20px',
                padding: '10px',
                background: '#f0f0f0',
                borderRadius: '8px',
                textAlign: 'center',
              }}
            >
              <IonLabel>Total: </IonLabel>
              <IonBadge color="success" style={{ marginLeft: '6px' }}>₹280</IonBadge>
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
              🗺️ Scheduled Route Map
            </div>
          </IonCardContent>
        </IonCard>
      </IonContent>
    </IonPage>
  );
};

export default ScheduledOrderDetailsPage;
