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
import './ActiveOrderDetailsPage.css';

const ActiveOrderDetailsPage: React.FC = () => {

  const orderDetails = [
    { label: 'Customer Name', value: 'Irfan Paan' },
    { label: 'From', value: 'Centro Nexus Fiza, 2nd Floor, Pandeshwar, Mangalore - 575 001' },
    { label: 'To', value: 'Prime Homes, Mulihitlu, Bolar, Mangalore - 575 001' },
  ];

  const items = [
    { name: 'Paneer Butter Masala with Ghee', qty: 2 },
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
          <div className='active-order-wrapper'>

            <IonCardContent>
              <IonCardHeader>
                <IonCardTitle className='current-order-title'>Centro Nexus Fiza</IonCardTitle>
              </IonCardHeader>

              <div className='order-details-summary-wrapper'>
                <IonGrid>
                  {orderDetails.map((item, index) => (
                    <IonRow key={index} className='order-details-summary-row'>
                      <IonCol className='order-label-col'>{item.label}</IonCol>
                      <IonCol className='order-value-col'>{item.value}</IonCol>
                    </IonRow>
                  ))}
                </IonGrid>
              </div>


              <IonCardHeader>
                <IonCardTitle className='order-summary-title'>Order Summary</IonCardTitle>
              </IonCardHeader>
              <IonGrid>
                <IonRow className='item-listing-header'>
                  <IonCol>Item</IonCol>
                  <IonCol>Qty</IonCol>
                </IonRow>
                {items.map((item, index) => (
                  <IonRow key={index} className='order-details-summary-row'>
                    <IonCol>{item.name}</IonCol>
                    <IonCol className='order-value-col'>{item.qty}</IonCol>
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
          </div>

        </IonCard>
      </IonContent>
    </IonPage>
  );
};

export default ActiveOrderDetailsPage;
