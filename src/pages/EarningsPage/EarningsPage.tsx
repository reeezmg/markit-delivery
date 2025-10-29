import React, { useState, useMemo } from "react";
import {
  IonPage,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonButton,
  IonIcon,
  IonSegment,
  IonSegmentButton,
  IonLabel,
} from "@ionic/react";
import { cashOutline } from "ionicons/icons";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ResponsiveContainer,
} from "recharts";
import "./EarningsPage.css";

// -------------------- Generate Sample Orders --------------------
const generateOrders = (offsetWeeks = 0) => {
  const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
  const allOrders: Record<string, any[]> = {};
  let id = 1;

  const today = new Date();
  const baseDate = new Date(today);
  // Set baseDate to the Monday of the current or past week
  const dayOffset = (baseDate.getDay() + 6) % 7;
  baseDate.setDate(today.getDate() - dayOffset - offsetWeeks * 7);

  days.forEach((_, i) => {
    const date = new Date(baseDate);
    date.setDate(baseDate.getDate() + i);
    const formattedDate = date.toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });

    allOrders[days[i]] = Array.from({ length: 5 }, () => {
      const dist = +(Math.random() * 6 + 1).toFixed(1); // 1–7 km
      const earnings = Math.max(
        30,
        Math.min(dist, 4) * 7 + Math.max(dist - 4, 0) * 8
      ).toFixed(2);

      return {
        id: `MK-${String(id++).padStart(5, "0")}`,
        dist,
        date: formattedDate,
        total: Math.floor(Math.random() * 300) + 250,
        earnings: +earnings,
      };
    });
  });

  return allOrders;
};

// Generate this week and past 3 weeks
const thisWeekOrders: any = generateOrders(0);
const lastWeekOrders: any = generateOrders(1);
const week3Orders: any = generateOrders(2);
const week4Orders: any = generateOrders(3);

// -------------------- Utilities --------------------
interface Order {
  id: string;
  dist: number;
  date: string;
  total: number;
  earnings: number;
}

const getWeeklyData = (orders: Record<string, Order[]>) =>
  Object.entries(orders).map(([day, ord]) => ({
    name: day,
    earnings: ord.reduce((sum, o) => sum + o.earnings, 0),
  }));

const getWeekRange = (offsetWeeks = 0) => {
  const today = new Date();
  const start = new Date(today);
  const dayOffset = (today.getDay() + 6) % 7;
  start.setDate(today.getDate() - dayOffset - 7 * offsetWeeks);
  const end = new Date(start);
  end.setDate(start.getDate() + 6);
  return {
    from: start.toLocaleDateString("en-IN", { day: "2-digit", month: "short" }),
    to: end.toLocaleDateString("en-IN", { day: "2-digit", month: "short" }),
  };
};

