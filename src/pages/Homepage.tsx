import React, { useEffect, useState } from "react";
import {
  IonContent,
  IonHeader,
  IonMenuButton,
  IonPage,
  IonToolbar,
  IonButtons,
  IonCard,
  IonCardContent,
  IonIcon,
  IonGrid,
  IonRow,
  IonCol,
  IonButton,
  useIonViewWillEnter,
} from "@ionic/react";
import {
  menu,
  cashOutline,
  bicycleOutline,
  walletOutline,
  helpCircleOutline,
  timeOutline,
  giftOutline,
  arrowForwardOutline,
} from "ionicons/icons";
import "./HomePage.css";
import { useIncomingOrderPopup } from "../components/IncomingOrderPopup";
import { useHistory } from 'react-router';
import { api } from "../services/api";
import store from "../utils/storage";
import { mapPartnerToUser } from "../utils/helper";
import { getCurrentPage } from "./OrderWalkthrough/walkthroughSteps";

const HomePage: React.FC = () => {
  const [isOnline, setIsOnline] = useState(false);
  const [activeOrder, setActiveOrder] = useState<Record<string, any> | null>(null);
  const [todaysEarnings, setTodaysEarnings] = useState({} as any);
  const toggleLiveStatus = () => setIsOnline(!isOnline);
  const history = useHistory();
  const { showPopup } = useIncomingOrderPopup();

  const fetchProfile = async () => {
    try {
      const data = await api.get(`/deliveryPartners`);
      if (data) {
        await store.set("profile", mapPartnerToUser(data));
      } else {
        await store.remove("profile");
      }
    } catch (error) {
      console.error("Failed to load profile:", error);
    }
  };

  useEffect(() => {
    const loadProfile = async () => {
      const storedProfile = await store.get("profile");

      // ✅ Call API only if profile is empty, null, or undefined
      if (!storedProfile || Object.keys(storedProfile).length === 0) {
        await fetchProfile();
      }
    };

    loadProfile();
  }, []);

  const fetchEarnings = async (filter: string) => {
    const data = await api.get<any>(`/partner/earnings/${filter}/details`);
    setTodaysEarnings(data);
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        await fetchEarnings('today');
      } catch (error) {
        console.error("error:", error);
      }
    };
    fetchData();
  }, []);

  // Refresh active order check every time the page comes into view
  useIonViewWillEnter(() => {
    try {
      const raw = sessionStorage.getItem("activeOrder");
      const parsed = raw ? JSON.parse(raw) : null;
      setActiveOrder(parsed && Object.keys(parsed).length > 0 ? parsed : null);
    } catch {
      setActiveOrder(null);
    }
  });

  const {
    total_earnings: totalEarningsForToday = 0,
    total_deliveries: noOfDeliveries = 0,
  } = todaysEarnings;

  let incentiveAmount = 0;
  let incentiveTarget = 10;
  if (noOfDeliveries >= 10) {
    incentiveAmount = 300;
    incentiveTarget = 10;
  } else if (noOfDeliveries >= 5) {
    incentiveAmount = 100;
    incentiveTarget = 10;
  }

  const openAllOrders = () => history.push('/AllOrderDetails');
  const openTodaysOrders = () => history.push('/AllOrderDetails/?filter=today');
  const openEarningsPage = () => history.push('/MyEarnings');
  const openHelpSupportPage = () => history.push('/HelpSupportPage');
  const openWalletPage = () => history.push('/WalletPage');
  const resumeActiveOrder = () => {
    const page = getCurrentPage();
    history.push(page || '/GoToPickup');
  };


  return (
    <IonPage id="main-content">
      {/* Header */}
      <IonHeader>
        <IonToolbar
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            position: 'relative',
          }}
        >
          <IonButtons slot="start">
            <IonMenuButton autoHide={false}>
              <IonIcon icon={menu} />
            </IonMenuButton>
          </IonButtons>

          {/* Live Toggle in Center */}
          <div
            style={{
              position: 'absolute',
              left: '50%',
              top: '50%',
              transform: 'translate(-50%, -50%)',
            }}
          >
            <div
              onClick={toggleLiveStatus}
              className={`live-toggle ${isOnline ? 'online' : 'offline'}`}
            >
              <div className="toggle-ball"></div>
              {isOnline ? (
                <span className="toggle-text live">Live</span>
              ) : (
                <span className="toggle-text go-live">Go Live</span>
              )}
            </div>
          </div>
        </IonToolbar>
      </IonHeader>


      <IonContent fullscreen>
        <div className="home-container">
          {/* 🟢 Earnings Summary */}
          <IonCard className="earnings-card-home-page">
            <IonCardContent>
              <div className="earnings-header-home-page">
                <h2>₹ {totalEarningsForToday}</h2>
                <p>Today's Earnings</p>
              </div>
              <div className="earnings-sub">
                <span>{noOfDeliveries} Orders completed</span>
                <IonButton fill="clear" size="small" color="primary" onClick={openAllOrders}>
                  View Details <IonIcon icon={arrowForwardOutline} />
                </IonButton>
              </div>
            </IonCardContent>
          </IonCard>


          {/* 🏆 Incentive Progress Card */}
          <IonCard className="incentive-card-home">
            <IonCardContent>
              <div className="incentive-header">
                <h3>Today's Incentive</h3>
                <p>
                  {noOfDeliveries >= 10
                    ? `🎉 You've earned ₹300 bonus — ${noOfDeliveries} orders done!`
                    : noOfDeliveries >= 5
                    ? `₹100 unlocked! ${incentiveTarget - noOfDeliveries} more for ₹300 bonus`
                    : `Complete 10 orders to earn ₹300 bonus`}
                </p>
              </div>

              <div className="progress-track">
                <div className="progress-bar">
                  <div
                    className="progress-fill"
                    style={{ width: `${Math.min((noOfDeliveries / incentiveTarget) * 100, 100)}%` }}
                  ></div>
                  <IonIcon
                    icon={bicycleOutline}
                    className="bike-icon"
                    style={{ left: `${Math.min((noOfDeliveries / incentiveTarget) * 100, 100)}%` }}
                  />
                </div>
                <p className="progress-text">{noOfDeliveries} / {incentiveTarget} orders completed{incentiveAmount > 0 ? ` · ₹${incentiveAmount} earned` : ''}</p>
              </div>
            </IonCardContent>
          </IonCard>

          {/* 🚴 Active Delivery Card — only shown when there's an ongoing order */}
          {activeOrder && (
            <IonCard className="active-order-card">
              <div className="active-indicator"></div>
              <IonCardContent>
                <div className="active-header">
                  <IonIcon icon={bicycleOutline} size="large" color="primary" />
                  <div>
                    <h3>Active Delivery</h3>
                    <p style={{ fontSize: 12, color: '#6b7280' }}>
                      {activeOrder.type === 'Try & Buy' ? 'TRY & BUY' : 'STANDARD'}
                    </p>
                    {activeOrder.storeName && (
                      <p style={{ fontSize: 12, marginTop: 2 }}>📍 {activeOrder.storeName}</p>
                    )}
                    {activeOrder.deliveryAddress && (
                      <p style={{ fontSize: 12 }}>🏠 {activeOrder.deliveryAddress}</p>
                    )}
                  </div>
                </div>
                <IonButton expand="block" color="primary" className="start-btn" onClick={resumeActiveOrder}>
                  Resume Delivery
                </IonButton>
              </IonCardContent>
            </IonCard>
          )}

          {/* 🔹 Quick Access Grid */}
          <div className="quick-access-container">
            {/* Row 1 */}
            <div className="quick-row">
              <div className="quick-card-box quick-card-earnings" onClick={openEarningsPage}>
                <IonIcon icon={cashOutline} size="large" />
                <p className="quick-card-text">Earnings</p>
              </div>

              <div className="quick-card-box quick-card-wallet" onClick={openWalletPage}>
                <IonIcon icon={walletOutline} size="large" />
                <p className="quick-card-text">Wallet</p>
              </div>
            </div>

            {/* Row 2 */}
            <div className="quick-row">
              <div className="quick-card-box quick-card-last-order" onClick={openTodaysOrders}>
                <IonIcon icon={timeOutline} size="large" />
                <p className="quick-card-text">Today's Orders</p>
              </div>

              <div className="quick-card-box quick-card-support" onClick={openHelpSupportPage}>
                <IonIcon icon={helpCircleOutline} size="large" />
                <p className="quick-card-text">Support</p>
              </div>
            </div>
          </div>

          {/* 🎁 Rewards Card */}
          <IonCard className="rewards-card">
            <IonCardContent className="rewards-card-wrapper-home">
              <IonIcon icon={giftOutline} size="large" />
              <div className="rewards-text">
                <h3>Weekly Rewards</h3>
                <p>Complete 20 orders to earn ₹500 bonus</p>
              </div>
            </IonCardContent>
          </IonCard>

          <IonGrid>
            <IonRow>
              <IonCol>
                <IonButton
                  expand="block"
                  color="success"
                  onClick={() => {
                    // 1️⃣ Random order type
                    const types = ["Try & Buy", "Standard", "Try & Buy"];
                    const randomType = types[Math.floor(Math.random() * types.length)];

                    // 2️⃣ Random multi-order flag
                    const isMulti = Math.random() < 0.5;

                    // 3️⃣ Random pickup and drop locations
                    const fromLocations = [
                      "Trends Store, City Mall Bakers Treat, Lalbagh Bakers Treat, Lalbagh Bakers Treat, Lalbagh Bakers Treat, Lalbagh",
                      "Domino's Pizza, Hampankatta Bakers Treat, Lalbagh Bakers Treat, Lalbagh Bakers Treat, Lalbagh Bakers Treat, Lalbagh",
                      "Ira The Fresh Kitchen, Mangalore Bakers Treat, Lalbagh Bakers Treat, Lalbagh Bakers Treat, Lalbagh Bakers Treat, Lalbagh",
                      "Reliance Smart, Kankanady Bakers Treat, Lalbagh Bakers Treat, Lalbagh Bakers Treat, Lalbagh Bakers Treat, Lalbagh  Bakers Treat, Lalbagh",
                      "Bakers Treat, Lalbagh Bakers Treat, Lalbagh Bakers Treat, Lalbagh Bakers Treat, Lalbagh Bakers Treat, LalbaghBakers Treat, Lalbagh ",
                    ];

                    const toLocations = [
                      "Flat 305, Indiranagar",
                      "House No 22, Bejai",
                      "Apartment 2B, Falnir",
                      "Building 14, Kadri",
                      "Villa 8, Urwa Market",
                    ];

                    const randomFrom =
                      fromLocations[Math.floor(Math.random() * fromLocations.length)];
                    const randomTo = toLocations[Math.floor(Math.random() * toLocations.length)];


                    const distance = Math.floor(Math.random() * 7) + 1;


                    let pay = 0;
                    if (distance <= 4) {
                      pay = 30;
                    } else {
                      pay = 30 + (distance - 4) * 8;
                    }


                    if (isMulti) pay += 10;


                    const tnbExtras = randomType === "Try & Buy"
                      ? {
                          waitingMinutes: 30,
                          storeName: randomFrom.split(",")[0].trim(),
                          storeAddress: randomFrom,
                          deliveryAddress: randomTo,
                          returnedItems: [
                            { id: 1, name: "Blue Denim Jeans", size: "M", quantity: 1 },
                            { id: 2, name: "White Cotton Shirt", size: "L", quantity: 2 },
                          ],
                        }
                      : {};

                    showPopup({
                      type: randomType,
                      from: randomFrom,
                      to: randomTo,
                      earnings: pay,
                      multi: isMulti,
                      distance: distance,
                      ...tnbExtras,
                    });
                  }}

                >
                  Simulate Incoming Order
                </IonButton>
              </IonCol>
            </IonRow>
          </IonGrid>
        </div>
      </IonContent>
    </IonPage>
  );
};



export default HomePage;
