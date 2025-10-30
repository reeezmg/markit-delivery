import { Redirect, Route, useLocation } from "react-router-dom";
import {
  IonApp,
  IonRouterOutlet,
  IonTabBar,
  IonTabButton,
  IonTabs,
  IonIcon,
  IonLabel,
  setupIonicReact,
} from "@ionic/react";
import { IonReactRouter } from "@ionic/react-router";
import { home, cart, person } from "ionicons/icons";

import HomePage from "./pages/Homepage";
import OrdersPage from "./pages/OrdersPage";
import ProfilePage from "./pages/ProfilePage";
import Login from "./pages/Login";
import BankDetailsPage from "./pages/BankDetailsPage";
import ActiveOrderDetailsPage from "./pages/ActiveOrderDetailsPage";
import LastOrderDetailsPage from "./pages/LastOrderDetailsPage";
import AllOrderDetailsPage from "./pages/AllOrderDetailsPage";
import Sidebar from "./components/SideBar";

import "./pages/Style.css";
import "@ionic/react/css/core.css";
import "@ionic/react/css/normalize.css";
import "@ionic/react/css/structure.css";
import "@ionic/react/css/typography.css";
import "@ionic/react/css/padding.css";
import "@ionic/react/css/flex-utils.css";
import "@ionic/react/css/display.css";
import "./theme/variables.css";
import EditBankDetailsPage from "./pages/EditBankDetailsPage/EditBankDetailsPage";
import EditPersonalDetailsPage from "./pages/EditPersonalDetailsPage/EditPersonalDetailsPage";
import IncentiveDetailsPage from "./pages/IncentiveDetailsPage/IncentiveDetailsPage";
import EarningsPage from "./pages/EarningsPage/EarningsPage";
import { IncomingOrderPopupProvider } from "./components/IncomingOrderPopup";
import HelpSupportPage from "./pages/HelpSupportPage/HelpSupportPage";
import GoToPickupPage from "./pages/OrderWalkthrough/GoToPickupPage";
import CollectOrderPage from "./pages/OrderWalkthrough/CollectOrderPage";
import GoToDropPage from "./pages/OrderWalkthrough/GoToDropPage";
import DeliveredPage from "./pages/OrderWalkthrough/DeliveredPage";


setupIonicReact();

const AppContent: React.FC = () => {
  // const isLoggedIn = !!localStorage.getItem("CapacitorStorage.token");
  const isLoggedIn = true;
  const location = useLocation();

  const handleLogout = () => {
    localStorage.clear();
    window.location.href = "/login";
  };

  const showTabBar = ["/HomePage", "/GoToPickup", "/CollectOrder", "/GoToDrop", "/Delivered", "/MyEarnings", "/OrdersPage", "/ProfilePage"].includes(location.pathname);

  return (
    <>
      <Sidebar onLogout={handleLogout} />

      <IonTabs>
        <IonRouterOutlet id="main-content">
          <Route path="/" render={() => <Redirect to={isLoggedIn ? "/HomePage" : "/login"} />} exact />
          <Route path="/login" render={() => (!isLoggedIn ? <Login /> : <Redirect to="/HomePage" />)} exact />
          <Route path="/HomePage" render={() => (isLoggedIn ? <HomePage /> : <Redirect to="/login" />)} exact />
          <Route path="/OrdersPage" render={() => (isLoggedIn ? <OrdersPage /> : <Redirect to="/login" />)} exact />
          <Route path="/ProfilePage" render={() => (isLoggedIn ? <ProfilePage /> : <Redirect to="/login" />)} exact />
          <Route path="/BankDetailsPage" render={() => (isLoggedIn ? <BankDetailsPage /> : <Redirect to="/login" />)} exact />
          <Route path="/EditBankDetailsPage" render={() => (isLoggedIn ? <EditBankDetailsPage /> : <Redirect to="/login" />)} exact />
          <Route path="/EditPersonalDetailsPage" render={() => (isLoggedIn ? <EditPersonalDetailsPage /> : <Redirect to="/login" />)} exact />
          <Route path="/ActiveOrderDetails" component={ActiveOrderDetailsPage} exact />
          <Route path="/LastOrderDetails/:orderId" component={LastOrderDetailsPage} exact />
          <Route path="/AllOrderDetails" component={AllOrderDetailsPage} exact />
          <Route path="/IncentiveDetailsPage" component={IncentiveDetailsPage} exact />
          <Route path="/MyEarnings" component={EarningsPage} exact />
          <Route path="/HelpSupportPage" component={HelpSupportPage} exact />
          <Route path="/GoToPickup" component={GoToPickupPage} exact />
          <Route path="/CollectOrder" component={CollectOrderPage} exact />
          <Route path="/GoToDrop" component={GoToDropPage} exact />
          <Route path="/Delivered" component={DeliveredPage} exact />

        </IonRouterOutlet>

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
      <IncomingOrderPopupProvider>
        <AppContent />
      </IncomingOrderPopupProvider>
    </IonReactRouter>
  </IonApp>
);

export default App;
