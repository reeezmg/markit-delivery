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
} from "@ionic/react";
import "./AllOrderDetailsPage.css";

const AllOrderDetailsPage: React.FC = () => {
  const [selectedWeek, setSelectedWeek] = useState<"current" | "last">("current");
  const [weekDates, setWeekDates] = useState<Date[]>([]);
  const [selectedDate, setSelectedDate] = useState<string>("");

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

  useEffect(() => {
    const week = selectedWeek === "current" ? getWeekDates(0) : getWeekDates(-1);
    setWeekDates(week);
    setSelectedDate(new Date().toDateString());
  }, [selectedWeek]);

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonButtons slot="start">
            <IonBackButton defaultHref="/OrdersPage" />
          </IonButtons>
          <IonTitle>All Orders</IonTitle>
        </IonToolbar>
      </IonHeader>

      <IonContent fullscreen className="ion-padding">
        {/* 🔘 Week Selector */}
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

        {/* 🗓️ Dates Bar */}
        <div className="dates-bar">
          {weekDates.map((date) => {
            const isActive = selectedDate === date.toDateString();
            const dayName = date.toLocaleDateString("en-US", { weekday: "short" }).toUpperCase();
            const dayNum = date.getDate();

            return (
              <div
                key={date.toDateString()}
                className={`date-item ${isActive ? "active" : ""}`}
                onClick={() => setSelectedDate(date.toDateString())}
              >
                <div className="day-name">{dayName}</div>
                <div className="day-number">{dayNum}</div>
              </div>
            );
          })}
        </div>
      </IonContent>
    </IonPage>
  );
};

export default AllOrderDetailsPage;
