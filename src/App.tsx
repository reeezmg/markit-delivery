import { Redirect, Route } from 'react-router-dom';
import {
  IonApp,
  IonLabel,
  IonRouterOutlet,
  IonTabBar,
  IonTabButton,
  IonTabs,
  IonMenu,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonList,
  IonItem,
  IonMenuToggle,
  IonFooter,
  IonIcon,
  setupIonicReact
} from '@ionic/react';
import { IonReactRouter } from '@ionic/react-router';
import { cartSharp, home, person, wallet, helpCircleOutline, giftOutline, logOutOutline } from 'ionicons/icons';

import HomePage from './pages/Homepage';
import OrdersPage from './pages/OrdersPage';
import ProfilePage from './pages/ProfilePage';
import Login from './pages/Login';
import BankDetailsPage from './pages/BankDetailsPage';
import PersonalDetailsPage from './pages/PersonalDetailsPage';

import '@ionic/react/css/core.css';
import '@ionic/react/css/normalize.css';
import '@ionic/react/css/structure.css';
import '@ionic/react/css/typography.css';
import '@ionic/react/css/padding.css';
import '@ionic/react/css/float-elements.css';
import '@ionic/react/css/text-alignment.css';
import '@ionic/react/css/text-transformation.css';
import '@ionic/react/css/flex-utils.css';
import '@ionic/react/css/display.css';
import '@ionic/react/css/palettes/dark.system.css';
import './theme/variables.css';
import './pages/Style.css';
import ActiveOrderDetailsPage from './pages/ActiveOrderDetailsPage';
import LastOrderDetailsPage from './pages/LastOrderDetailsPage';
import ScheduledOrderDetailsPage from './pages/ScheduledOrderDetailsPage';

setupIonicReact();

const App: React.FC = () => {
  const isLoggedIn = !!localStorage.getItem('CapacitorStorage.token');

  const handleLogout = () => {
    localStorage.clear();
    window.location.href = '/login';
  };

  return (
    <IonApp>
      <IonReactRouter>

        {/* ---------------- MENU ---------------- */}
        <IonMenu side="start" contentId="main-content" swipeGesture={true} backdropDismiss={true}>
          <IonHeader>
            <IonToolbar color="primary">
              <IonTitle>Menu</IonTitle>
            </IonToolbar>
          </IonHeader>
          <IonContent>
            <IonList>
              <IonMenuToggle autoHide={true}>
                <IonItem routerLink="/HomePage" routerDirection="root">
                  <IonIcon slot="start" icon={home} style={{ marginRight: '12px' }} />
                  <IonLabel>Home</IonLabel>
                </IonItem>
                <IonItem routerLink="/OrdersPage" routerDirection="root">
                  <IonIcon slot="start" icon={cartSharp} style={{ marginRight: '12px' }} />
                  <IonLabel>Orders</IonLabel>
                </IonItem>
                <IonItem routerLink="/ProfilePage" routerDirection="root">
                  <IonIcon slot="start" icon={person} style={{ marginRight: '12px' }} />
                  <IonLabel>Profile</IonLabel>
                </IonItem>
                <IonItem routerLink="/PersonalDetailsPage" routerDirection="root">
                  <IonIcon slot="start" icon={wallet} style={{ marginRight: '12px' }} />
                  <IonLabel>Personal Details</IonLabel>
                </IonItem>
                <IonItem routerLink="/BankDetailsPage" routerDirection="root">
                  <IonIcon slot="start" icon={giftOutline} style={{ marginRight: '12px' }} />
                  <IonLabel>Bank Details</IonLabel>
                </IonItem>
              </IonMenuToggle>
            </IonList>
          </IonContent>

          {/* Logout button fixed at bottom */}
          <IonFooter>
            <IonItem
              button
              onClick={handleLogout}
              color="danger"
              lines="none"
              detail={false}
              style={{
                borderTop: '1px solid rgba(255,255,255,0.2)',
                backgroundColor: '#f44336',
                color: 'white',
                fontWeight: 'bold',
                justifyContent: 'center',
              }}
            >
              <IonIcon slot="start" icon={logOutOutline} style={{ marginRight: '10px' }} />
              <IonLabel>Logout</IonLabel>
            </IonItem>
          </IonFooter>
        </IonMenu>

        {/* ---------------- MAIN CONTENT WITH TABS ---------------- */}
        <IonTabs>
          <IonRouterOutlet id="main-content">
            <Route path="/HomePage" render={() => (isLoggedIn ? <HomePage /> : <Redirect to="/login" />)} exact />
            <Route path="/OrdersPage" render={() => (isLoggedIn ? <OrdersPage /> : <Redirect to="/login" />)} exact />
            <Route path="/ProfilePage" render={() => (isLoggedIn ? <ProfilePage /> : <Redirect to="/login" />)} exact />
            <Route path="/PersonalDetailsPage" render={() => (isLoggedIn ? <PersonalDetailsPage /> : <Redirect to="/login" />)} exact />
            <Route path="/BankDetailsPage" render={() => (isLoggedIn ? <BankDetailsPage /> : <Redirect to="/login" />)} exact />
            <Route path="/login" render={() => (!isLoggedIn ? <Login /> : <Redirect to="/HomePage" />)} exact />
            <Route path="/" render={() => <Redirect to={isLoggedIn ? "/HomePage" : "/login"} />} exact />
            <Route path="/ActiveOrderDetails" component={ActiveOrderDetailsPage} />
            <Route path="/LastOrderDetails" component={LastOrderDetailsPage} />
            <Route path="/ScheduledOrderDetails" component={ScheduledOrderDetailsPage} />

          </IonRouterOutlet>

          {isLoggedIn && (
            <IonTabBar slot="bottom">
              <IonTabButton tab="HomePage" href="/HomePage">
                <IonIcon icon={home} />
                <IonLabel>Home</IonLabel>
              </IonTabButton>
              <IonTabButton tab="OrdersPage" href="/OrdersPage">
                <IonIcon icon={cartSharp} />
                <IonLabel>Orders</IonLabel>
              </IonTabButton>
              <IonTabButton tab="ProfilePage" href="/ProfilePage">
                <IonIcon icon={person} />
                <IonLabel>Profile</IonLabel>
              </IonTabButton>
            </IonTabBar>
          )}
        </IonTabs>

      </IonReactRouter>
    </IonApp>
  );
};

export default App;
