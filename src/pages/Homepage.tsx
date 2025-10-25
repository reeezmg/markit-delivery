import React, { useState } from 'react';
import {
  IonContent,
  IonHeader,
  IonMenu,
  IonMenuButton,
  IonPage,
  IonTitle,
  IonToolbar,
  IonButtons,
  IonList,
  IonItem,
  IonLabel,
  IonFooter,
  IonIcon,
  IonMenuToggle,
} from '@ionic/react';
import {
  person,
  wallet,
  cartSharp,
  helpCircleOutline,
  giftOutline,
  logOutOutline,
  menu,
} from 'ionicons/icons';
import ExploreContainer from '../components/ExploreContainer';
import './HomePage.css';

const HomePage: React.FC = () => {
  const [isOnline, setIsOnline] = useState(false);

  const toggleLiveStatus = () => {
    setIsOnline(!isOnline);
  };

  const handleLogout = () => {
    localStorage.clear();
    window.location.href = '/login';
  };

  return (
    <>
      {/* 🔹 Sidebar Menu */}
      <IonMenu side="start" contentId="main-content" swipeGesture={true} backdropDismiss={true}>
  <IonHeader>
    <IonToolbar color="primary">
      <IonTitle>My Profile</IonTitle>
    </IonToolbar>
  </IonHeader>

  <IonContent>
    <IonList>
      <IonMenuToggle autoHide={true}>
        <IonItem button routerLink="/ProfilePage" routerDirection="root">
          <IonIcon slot="start" icon={person} style={{ marginRight: '12px' }} />
          <IonLabel>Profile</IonLabel>
        </IonItem>

        <IonItem button routerLink="/OrdersPage" routerDirection="root">
          <IonIcon slot="start" icon={cartSharp} style={{ marginRight: '12px' }} />
          <IonLabel>Orders</IonLabel>
        </IonItem>

        <IonItem button routerLink="/EarningsPage" routerDirection="root">
          <IonIcon slot="start" icon={wallet} style={{ marginRight: '12px' }} />
          <IonLabel>Earnings</IonLabel>
        </IonItem>

        <IonItem button routerLink="/HelpPage" routerDirection="root">
          <IonIcon slot="start" icon={helpCircleOutline} style={{ marginRight: '12px' }} />
          <IonLabel>Help</IonLabel>
        </IonItem>

        <IonItem button routerLink="/IncentivesPage" routerDirection="root">
          <IonIcon slot="start" icon={giftOutline} style={{ marginRight: '12px' }} />
          <IonLabel>Incentives</IonLabel>
        </IonItem>
      </IonMenuToggle>
    </IonList>
  </IonContent>

  <IonFooter>
    <IonItem
      button
      onClick={() => { localStorage.clear(); window.location.href = '/login'; }}
      color="danger"
      lines="none"
      detail={false}
      style={{
        borderTop: '1px solid rgba(255,255,255,0.2)',
        justifyContent: 'center',
      }}
    >
      <IonIcon slot="start" icon={logOutOutline} style={{ marginRight: '10px' }} />
      <IonLabel>Logout</IonLabel>
    </IonItem>
  </IonFooter>
</IonMenu>


      {/* 🔹 Main Page */}
      <IonPage id="main-content">
        <IonHeader>
          <IonToolbar
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              position: 'relative',
            }}
          >
            {/* 🟢 Left: Hamburger Menu */}
            <IonButtons slot="start">
              <IonMenuButton autoHide={false}>
                <IonIcon icon={menu} />
              </IonMenuButton>
            </IonButtons>

            {/* 🟢 Center: Animated Go Live Toggle */}
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
          <ExploreContainer name="Home page" />
        </IonContent>
      </IonPage>
    </>
  );
};

export default HomePage;
