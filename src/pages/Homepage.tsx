import React, { useState } from "react";
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




const HomePage: React.FC = () => {
  const [isOnline, setIsOnline] = useState(false);
  const [isActiveOrderAvailable, setIsActiveOrderAvailable] = useState(true);
  const toggleLiveStatus = () => setIsOnline(!isOnline);
  const history = useHistory();
  const { showPopup } = useIncomingOrderPopup();

  // useEffect(() => {
  //   const unsubscribe = onMessage(messaging, (payload) => {
  //     console.log("🔔 Push received:", payload);

  //     if (payload?.data?.notificationType === "ACTIVE_ORDER") {
  //       setIsActiveOrderAvailable(true);
  //       console.log("✅ Active order started:", payload.data.orderId);
  //     }

  //     if (payload?.data?.notificationType === "ORDER_COMPLETED") {
  //       setIsActiveOrderAvailable(false);
  //       console.log("🛑 Active order completed.");
  //     }
  //   });

  //   return () => unsubscribe();
  // }, []);

  // ✅ Example — You can later fetch this dynamically


  const ordersCompletedToday = 7;
  let incentiveAmount = 0;
  let incentiveMessage = '';

  if (ordersCompletedToday < 5) {
    incentiveMessage = `Complete ${5 - ordersCompletedToday} more orders to unlock your first incentive!`;
  } else if (ordersCompletedToday < 10) {
    incentiveAmount = 100;
    incentiveMessage = `You've earned ₹${incentiveAmount} incentive! Deliver ${10 - ordersCompletedToday} more orders to reach ₹300.`;
  } else {
    incentiveAmount = 300;
    incentiveMessage = `Amazing! You’ve completed ${ordersCompletedToday} orders and earned a ₹${incentiveAmount} bonus!`;
  }

  const openAllOrders = () => history.push('/AllOrderDetails');
  const openActiveOrder = () => history.push('/ActiveOrderDetails');
  const openEarningsPage = () => history.push('/MyEarnings');
  const openHelpSupportPage = () => history.push('/HelpSupportPage');


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
                <h2>₹ 1,250</h2>
                <p>Today's Earnings</p>
              </div>
              <div className="earnings-sub">
                <span>{ordersCompletedToday} Orders completed</span>
                <IonButton fill="clear" size="small" color="primary" onClick={openAllOrders}>
                  View Details <IonIcon icon={arrowForwardOutline} />
                </IonButton>
              </div>
            </IonCardContent>
          </IonCard>


          {/* 🟣 Incentive Card */}
          {/* 🏆 Incentive Progress Card */}
          <IonCard className="incentive-card-home">
            <IonCardContent>
              <div className="incentive-header">
                <h3>Today's Incentive</h3>
                <p>Complete 10 orders to earn ₹300 bonus</p>
              </div>

              <div className="progress-track">
                <div className="progress-bar">
                  <div
                    className="progress-fill"
                    style={{ width: `${Math.min((8 / 10) * 100, 100)}%` }} // example: 5 out of 10 orders
                  ></div>
                  <IonIcon
                    icon={bicycleOutline}
                    className="bike-icon"
                    style={{ left: `${Math.min((8 / 10) * 100, 100)}%` }}
                  />
                </div>
                <p className="progress-text">8 / 10 orders completed</p>
              </div>
            </IonCardContent>
          </IonCard>


          {isActiveOrderAvailable && <IonCard className="active-order-card">
            {/* 🔴 Active indicator */}
            <div className="active-indicator"></div>

            <IonCardContent>
              <div className="active-header">
                <IonIcon icon={bicycleOutline} size="large" color="primary" />
                <div>
                  <h3>Active Delivery</h3>
                  <p>Order ID: MK-01234</p>
                </div>
              </div>

              <IonButton expand="block" color="primary" className="start-btn" onClick={openActiveOrder}>
                {/* View on Map */}
                Order Details
              </IonButton>
            </IonCardContent>
          </IonCard>}

          {/* 🔹 Quick Access Grid */}
          <div className="quick-access-container">
            {/* Row 1 */}
            <div className="quick-row">
              <div className="quick-card-box quick-card-earnings" onClick={openEarningsPage}>
                <IonIcon icon={cashOutline} size="large" />
                <p className="quick-card-text">Earnings</p>
              </div>

              <div className="quick-card-box quick-card-wallet" onClick={openAllOrders}>
                <IonIcon icon={walletOutline} size="large" />
                <p className="quick-card-text">Wallet</p>
              </div>
            </div>

            {/* Row 2 */}
            <div className="quick-row">
              <div className="quick-card-box quick-card-last-order" onClick={openAllOrders}>
                <IonIcon icon={timeOutline} size="large" />
                <p className="quick-card-text">Last Orders</p>
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
                  onClick={() =>
                    showPopup({
                      type: "Try & Buy",
                      from: "Trends Store, City Mall",
                      to: "Flat 305, Indiranagar",
                      earnings: 145,
                      multi: false,
                    })
                  }
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
