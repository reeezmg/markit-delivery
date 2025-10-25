import React from 'react';
import {
  IonPage,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonCard,
  IonCardHeader,
  IonCardTitle,
  IonCardSubtitle,
  IonCardContent,
  IonChip,
  IonLabel,
  IonBadge,
  IonIcon,
} from '@ionic/react';
import { navigateCircle, timeOutline } from 'ionicons/icons';
import './OrdersPage.css';


import { useHistory } from 'react-router-dom';

const OrdersPage: React.FC = () => {
  const history = useHistory();

  const openActiveOrder = () => history.push('/ActiveOrderDetails');
  const openLastOrder = () => history.push('/LastOrderDetails');
  const openScheduledOrder = () => history.push('/ScheduledOrderDetails');

  return (
    <IonPage id="orders-page">
      <IonHeader translucent>
        <IonToolbar>
          <IonTitle>My Orders</IonTitle>
        </IonToolbar>
      </IonHeader>

      <IonContent fullscreen className="orders-content">
        {/* Active Order */}
        <section className="orders-section">
          <h2>Active Order</h2>
          <IonCard button onClick={openActiveOrder} className="order-card active">
            <IonCardHeader>
              <IonCardTitle>Order #4529</IonCardTitle>
              <IonCardSubtitle>Restaurant: The Spice Hub</IonCardSubtitle>
            </IonCardHeader>
            <IonCardContent>
              <div className="order-row">
                <IonChip color="warning">
                  <IonIcon icon={navigateCircle} />
                  <IonLabel>On the way</IonLabel>
                </IonChip>
                <IonBadge color="primary">ETA: 10 mins</IonBadge>
              </div>
            </IonCardContent>
          </IonCard>
        </section>

        {/* Last Order */}
        <section className="orders-section">
          <h2>Last Order</h2>
          <IonCard button onClick={openLastOrder} className="order-card completed">
            <IonCardHeader>
              <IonCardTitle>Order #4512</IonCardTitle>
              <IonCardSubtitle>Delivered to: Green Avenue</IonCardSubtitle>
            </IonCardHeader>
            <IonCardContent>
              <div className="order-row">
                <IonLabel>Customer: John Doe</IonLabel>
                <IonBadge color="medium">₹230 earned</IonBadge>
              </div>
              <div className="order-row">
                <IonLabel>Start: 12:00 PM</IonLabel>
                <IonLabel>End: 12:30 PM</IonLabel>
              </div>
            </IonCardContent>
          </IonCard>
        </section>

        {/* Scheduled Order */}
        <section className="orders-section">
          <h2>Scheduled Order</h2>
          <IonCard button onClick={openScheduledOrder} className="order-card scheduled">
            <IonCardHeader>
              <IonCardTitle>Order #4531</IonCardTitle>
              <IonCardSubtitle>Pickup: Brew & Bite Café</IonCardSubtitle>
            </IonCardHeader>
            <IonCardContent>
              <div className="order-row">
                <IonChip color="tertiary">
                  <IonIcon icon={timeOutline} />
                  <IonLabel>Scheduled 5:30 PM</IonLabel>
                </IonChip>
                <IonBadge color="light">₹180</IonBadge>
              </div>
              <div className="order-row" style={{ marginTop: '10px' }}>
                <IonLabel>Time remaining: 1h 25m</IonLabel>
              </div>
            </IonCardContent>
          </IonCard>
        </section>
      </IonContent>
    </IonPage>
  );
};

export default OrdersPage;
