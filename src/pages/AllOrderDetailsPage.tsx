import React, { useEffect, useState } from "react";
import {
  IonPage,
  IonHeader,
  IonToolbar,
  IonButtons,
  IonBackButton,
  IonTitle,
  IonContent,
  IonSegment,
  IonSegmentButton,
  IonLabel,
  IonCard,
  IonCardHeader,
  IonCardTitle,
  IonCardSubtitle,
  IonBadge,
  IonSpinner,
} from "@ionic/react";
import "./AllOrderDetailsPage.css";
import { useHistory } from "react-router";
import { Order, OrderStatus } from "../types/types";
import { api } from "../services/api";
import { formattedOrders } from "../utils/helper";
import { truncate } from "../utils/stringUtils";

const AllOrderDetailsPage: React.FC = () => {
  const [selectedWeek, setSelectedWeek] = useState<"current" | "last">("current");
  const [weekDates, setWeekDates] = useState<Date[]>([]);
  const [selectedDate, setSelectedDate] = useState<string>("");
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const history = useHistory();
  const isTodayFilter = new URLSearchParams(location.search).get("filter") === "today";
  let formattedDate;

  useEffect(() => {
    if (isTodayFilter) {
      const today = new Date();
      setSelectedDate(today.toDateString());
    }
  }, [isTodayFilter]);

  // 🧾 Format selected date → YYYY-MM-DD
  if (selectedDate) {
    const dateObj = new Date(selectedDate);
    if (!isNaN(dateObj.getTime())) {
      const year = dateObj.getFullYear();
      const month = String(dateObj.getMonth() + 1).padStart(2, "0");
      const day = String(dateObj.getDate()).padStart(2, "0");
      formattedDate = `${year}-${month}-${day}`;
    }
  }

  // 🗓️ Compute week dates
  const getWeekDates = (offset = 0): Date[] => {
    const today = new Date();
    const firstDay = today.getDate() - today.getDay() + 1 + offset * 7;
    return Array.from({ length: 7 }, (_, i) => {
      const d = new Date(today);
      d.setDate(firstDay + i);
      return d;
    });
  };

  // 🕒 Update week and selected date
  useEffect(() => {
    const week = selectedWeek === "current" ? getWeekDates(0) : getWeekDates(-1);
    setWeekDates(week);

    const defaultDate =
      selectedWeek === "current" ? new Date().toDateString() : week[0].toDateString();
    setSelectedDate(defaultDate);
  }, [selectedWeek]);

  // 📦 Load Orders
  useEffect(() => {
    const loadOrders = async () => {
      if (!formattedDate) return;
      setLoading(true);
      try {
        const data = await api.get<Order[]>(`/orders/filter?day=${formattedDate}`);
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
  }, [formattedDate]);

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
            <IonBackButton defaultHref="/" />
          </IonButtons>
          <IonTitle>{isTodayFilter ? "Today's Orders" : "All Orders"}</IonTitle>
        </IonToolbar>
      </IonHeader>

      <IonContent fullscreen className="ion-padding">
        {/* 🔘 Week Selector */}
        {!isTodayFilter && (
          <IonSegment
            value={selectedWeek}
            onIonChange={(e) => setSelectedWeek(e.detail.value as "current" | "last")}
          >
            <IonSegmentButton value="current">
              <IonLabel>Current Week</IonLabel>
            </IonSegmentButton>
            <IonSegmentButton value="last">
              <IonLabel>Last Week</IonLabel>
            </IonSegmentButton>
          </IonSegment>
        )}

        {/* 🗓️ Dates Bar */}
        {!isTodayFilter && (
          <div className="dates-bar">
            {weekDates.map((date) => {
              const isActive = selectedDate === date.toDateString();
              const dayName = date
                .toLocaleDateString("en-US", { weekday: "short" })
                .toUpperCase();
              const dayNum = date.getDate();

              const today = new Date();
              const isFuture = date > today;

              return (
                <div
                  key={date.toDateString()}
                  className={`date-item ${isActive ? "active" : ""} ${isFuture ? "disabled" : ""
                    }`}
                  onClick={() => !isFuture && setSelectedDate(date.toDateString())}
                >
                  <div className="day-name">{dayName}</div>
                  <div className="day-number">{dayNum}</div>
                </div>
              );
            })}
          </div>
        )}

        {/* 📦 Orders Section */}
        <section className="orders-section">
          <h2>Orders</h2>

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
                className={`order-card ${order.status}`}
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
                            : order.status === "pending"
                              ? "warning"
                              : "success"
                        }
                        className="order-status-badge"
                      >
                        {order.status === OrderStatus.Cancelled
                          ? "Cancelled"
                          : `₹${order.earned} Earned`}
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
