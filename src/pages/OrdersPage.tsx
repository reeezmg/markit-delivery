import React, { useEffect } from 'react';
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
import {
  arrowForward
} from 'ionicons/icons';
import { navigateCircle, timeOutline } from 'ionicons/icons';
import './OrdersPage.css';


import { useHistory } from 'react-router-dom';
import { Order, OrderStatus } from '../types/types';
import { api } from '../services/api';
import { formattedOrders } from '../utils/helper';
import { truncate } from '../utils/stringUtils';

const OrdersPage: React.FC = () => {
  const [lastOrder, setLastOrder] = React.useState<any>({});
  const history = useHistory();

  const openActiveOrder = () => history.push('/ActiveOrderDetails');
  const openLastOrder = (orderId: string) => {
    history.push({
      pathname: `/LastOrderDetails/${orderId}?isLastOrder=true`,
      state: { isLastOrder: true, order: lastOrder },
    });
  };
  const openAllOrders = () => history.push('/AllOrderDetails');

  useEffect(() => {
    const loadLastOrder = async () => {
      try {
        const data = await api.get<Order[]>(`/orders/last-order`);
        console.log('data :>> ', data);
        const formattedData = formattedOrders([data]);
        setLastOrder(formattedData[0]);
      } catch (error) {
        console.error('Failed to load orders:', error);
      }
    };

    loadLastOrder();
  }, []);

  console.log(lastOrder, 'llll');


  return (
    <IonPage id="orders-page">
      <IonHeader translucent className='my-orders-header'>
        <IonToolbar color="primary">
          <IonTitle className="profile-header">My Orders</IonTitle>
        </IonToolbar>
      </IonHeader>

      <IonContent fullscreen className="orders-content">

        <div className="orders-container">
          {/* Active Order */}
          <section className="orders-section">
            <h2>Active Order</h2>
            <IonCard button onClick={openActiveOrder} className="order-card active">
              <IonCardHeader>
                <IonCardTitle className='order-card-title'>Order <span className='order-number-title'> #4529 </span></IonCardTitle>
                <IonCardSubtitle className='subheader-from'>From :  Centro</IonCardSubtitle>
                <IonCardSubtitle className='subheader-to'>To : Green Avenue</IonCardSubtitle>
              </IonCardHeader>
              <IonCardContent className='status-container'>
                <div className="order-row">
                  <IonChip color="warning">
                    <IonIcon icon={navigateCircle} />
                    <IonLabel>On the way</IonLabel>
                  </IonChip>
                  <IonBadge color="primary" className='order-status-badge' >ETA: 10 mins</IonBadge>
                </div>
              </IonCardContent>
            </IonCard>
          </section>

          {/* Last Order */}
          <section className="orders-section">
            <h2>Last Order</h2>
            <IonCard button onClick={() => openLastOrder(lastOrder.id)} className="order-card completed">
              <IonCardHeader>
                <IonCardTitle className='order-card-title'>Order <span className='order-number-title'> #{lastOrder?.orderNumber} </span></IonCardTitle>
                <div className='order-details-wrapper'>
                  <div>
                    <IonCardSubtitle className='subheader-from'>From : <strong>
                      {truncate(lastOrder.from, 20)}
                    </strong></IonCardSubtitle>
                    <IonCardSubtitle className='subheader-to'>To : <strong>
                      {truncate(lastOrder.to, 20)}
                    </strong></IonCardSubtitle>
                  </div>
                  <div className="order-row">
                    <IonBadge color="success" className='order-status-badge'>₹{lastOrder.earned} Earned</IonBadge>
                  </div>
                </div>

              </IonCardHeader>
            </IonCard>
          </section>

          {/* All Orders */}
          <section className="orders-section">
            <IonCard button onClick={openAllOrders} className="order-card scheduled">
              <IonCardHeader>
                <div className='all-order-button'>
                  <span>All Orders</span>
                  <IonIcon slot="start" icon={arrowForward} style={{ marginRight: '12px' }} />
                </div>

              </IonCardHeader>

            </IonCard>
          </section>

        </div>
      </IonContent>

    </IonPage>
  );
};

export default OrdersPage;
