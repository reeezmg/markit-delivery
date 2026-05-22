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
  IonSpinner,
  useIonViewWillEnter,
} from '@ionic/react';
import { arrowForward, navigateCircle } from 'ionicons/icons';
import { useHistory } from 'react-router-dom';
import './OrdersPage.css';

import { Order } from '../types/types';
import { api } from '../services/api';
import { formattedOrders } from '../utils/helper';
import { truncate } from '../utils/stringUtils';

const OrdersPage: React.FC = () => {
  const [activeOrder, setActiveOrder] = React.useState<any>(null);
  const [lastOrder, setLastOrder] = React.useState<any>(null);
  const [loading, setLoading] = React.useState(false);
  const history = useHistory();

  const openOrderDetails = (order: any, isLastOrder = false) => {
    if (!order?.id) return;
    history.push({
      pathname: `/OrderDetails/${order.id}`,
      state: { isLastOrder, order },
    });
  };

  const openAllOrders = () => history.push('/AllOrderDetails');

  const loadOrderSummary = async () => {
    setLoading(true);
    try {
      const [activeResult, lastResult] = await Promise.allSettled([
        api.get<Order>('/orders/active-order'),
        api.get<Order>('/orders/last-order'),
      ]);

      if (activeResult.status === 'fulfilled') {
        setActiveOrder(formattedOrders([activeResult.value])[0]);
      } else {
        setActiveOrder(null);
      }

      if (lastResult.status === 'fulfilled') {
        setLastOrder(formattedOrders([lastResult.value])[0]);
      } else {
        setLastOrder(null);
      }
    } catch (error) {
      console.error('Failed to load order summary:', error);
      setActiveOrder(null);
      setLastOrder(null);
    } finally {
      setLoading(false);
    }
  };

  useIonViewWillEnter(() => {
    loadOrderSummary();
  });

  const formatMoney = (value: number | string | undefined) => Number(value || 0).toFixed(0);

  return (
    <IonPage id="orders-page">
      <IonHeader translucent className="my-orders-header">
        <IonToolbar color="primary">
          <IonTitle className="profile-header">My Orders</IonTitle>
        </IonToolbar>
      </IonHeader>

      <IonContent fullscreen className="orders-content">
        <div className="orders-container">
          {loading && (
            <div className="orders-loading">
              <IonSpinner name="crescent" />
              <span>Loading orders...</span>
            </div>
          )}

          <section className="orders-section">
            <h2>Active Order</h2>
            {activeOrder ? (
              <IonCard button onClick={() => openOrderDetails(activeOrder)} className="order-card active">
                <IonCardHeader>
                  <IonCardTitle className="order-card-title">
                    Order <span className="order-number-title">#{activeOrder.orderNumber}</span>
                  </IonCardTitle>
                  <IonCardSubtitle className="subheader-from">
                    From : <strong>{truncate(activeOrder.from, 28)}</strong>
                  </IonCardSubtitle>
                  <IonCardSubtitle className="subheader-to">
                    To : <strong>{truncate(activeOrder.to, 28)}</strong>
                  </IonCardSubtitle>
                </IonCardHeader>
                <IonCardContent className="status-container">
                  <div className="order-row">
                    <IonChip color="warning">
                      <IonIcon icon={navigateCircle} />
                      <IonLabel>{activeOrder.status || 'In progress'}</IonLabel>
                    </IonChip>
                    <IonBadge color="primary" className="order-status-badge">
                      ₹{formatMoney(activeOrder.earned)} Earned
                    </IonBadge>
                  </div>
                </IonCardContent>
              </IonCard>
            ) : (
              <IonCard className="order-card empty">
                <IonCardHeader>
                  <IonCardTitle className="order-card-title">No active order</IonCardTitle>
                  <IonCardSubtitle className="subheader-from">
                    New assigned orders will appear here.
                  </IonCardSubtitle>
                </IonCardHeader>
              </IonCard>
            )}
          </section>

          <section className="orders-section">
            <h2>Last Order</h2>
            {lastOrder ? (
              <IonCard button onClick={() => openOrderDetails(lastOrder, true)} className="order-card completed">
                <IonCardHeader>
                  <IonCardTitle className="order-card-title">
                    Order <span className="order-number-title">#{lastOrder.orderNumber}</span>
                  </IonCardTitle>
                  <div className="order-details-wrapper">
                    <div>
                      <IonCardSubtitle className="subheader-from">
                        From : <strong>{truncate(lastOrder.from, 20)}</strong>
                      </IonCardSubtitle>
                      <IonCardSubtitle className="subheader-to">
                        To : <strong>{truncate(lastOrder.to, 20)}</strong>
                      </IonCardSubtitle>
                    </div>
                    <div className="order-row">
                      <IonBadge color="success" className="order-status-badge">
                        ₹{formatMoney(lastOrder.earned)} Earned
                      </IonBadge>
                    </div>
                  </div>
                </IonCardHeader>
              </IonCard>
            ) : (
              <IonCard className="order-card empty">
                <IonCardHeader>
                  <IonCardTitle className="order-card-title">No previous order</IonCardTitle>
                  <IonCardSubtitle className="subheader-from">
                    Completed delivery history will appear here.
                  </IonCardSubtitle>
                </IonCardHeader>
              </IonCard>
            )}
          </section>

          <section className="orders-section">
            <IonCard button onClick={openAllOrders} className="order-card scheduled">
              <IonCardHeader>
                <div className="all-order-button">
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
