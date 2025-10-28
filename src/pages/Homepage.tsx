import React, { useState } from 'react';
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
} from '@ionic/react';
import {
  menu,
  cashOutline,
  bicycleOutline,
  walletOutline,
  helpCircleOutline,
  timeOutline,
  giftOutline,
  arrowForwardOutline,
  trophyOutline,
} from 'ionicons/icons';
import './HomePage.css';



const HomePage: React.FC = () => {
  const [isOnline, setIsOnline] = useState(false);
  const toggleLiveStatus = () => setIsOnline(!isOnline);

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

      {/* Content */}
      <IonContent fullscreen>
        <div className="home-container">
          {/* 🟢 Earnings Summary */}
          <IonCard className="earnings-card">
            <IonCardContent>
              <div className="earnings-header">
                <h2>₹ 1,250</h2>
                <p>Today's Earnings</p>
              </div>
              <div className="earnings-sub">
                <span>{ordersCompletedToday} Orders completed</span>
                <IonButton fill="clear" size="small" color="primary">
                  View Details <IonIcon icon={arrowForwardOutline} />
                </IonButton>
              </div>
            </IonCardContent>
          </IonCard>

          {/* 🟣 Incentive Card */}
          {/* 🏆 Incentive Progress Card */}
          <IonCard className="incentive-card">
            <IonCardContent>
              <div className="incentive-header">
                <h3>Today's Incentive</h3>
                <p>Complete 10 orders to earn ₹300 bonus</p>
              </div>

              <div className="progress-track">
                <div className="progress-bar">
                  <div
                    className="progress-fill"
                    style={{ width: `${Math.min((5 / 10) * 100, 100)}%` }} // example: 5 out of 10 orders
                  ></div>
                  <IonIcon
                    icon={bicycleOutline}
                    className="bike-icon"
                    style={{ left: `${Math.min((5 / 10) * 100, 100)}%` }}
                  />
                </div>
                <p className="progress-text">5 / 10 orders completed</p>
              </div>
            </IonCardContent>
          </IonCard>


          {/* 🟠 Active Orders Section */}
          <IonCard className="active-order-card">
            <IonCardContent>
              <div className="active-header">
                <IonIcon icon={bicycleOutline} size="large" color="primary" />
                <div>
                  <h3>Active Delivery</h3>
                  <p>Order ID: MK-01234</p>
                </div>
              </div>
              <IonButton expand="block" color="primary" className="start-btn">
                View on Map
              </IonButton>
            </IonCardContent>
          </IonCard>

          {/* 🔹 Quick Access Grid */}
          <IonGrid>
            <IonRow>
              <IonCol size="6">
                <IonCard className="quick-card">
                  <IonCardContent>
                    <IonIcon icon={cashOutline} size="large" />
                    <p>Earnings</p>
                  </IonCardContent>
                </IonCard>
              </IonCol>
              <IonCol size="6">
                <IonCard className="quick-card">
                  <IonCardContent>
                    <IonIcon icon={walletOutline} size="large" />
                    <p>Wallet</p>
                  </IonCardContent>
                </IonCard>
              </IonCol>
            </IonRow>
            <IonRow>
              <IonCol size="6">
                <IonCard className="quick-card">
                  <IonCardContent>
                    <IonIcon icon={timeOutline} size="large" />
                    <p>Last Orders</p>
                  </IonCardContent>
                </IonCard>
              </IonCol>
              <IonCol size="6">
                <IonCard className="quick-card">
                  <IonCardContent>
                    <IonIcon icon={helpCircleOutline} size="large" />
                    <p>Support</p>
                  </IonCardContent>
                </IonCard>
              </IonCol>
            </IonRow>
          </IonGrid>

          {/* 🎁 Rewards Card */}
          <IonCard className="rewards-card">
            <IonCardContent>
              <IonIcon icon={giftOutline} size="large" />
              <div className="rewards-text">
                <h3>Weekly Rewards</h3>
                <p>Complete 20 orders to earn ₹500 bonus</p>
              </div>
            </IonCardContent>
          </IonCard>
        </div>
      </IonContent>
    </IonPage>
  );
};

export default HomePage;
