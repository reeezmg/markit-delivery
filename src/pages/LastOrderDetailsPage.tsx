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
import './LastOrderDetailsPage.css';

const LastOrderDetailsPage: React.FC = () => {
  const items = [
    { name: 'Veg Biryani', qty: 1, price: 180 },
    { name: 'Cold Coffee', qty: 1, price: 120 },
  ];

  const orderDetails = [
    { label: 'Customer Name', value: 'Irfan Paan' },
    { label: 'From', value: 'Centro Nexus Fiza, 2nd Floor, Pandeshwar, Mangalore - 575 001' },
    { label: 'To', value: 'Prime Homes, Mulihitlu, Bolar, Mangalore - 575 001' },
    { label: 'Start Time:', value: '12 PM' },
    { label: 'End Time', value: '1 PM' },
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
          <div className='active-order-wrapper'>

            <div className='card-amount-earned-wrapper'>
              <div className='card-amount-earned-inner-wrapper'>

                <p className='amount-earned-bold'>₹200</p>
                <IonLabel className='amount-earned-subtext'>Earned From This Order</IonLabel>
              </div>
            </div>
            <IonCardContent>
              <IonCardHeader>
                <IonCardTitle className='current-order-title'>Order #4512</IonCardTitle>
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
                  marginTop: '16px',
                  padding: '10px',
                  background: '#f0f0f0',
                  borderRadius: '8px',
                  textAlign: 'center',
                  color: '#000000',
                }}
              >
                <IonLabel>Total Collected: </IonLabel> ₹230
              </div>

            </IonCardContent>
          </div>

        </IonCard>
      </IonContent>
    </IonPage>
  );
};

export default LastOrderDetailsPage;
