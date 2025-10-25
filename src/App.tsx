import { Redirect, Route, useLocation } from 'react-router-dom';
import {
  IonApp,
  IonRouterOutlet,
  IonTabBar,
  IonTabButton,
  IonTabs,
  IonIcon,
  IonLabel,
  setupIonicReact
} from '@ionic/react';
import { IonReactRouter } from '@ionic/react-router';
import { home, cart, person } from 'ionicons/icons';

import HomePage from './pages/Homepage';
import OrdersPage from './pages/OrdersPage';
import ProfilePage from './pages/ProfilePage';
import Login from './pages/Login';
import BankDetailsPage from './pages/BankDetailsPage';
import PersonalDetailsPage from './pages/PersonalDetailsPage';
import ActiveOrderDetailsPage from './pages/ActiveOrderDetailsPage';
import LastOrderDetailsPage from './pages/LastOrderDetailsPage';
import AllOrderDetailsPage from './pages/AllOrderDetailsPage';
import Sidebar from './components/SideBar';

import './theme/variables.css';
import './pages/Style.css';
import '@ionic/react/css/core.css';
import '@ionic/react/css/normalize.css';
import '@ionic/react/css/structure.css';
import '@ionic/react/css/typography.css';
import '@ionic/react/css/padding.css';
import '@ionic/react/css/flex-utils.css';
import '@ionic/react/css/display.css';

setupIonicReact();

const AppContent: React.FC = () => {
  const isLoggedIn = true;
  const location = useLocation();

  const handleLogout = () => {
    localStorage.clear();
    window.location.href = '/login';
  };

  // ✅ Show tab bar only for these routes
  const showTabBar = ['/HomePage', '/OrdersPage', '/ProfilePage'].includes(location.pathname);

  return (
    <>
      {/* Sidebar */}
      <Sidebar onLogout={handleLogout} />

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
          <Route path="/AllOrderDetails" component={AllOrderDetailsPage} />
        </IonRouterOutlet>

        {/* ✅ Conditional tab bar */}
        {isLoggedIn && showTabBar && (
          <IonTabBar slot="bottom">
            <IonTabButton tab="HomePage" href="/HomePage">
              <IonIcon icon={home} />
              <IonLabel>Home</IonLabel>
            </IonTabButton>

            <IonTabButton tab="OrdersPage" href="/OrdersPage">
              <IonIcon icon={cart} />
              <IonLabel>Orders</IonLabel>
            </IonTabButton>

            <IonTabButton tab="ProfilePage" href="/ProfilePage">
              <IonIcon icon={person} />
              <IonLabel>Profile</IonLabel>
            </IonTabButton>
          </IonTabBar>
        )}
      </IonTabs>
    </>
  );
};

const App: React.FC = () => (
  <IonApp>
    <IonReactRouter>
      <AppContent />
    </IonReactRouter>
  </IonApp>
);

export default App;