// -------------------- Component --------------------
const EarningsPage: React.FC = () => {
  const [selectedTab, setSelectedTab] = useState<
    "today" | "week" | "lastWeek" | "month"
  >("today");
  const [selectedDay, setSelectedDay] = useState("Mon");

  const dayNames = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
  const currentDate = new Date();
  const todayName = dayNames[(currentDate.getDay() + 6) % 7];
  const todayIndex = dayNames.indexOf(todayName);

  const thisWeekData = getWeeklyData(thisWeekOrders);
  const lastWeekData = getWeeklyData(lastWeekOrders);
  const thisWeekRange = getWeekRange(0);
  const lastWeekRange = getWeekRange(1);

  // -------------------- Monthly (Last 4 Weeks, Week 4 = This Week) --------------------
  const monthlyWeeks = [week4Orders, week3Orders, lastWeekOrders, thisWeekOrders];
  const monthlyData = monthlyWeeks.map((weekOrders, i) => {
    const weekData = getWeeklyData(weekOrders);
    const total = weekData.reduce((sum, d) => sum + d.earnings, 0);
    const range = getWeekRange(3 - i);
    return {
      name: `Week ${i + 1}`,
      earnings:
        i === 3
          ? thisWeekData
              .slice(0, todayIndex + 1)
              .reduce((sum, d) => sum + d.earnings, 0)
          : +total.toFixed(2),
      range: `${range.from} - ${range.to}`,
    };
  });

  // -------------------- Earnings --------------------
  const todayOrders = thisWeekOrders[todayName] || [];

  const { todayEarnings, weekEarnings, lastWeekEarnings, monthEarnings } =
    useMemo(() => {
      const todayEarnings =
        thisWeekData.find((d) => d.name === todayName)?.earnings || 0;
      const weekEarnings = thisWeekData
        .slice(0, todayIndex + 1)
        .reduce((sum, d) => sum + d.earnings, 0);
      const lastWeekEarnings = lastWeekData.reduce(
        (sum, d) => sum + d.earnings,
        0
      );
      const monthEarnings = monthlyData.reduce(
        (sum, w) => sum + w.earnings,
        0
      );
      return { todayEarnings, weekEarnings, lastWeekEarnings, monthEarnings };
    }, [todayName, todayIndex, monthlyData]);

  // -------------------- Order Rendering --------------------
  const renderOrders = () => {
    if (selectedTab === "today") return todayOrders;
    if (selectedTab === "week") {
      const idx = dayNames.indexOf(selectedDay);
      if (idx > todayIndex) return [];
      return thisWeekOrders[selectedDay] || [];
    }
    if (selectedTab === "lastWeek") return lastWeekOrders[selectedDay] || [];
    return monthlyData.map((week, i) => (
      <div key={i} className="orders-week-block">
        <div className="week-label">{week.name}</div>
        <div className="week-dates">{week.range}</div>
        <div className="week-earnings">
          Earnings: ₹ {week.earnings.toLocaleString()}
        </div>
      </div>
    ));
  };

  // -------------------- Order Counts --------------------
  const totalThisWeekOrders = Object.entries(thisWeekOrders)
    .slice(0, todayIndex + 1)
    .reduce((sum, [, orders]) => sum + orders.length, 0);

  const totalLastWeekOrders = Object.values(lastWeekOrders).reduce(
    (sum: number, orders: Order[]) => sum + orders.length,
    0
  );

  const orderCount =
    selectedTab === "today"
      ? `${todayOrders.length} Orders`
      : selectedTab === "week"
      ? `${totalThisWeekOrders} Orders`
      : selectedTab === "lastWeek"
      ? `${totalLastWeekOrders} Orders`
      : `${monthlyData.length} weeks`;

  const weekRangeText =
    selectedTab === "week"
      ? `${thisWeekRange.from} - ${thisWeekRange.to}`
      : selectedTab === "lastWeek"
      ? `${lastWeekRange.from} - ${lastWeekRange.to}`
      : "";

  // -------------------- UI --------------------
  const totalEarnings =
    selectedTab === "today"
      ? todayEarnings
      : selectedTab === "week"
      ? weekEarnings
      : selectedTab === "lastWeek"
      ? lastWeekEarnings
      : monthEarnings;

  return (
    <IonPage className="earnings-page">
      <IonHeader translucent>
        <IonToolbar color="primary">
          <IonTitle className="profile-header">Earnings</IonTitle>
        </IonToolbar>
      </IonHeader>

      <IonContent fullscreen>
        <div className="earnings-container">
          {/* Tabs */}
          <IonSegment
            value={selectedTab}
            onIonChange={(e) =>
              setSelectedTab(
                e.detail.value as "today" | "week" | "lastWeek" | "month"
              )
            }
            className="earnings-tabs"
          >
            <IonSegmentButton value="today">
              <IonLabel className="tab-label-small">Today</IonLabel>
            </IonSegmentButton>
            <IonSegmentButton value="week">
              <IonLabel className="tab-label-small">
                <span className="main-text">Current</span>
                <span className="sub-text">Week</span>
              </IonLabel>
            </IonSegmentButton>

            <IonSegmentButton value="lastWeek">
              <IonLabel className="tab-label-small">
                <span className="main-text">Last</span>
                <span className="sub-text">Week</span>
              </IonLabel>
            </IonSegmentButton>

            <IonSegmentButton value="month">
              <IonLabel className="tab-label-small">
                <span className="main-text">This</span>
                <span className="sub-text">Month</span>
              </IonLabel>
            </IonSegmentButton>
          </IonSegment>

          <div className="section-divider"></div>

          {/* Summary */}
          <section className="summary-grid">
            <div className="earnings-card">
              <div className="card-label">Total Earnings</div>
              <div className="card-value">₹ {totalEarnings.toFixed(2)}</div>
              <div className="card-subtext">{orderCount}</div>
              {weekRangeText && (
                <div className="card-subtext">({weekRangeText})</div>
              )}
            </div>

            <div className="earnings-card">
              <div className="card-label">Tips</div>
              <div className="card-value">
                ₹ {(totalEarnings * 0.1).toFixed(2)}
              </div>
              <div className="card-subtext">Included in total</div>
            </div>

            <div className="earnings-card">
              <div className="card-label">Available for Payout</div>
              <div className="card-value">₹ {totalEarnings.toFixed(2)}</div>
              <div className="payout-actions">
                <IonButton size="small" color="primary"><IonIcon icon={cashOutline} slot="start" /><p className="withdraw-button-text">Withdraw</p></IonButton>
              </div>
            </div>
          </section>

          {(selectedTab === "week" ||
            selectedTab === "lastWeek" ||
            selectedTab === "month") && (
            <section className="chart-section">
              <div className="chart-header">
                <div className="chart-title">
                  {selectedTab === "week"
                    ? "Earnings This Week"
                    : selectedTab === "lastWeek"
                    ? "Earnings Last Week"
                    : "Earnings This Month"}
                </div>
              </div>
              <div className="chart-container">
                <ResponsiveContainer width="100%" height={150}>
                  <BarChart
                    data={
                      selectedTab === "week"
                        ? thisWeekData.slice(0, todayIndex + 1)
                        : selectedTab === "lastWeek"
                        ? lastWeekData
                        : monthlyData
                    }
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis
                      dataKey="name"
                      tick={{ fontSize: 12 }} // ← Smaller weekday labels
                    />
                    <YAxis tick={{ fontSize: 12 }} /> {/* ← Smaller Y-axis numbers */}
                    <Tooltip />
                    <Bar dataKey="earnings" fill="#a50505" barSize={20} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </section>
          )}

          <div className="section-divider"></div>

          {/* Orders */}
          <section className="orders-section">
            {(selectedTab === "week" || selectedTab === "lastWeek") && (
              <div className="orders-dropdown">
                <select
                  className="day-selector"
                  value={selectedDay}
                  onChange={(e) => setSelectedDay(e.target.value)}
                >
                  {dayNames.map((d, i) => (
                    <option
                      key={d}
                      value={d}
                      disabled={selectedTab === "week" && i > todayIndex}
                    >
                      {d}
                    </option>
                  ))}
                </select>
              </div>
            )}

            <div className="orders-list">
              {selectedTab === "month"
                ? renderOrders()
                : renderOrders().map((order: any) => (
                    <div key={order.id} className="order-item">
                      <div className="order-left">
                        <div className="order-id">{order.id}</div>
                        <div className="order-date">{order.date}</div>
                      </div>
                      <div className="order-right">
                        <div className="order-amount">
                          ₹ {order.total.toFixed(2)}
                        </div>
                        <div className="order-dist">
                          Distance: {order.dist} Kms
                        </div>
                        <div className="order-tip">
                          Earnings: ₹ {order.earnings.toFixed(2)}
                        </div>
                      </div>
                    </div>
                  ))}
            </div>
          </section>
        </div>
      </IonContent>
    </IonPage>
  );
};

export default EarningsPage;
