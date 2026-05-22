import React, { useEffect, useState } from "react";
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
  IonCardSubtitle,
  IonBadge,
  IonSpinner,
  IonInput,
  IonItem,
  IonLabel,
} from "@ionic/react";
import "./AllOrderDetailsPage.css";
import { useHistory } from "react-router";
import { Order, OrderStatus } from "../types/types";
import { api } from "../services/api";
import { formattedOrders } from "../utils/helper";
import { truncate } from "../utils/stringUtils";
import { formatLocalDateKey, getDeviceTimeZone } from "../utils/timezone";

const AllOrderDetailsPage: React.FC = () => {
  const todayKey = formatLocalDateKey(new Date());
  const [selectedDate, setSelectedDate] = useState<string>(todayKey);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const history = useHistory();
  const tz = getDeviceTimeZone();

  useEffect(() => {
    const loadOrders = async () => {
      if (!selectedDate) return;
      setLoading(true);
      try {
        const data = await api.get<Order[]>(
          `/orders/filter?day=${encodeURIComponent(selectedDate)}&tz=${encodeURIComponent(tz)}`
        );
        const formattedData = formattedOrders(data);
        setOrders(formattedData);
      } catch (error) {
        console.error("Failed to load orders:", error);
        setOrders([]);
      } finally {
        setLoading(false);
      }
    };

    loadOrders();
  }, [selectedDate, tz]);

  const openLastOrder = (orderId: string, order?: Order) => {
    history.push({
      pathname: `/OrderDetails/${orderId}`,
      state: { order },
    });
  };

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar color="primary">
          <IonButtons slot="start">
            <IonBackButton defaultHref="/OrdersPage" />
          </IonButtons>
          <IonTitle>{selectedDate === todayKey ? "Today's Orders" : "Orders"}</IonTitle>
        </IonToolbar>
      </IonHeader>

      <IonContent fullscreen className="ion-padding">
        <div className="date-filter-card">
          <IonItem lines="none" className="date-filter-item">
            <IonLabel position="stacked">Filter by date</IonLabel>
            <IonInput
              type="date"
              value={selectedDate}
              max={todayKey}
              onIonInput={(event) => setSelectedDate(String(event.detail.value || todayKey))}
            />
          </IonItem>
        </div>

        <section className="orders-section">
          <h2>{selectedDate === todayKey ? "Today's Orders" : `Orders on ${selectedDate}`}</h2>

          {loading ? (
            <div className="loading-container">
              <IonSpinner name="crescent" />
              <p>Loading orders...</p>
            </div>
          ) : orders.length > 0 ? (
            orders.map((order) => (
              <IonCard
                key={order.id}
                button
                onClick={() => openLastOrder(order.id, order)}
                className={`order-card ${String(order.status || "").toLowerCase()}`}
              >
                <IonCardHeader>
                  <IonCardTitle className="order-card-title">
                    Order <span className="order-number-title">#{order.orderNumber}</span>
                  </IonCardTitle>

                  <div className="order-details-wrapper">
                    <div>
                      <IonCardSubtitle className="subheader-from">
                        From: <strong>{truncate(order.from, 20)}</strong>
                      </IonCardSubtitle>
                      <IonCardSubtitle className="subheader-from">
                        To: <strong>{truncate(order.to, 20)}</strong>
                      </IonCardSubtitle>
                    </div>

                    <div className="order-row">
                      <IonBadge
                        color={
                          order.status === OrderStatus.Cancelled
                            ? "danger"
                            : String(order.status || "").toLowerCase() === "pending"
                              ? "warning"
                              : "success"
                        }
                        className="order-status-badge"
                      >
                        {order.status === OrderStatus.Cancelled
                          ? "Cancelled"
                          : `₹${Number(order.earned || 0).toFixed(0)} Earned`}
                      </IonBadge>
                    </div>
                  </div>
                </IonCardHeader>
              </IonCard>
            ))
          ) : (
            <IonCard className="no-orders-card">
              <IonCardHeader>
                <IonCardTitle className="no-orders-title">
                  No orders available for the selected date
                </IonCardTitle>
              </IonCardHeader>
            </IonCard>
          )}
        </section>
      </IonContent>
    </IonPage>
  );
};

export default AllOrderDetailsPage;
