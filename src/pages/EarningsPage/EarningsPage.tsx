import React, { useState, useEffect } from "react";
import {
  IonPage,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonButton,
  IonSegment,
  IonSegmentButton,
  IonLabel,
  IonAlert,
  IonToast,
} from "@ionic/react";
import "./EarningsPage.css";
import { api } from "../../services/api";
import { formatDate } from "../../utils/helper";
import { getDeviceTimeZone } from "../../utils/timezone";

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
  },
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
  const [selectedTab, setSelectedTab] = useState<
    "today" | "week" | "lastWeek" | "month"
  >("today");
  const [loading, setLoading] = useState(false);
  const [earnings, setEarnings] = useState({} as any);
  const [periodIncentives, setPeriodIncentives] = useState({ daily: 0, weekly: 0, total: 0 });
  const [payoutSummary, setPayoutSummary] = useState({ total_incentives: 0, available_for_payout: 0 });
  const [showPayoutRequest, setShowPayoutRequest] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const [toastColor, setToastColor] = useState<"success" | "danger">("success");
  const tz = getDeviceTimeZone();

  const thisWeekRange = getWeekRange(0);
  const lastWeekRange = getWeekRange(1);
  const weekRangeText =
    selectedTab === "week"
      ? `${thisWeekRange.from} - ${thisWeekRange.to}`
      : selectedTab === "lastWeek"
        ? `${lastWeekRange.from} - ${lastWeekRange.to}`
        : "";

  const fetchEarnings = async (filter: string) => {
    const data = await api.get<any>(
      `/partner/earnings/${filter}/details?tz=${encodeURIComponent(tz)}`
    );
    setEarnings(data);
  };

  const fetchPeriodIncentives = async (period: string) => {
    const data = await api.get<any>(
      `/partner/earnings/incentives/period?period=${encodeURIComponent(period)}&tz=${encodeURIComponent(tz)}`
    );
    setPeriodIncentives(data);
  };

  const fetchPayoutSummary = async () => {
    const data = await api.get<any>(
      `/partner/earnings/payout-summary?tz=${encodeURIComponent(tz)}`
    );
    setPayoutSummary(data);
  };

  useEffect(() => {
    if (!selectedTab) return;

    const fetchData = async () => {
      try {
        setLoading(true);
        await fetchEarnings(selectedTab);
        const periodMap: Record<string, string> = {
          today: "day",
          week: "week",
          lastWeek: "last-week",
          month: "month",
        };
        await fetchPeriodIncentives(periodMap[selectedTab] || "day");
      } catch (error) {
        console.error("error:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [selectedTab]);

  useEffect(() => {
    fetchPayoutSummary().catch((error) => console.error("payout summary error:", error));
  }, []);

  const {
    total_earnings: totalEarnings = 0,
    total_deliveries: noOfDeliveries = 0,
    total_tips: totalTips = 0,
    orders = [],
  } = earnings;

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
              <div className="card-value">Rs {Number(totalEarnings || 0).toFixed(2)}</div>
              <div className="card-subtext">{noOfDeliveries} Orders</div>
              {weekRangeText && (
                <div className="card-subtext">({weekRangeText})</div>
              )}
            </div>

            <div className="earnings-card">
              <div className="card-label">Tips</div>
              <div className="card-value">Rs {Number(totalTips || 0).toFixed(2)}</div>
              <div className="card-subtext">Included in total</div>
            </div>

            <div className="earnings-card">
              <div className="card-label">Incentives</div>
              <div className="card-value">Rs {Number(periodIncentives.total || 0).toFixed(2)}</div>
              <div className="card-subtext">For selected period</div>
            </div>

            <div className="earnings-card">
              <div className="card-label">Available for Payout</div>
              <div className="card-value">Rs {Number(payoutSummary.available_for_payout || 0).toFixed(2)}</div>
              <div className="payout-actions">
                <IonButton size="small" color="primary" onClick={() => setShowPayoutRequest(true)}>
                  Request Payout
                </IonButton>
              </div>
            </div>
          </section>

          <div className="section-divider"></div>

          {/* Orders */}
          <section className="orders-section">
            <div className="orders-list">
              {orders?.map((order: any) => (
                <div key={order.id} className="order-item">
                  <div className="order-left">
                    <div className="order-id">MAR-{order?.order_number}</div>
                    <div className="order-date">{formatDate(order?.delivery_time)}</div>
                  </div>
                  <div className="order-right">
                    <div className="order-amount">Rs {Number(order?.total_earnings || 0).toFixed(2)}</div>
                    <div className="order-dist">
                      Distance: {order.distance || 0} Kms
                    </div>
                    <div className="order-tip">
                      Tips: Rs {Number(order?.tips || 0).toFixed(2)}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>
      </IonContent>

      <IonAlert
        isOpen={showPayoutRequest}
        onDidDismiss={() => setShowPayoutRequest(false)}
        header="Request Payout"
        inputs={[
          {
            name: "amount",
            type: "number",
            placeholder: "Amount",
            min: 1,
          },
          {
            name: "note",
            type: "text",
            placeholder: "Note (optional)",
          },
        ]}
        buttons={[
          { text: "Cancel", role: "cancel" },
          {
            text: "Request",
            handler: async (data) => {
              const amount = Number(data?.amount || 0);
              if (!amount || amount <= 0) {
                setToastColor("danger");
                setToastMessage("Enter a valid amount");
                return false;
              }
              try {
                await api.post("/partner/payouts", {
                  amount,
                  note: data?.note || null,
                });
                setToastColor("success");
                setToastMessage("Payout request submitted");
                fetchPayoutSummary().catch(() => undefined);
              } catch (error) {
                setToastColor("danger");
                setToastMessage("Payout request failed");
              }
              return true;
            },
          },
        ]}
      />

      <IonToast
        isOpen={!!toastMessage}
        message={toastMessage}
        duration={1800}
        color={toastColor}
        onDidDismiss={() => setToastMessage("")}
      />
    </IonPage>
  );
};

export default EarningsPage;
