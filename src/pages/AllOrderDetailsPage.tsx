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
  const history = useHistory();
  const isTodayFilter = new URLSearchParams(location.search).get("filter") === "today";

  useEffect(() => {
    const loadOrders = async () => {
      try {
        const data = await api.get<Order[]>('/orders/all');
        console.log('data :>> ', data);

        const formattedData = formattedOrders(data)
        setOrders(formattedData);
      } catch (error) {
        console.error('Failed to load orders:', error);
      }
    };

    loadOrders();
  }, []);

  console.log('formatted :>> ', formattedOrders(orders));

  // 🗓️ Helper to get 7 days of a week (Mon–Sun)
  const getWeekDates = (offset = 0): Date[] => {
    const today = new Date();
    const firstDay = today.getDate() - today.getDay() + 1 + offset * 7;
    return Array.from({ length: 7 }, (_, i) => {
      const d = new Date(today);
      d.setDate(firstDay + i);
      return d;
    });
  };

  // 🕒 Update week + default selected date
  useEffect(() => {
    const week = selectedWeek === "current" ? getWeekDates(0) : getWeekDates(-1);
    setWeekDates(week);

    // ✅ If current week → today; if last week → first day (Monday)
    const defaultDate =
      selectedWeek === "current"
        ? new Date().toDateString()
        : week[0].toDateString();

    setSelectedDate(defaultDate);
  }, [selectedWeek]);

  const openLastOrder = (orderId: string, order?: Order) => {
    history.push({
      pathname: `/OrderDetails/${orderId}`,
      state: { order },
    });
  };

  // ✅ Mock Orders Array (10 items)
  // const orders: Order[] = [
  //   { id: '9b1deb4d-3b7d-4bad-9bdd-2b0d7b3dcb6d', orderNumber: '4233', from: "Centro", to: "Green Avenue", earned: 230, status: OrderStatus.Completed },
  //   { id: '9b1deb4d-3b7d-4bad-9bdd-2b0d7b3dcb6d', orderNumber: '4322', from: "Eco Mall", to: "Sunset Heights", earned: 180, status: OrderStatus.Completed },
  //   { id: '9b1deb4d-3b7d-4bad-9bdd-2b0d7b3dcb6d', orderNumber: '4294', from: "Greenway", to: "City Plaza", earned: 210, status: OrderStatus.Completed },
  //   { id: '9b1deb4d-3b7d-4bad-9bdd-2b0d7b3dcb6d', orderNumber: '4274', from: "BlueMart", to: "Silver Oaks", earned: 250, status: OrderStatus.Completed },
  //   { id: '9b1deb4d-3b7d-4bad-9bdd-2b0d7b3dcb6d', orderNumber: '4234', from: "FoodHub", to: "Galaxy Tower", earned: 190, status: OrderStatus.Cancelled },
  //   { id: '9b1deb4d-3b7d-4bad-9bdd-2b0d7b3dcb6d', orderNumber: '4214', from: "Centro", to: "Lake View", earned: 300, status: OrderStatus.Completed },
  //   { id: '9b1deb4d-3b7d-4bad-9bdd-2b0d7b3dcb6d', orderNumber: '4234', from: "QuickStore", to: "Sunrise Valley", earned: 270, status: OrderStatus.Cancelled },
  //   { id: '9b1deb4d-3b7d-4bad-9bdd-2b0d7b3dcb6d', orderNumber: '4224', from: "Urban Mart", to: "Highland Park", earned: 220, status: OrderStatus.Completed },
  //   { id: '9b1deb4d-3b7d-4bad-9bdd-2b0d7b3dcb6d', orderNumber: '4634', from: "MegaBazaar", to: "City Center", earned: 260, status: OrderStatus.Completed },
  //   { id: '9b1deb4d-3b7d-4bad-9bdd-2b0d7b3dcb6d', orderNumber: '4134', from: "Fresh Basket", to: "Green Avenue", earned: 200, status: OrderStatus.Completed },
  // ];

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar color="primary">
          <IonButtons slot="start">
            <IonBackButton defaultHref="/OrdersPage" />
          </IonButtons>
          <IonTitle>{isTodayFilter ? "Today's Orders" : 'All Orders'}</IonTitle>
        </IonToolbar>
      </IonHeader>

      <IonContent fullscreen className="ion-padding">
        {/* 🔘 Week Selector */}
        {!isTodayFilter && <IonSegment
          value={selectedWeek}
          onIonChange={(e) => setSelectedWeek(e.detail.value as "current" | "last")}
        >
          <IonSegmentButton value="current">
            <IonLabel>Current Week</IonLabel>
          </IonSegmentButton>
          <IonSegmentButton value="last">
            <IonLabel>Last Week</IonLabel>
          </IonSegmentButton>
        </IonSegment>}

        {/* 🗓️ Dates Bar */}
        {!isTodayFilter && <div className="dates-bar">
          {weekDates.map((date) => {
            const isActive = selectedDate === date.toDateString();
            const dayName = date.toLocaleDateString("en-US", { weekday: "short" }).toUpperCase();
            const dayNum = date.getDate();

            // 🚫 Disable future dates
            const today = new Date();
            const isFuture = date > today;

            return (
              <div
                key={date.toDateString()}
                className={`date-item ${isActive ? "active" : ""} ${isFuture ? "disabled" : ""}`}
                onClick={() => !isFuture && setSelectedDate(date.toDateString())}
              >
                <div className="day-name">{dayName}</div>
                <div className="day-number">{dayNum}</div>
              </div>
            );
          })}
        </div>}

        {/* 📦 Orders List */}
        <section className="orders-section">
          <h2>Orders</h2>

          {orders.map((order) => (
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
                      From:{" "}
                      <strong>
                        {truncate(order.from, 20)}
                      </strong>
                    </IonCardSubtitle>
                    <IonCardSubtitle className="subheader-from">
                      To:{" "}
                      <strong>
                        {truncate(order.to, 20)}
                      </strong>
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
                      {order.status === OrderStatus.Cancelled ? 'Cancelled' : `₹${order.earned} Earned`}
                    </IonBadge>
                  </div>
                </div>
              </IonCardHeader>
            </IonCard>
          ))}
        </section>
      </IonContent>
    </IonPage>
  );
};

export default AllOrderDetailsPage;
