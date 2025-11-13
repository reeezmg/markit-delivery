import React, { useEffect } from 'react';
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
import { useLocation, useParams } from 'react-router';
import { api } from '../services/api';
import { Order } from '../types/types';
import { formattedOrders } from '../utils/helper';

const LastOrderDetailsPage: React.FC = () => {
  const [orderDetail, setOrderDetails] = React.useState<any>({});

  const loc = useLocation<{ isLastOrder?: boolean }>();
  const isLastOrder = loc.state?.isLastOrder || false;

  const location = useLocation<{ order }>();
  const order = location.state?.order;
  const { orderId } = useParams<{ orderId: string }>();

  useEffect(() => {
    if (order) {
      setOrderDetails(order);
    }
  }, [isLastOrder, order]);

  console.log(order, 'order-routed', isLastOrder);

  const items = order?.cart_items?.map((d) => ({
    name: `${d.variant.code} ${d.variant.name} ${d.item.size}`,
    qty: d.quantity,
    price: d.variant.sprice,
  }));


  const orderDetails = [
    { label: 'Customer Name', value: orderDetail?.clientDetails?.name || '' },
    { label: 'From', value: orderDetail?.from || '' },
    { label: 'To', value: orderDetail?.to || '' },
    { label: 'Start Time:', value: orderDetail?.pickup_time || '12 PM' },
    { label: 'End Time', value: orderDetail?.delivery_time || '12:30 PM' },
  ];

  const paymentDetails = [
    { label: 'Delivery Fee', value: orderDetail?.deliverFees || '₹100' },
    { label: 'Waiting Charges', value: orderDetail?.waitingFees || '₹30' },
    { label: 'Tip', value: orderDetail?.tip || '₹20' },
  ];

  const totalDeliveryCharges = {
    value: orderDetail?.earned,
  }

  console.log(orderDetail?.fromStoreList, 'orderDetail?.fromStoreList');

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonButtons slot="start">
            <IonBackButton defaultHref="/OrdersPage" />
          </IonButtons>
          <IonTitle>{isLastOrder ? 'Last Order Details' : 'Order Details'}</IonTitle>
        </IonToolbar>
      </IonHeader>

      <IonContent fullscreen>
        <IonCard>
          <div className='active-order-wrapper'>

            <div className='card-amount-earned-wrapper'>
              <div className='card-amount-earned-inner-wrapper'>

                <p className='amount-earned-bold'>{totalDeliveryCharges.value}</p>
                <IonLabel className='amount-earned-subtext'>Earned From This Order</IonLabel>
              </div>
            </div>
            <IonCardContent>
              <IonCardHeader className='order-title-header-wrapper'>
                <IonCardTitle className='current-order-title'>Order #{order?.orderNumber}</IonCardTitle>
              </IonCardHeader>


              <div className='order-details-summary-wrapper'>
                <IonGrid>
                  {orderDetails.map((item, index) => (
                    <IonRow key={index} className='order-details-summary-row'>
                      <IonCol className='order-label-col'>{item.label}</IonCol>
                      {item?.label === "From" && orderDetail?.formattedStores?.length > 1 ? (
                        <IonCol className="order-value-col">
                          <div className="vertical-stepper">
                            {orderDetail.formattedStores.map((store, idx) => (
                              <div key={idx} className="step">
                                <div className="circle">{idx + 1}</div>
                                <div className="content">
                                  <div className="store-name">{store.name}</div>
                                  <div className="store-address">{store.address}</div>
                                </div>
                              </div>
                            ))}
                          </div>
                        </IonCol>
                      ) : (
                        <IonCol className="order-value-col">{item.value}</IonCol>
                      )}

                    </IonRow>
                  ))}
                </IonGrid>
              </div>


              <IonCardHeader className='order-title-header-wrapper'>
                <IonCardTitle className='order-summary-title'>Order Summary</IonCardTitle>
              </IonCardHeader>
              <IonGrid>
                <IonRow className='item-listing-header'>
                  <IonCol>Item</IonCol>
                  <IonCol>Qty</IonCol>
                </IonRow>
                {items?.map((item, index) => (
                  <IonRow key={index} className='order-details-summary-row'>
                    <IonCol>{item.name}</IonCol>
                    <IonCol className='order-value-col'>{item.qty}</IonCol>
                  </IonRow>
                ))}
              </IonGrid>
              <IonCardHeader className='order-title-header-wrapper'>
                <IonCardTitle className='order-summary-title'>Payment Details</IonCardTitle>
              </IonCardHeader>
              <IonGrid>
                {paymentDetails.map((item, index) => (
                  <IonRow key={index} className='order-details-summary-row'>
                    <IonCol>{item.label}</IonCol>
                    <IonCol className='order-value-col'>{item.value}</IonCol>
                  </IonRow>
                ))}
                <IonRow className='order-details-summary-row'>
                  <IonCol>Total Delivery Charges</IonCol>
                  <IonCol className='total-delivery-charges-amt-label'>{totalDeliveryCharges.value}</IonCol>
                </IonRow>
              </IonGrid>
              <div
                className='total-collected-amount-wrapper'
              >
                <IonLabel>Total Collected: </IonLabel> ₹230
              </div>

            </IonCardContent>
          </div>

        </IonCard>
      </IonContent >
    </IonPage >
  );
};

export default LastOrderDetailsPage;
