import React, { useState, useEffect } from "react";
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
import "./EarningsPage.css";
import { useHistory } from "react-router";
import { api } from "../../services/api";
import { formatDate } from "../../utils/helper";

// -------------------- API --------------------
export const earningsApi = {
  getTodayDetails() {
    return api.get("/partner/earnings/day/details");
  },

  getWeekDetails() {
    return api.get("/partner/earnings/week/details");
  },

  getLastWeekDetails() {
    return api.get("/partner/earnings/last-week/details");
  },

  getMonthDetails() {
    return api.get("/partner/earnings/month/details");
  }
};

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
  const history = useHistory();
  const [selectedTab, setSelectedTab] = useState<
    "today" | "week" | "lastWeek" | "month"
  >("today");
  const [selectedDay, setSelectedDay] = useState("Mon");
  const [loading, setLoading] = useState(false);
  const [earnings, setEarnings] = useState({} as any);

  const thisWeekRange = getWeekRange(0);
  const lastWeekRange = getWeekRange(1);
  const weekRangeText =
    selectedTab === "week"
      ? `${thisWeekRange.from} - ${thisWeekRange.to}`
      : selectedTab === "lastWeek"
        ? `${lastWeekRange.from} - ${lastWeekRange.to}`
        : "";

  console.log(earnings, selectedTab);

  const fetchEarnings = async (filter: string) => {
    const data = await api.get<any>(`/partner/earnings/${filter}/details`);
    setEarnings(data);
  };

  useEffect(() => {
    if (!selectedTab) return;

    const fetchData = async () => {
      try {
        setLoading(true);
        await fetchEarnings(selectedTab);
      } catch (error) {
        console.error("error:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [selectedTab]);

  const {
    total_earnings: totalEarnings = 0,
    total_deliveries: noOfDeliveries = 0,
    total_tips: totalTips = 0,
    orders = [],
  } = earnings

  const openLastOrder = (orderId: string) => {
    // history.push(`/LastOrderDetails/${orderId}`);
  };

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
              <div className="card-value">₹ {totalEarnings?.toFixed(2)}</div>
              <div className="card-subtext">{noOfDeliveries} Orders</div>
              {weekRangeText && (
                <div className="card-subtext">({weekRangeText})</div>
              )}
            </div>

            <div className="earnings-card">
              <div className="card-label">Tips</div>
              <div className="card-value">
                ₹ {totalTips?.toFixed(2)}
              </div>
              <div className="card-subtext">Included in total</div>
            </div>

            <div className="earnings-card">
              <div className="card-label">Available for Payout</div>
              <div className="card-value">₹ {totalEarnings?.toFixed(2)}</div>
              {/* <div className="payout-actions">
                <IonButton size="small" color="primary"><IonIcon icon={cashOutline} slot="start" /><p className="withdraw-button-text">Withdraw</p></IonButton>
              </div> */}
            </div>
          </section>

          <div className="section-divider"></div>

          {/* Orders */}
          <section className="orders-section">

            <div className="orders-list">
              {orders?.map((order: any) => (
                <div key={order.id} className="order-item" onClick={() => openLastOrder(order.id)}>
                  <div className="order-left">
                    <div className="order-id">MAR-{order?.order_number}</div>
                    <div className="order-date">{formatDate(order?.delivery_time)}</div>
                  </div>
                  <div className="order-right">
                    <div className="order-amount">
                      ₹ {order?.total_earnings.toFixed(2)}
                    </div>
                    <div className="order-dist">
                      Distance: {order.distance || 0} Kms
                    </div>
                    <div className="order-tip">
                      Tips: ₹ {order?.tips?.toFixed(2) || '0.00'}
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
