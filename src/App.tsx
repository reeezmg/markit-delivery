import { Redirect, Route } from 'react-router-dom';
import {
  IonApp,
  IonContent,
  IonHeader,
  IonIcon,
  IonItem,
  IonLabel,
  IonList,
  IonMenu,
  IonMenuToggle,
  IonPage,
  IonRouterOutlet,
  IonTabBar,
  IonTabButton,
  IonTabs,
  IonTitle,
  IonToolbar,
  setupIonicReact
} from '@ionic/react';
import { IonReactRouter } from '@ionic/react-router';
import { cartSharp, home, person, menuOutline } from 'ionicons/icons';
import HomePage from './pages/Homepage';
import OrdersPage from './pages/OrdersPage';
import ProfilePage from './pages/ProfilePage';
import Login from './pages/Login';

import '@ionic/react/css/core.css';
import './theme/variables.css';

setupIonicReact();

const App: React.FC = () => {
  const isLoggedIn = !!localStorage.getItem('CapacitorStorage.token');

  return (
    <IonApp>
      <IonReactRouter>
        {isLoggedIn ? (
          <>
            {/* 🧭 Sidebar Menu */}
            <IonMenu contentId="main">
              <IonHeader>
                <IonToolbar color="primary">
                  <IonTitle>Menu</IonTitle>
                </IonToolbar>
              </IonHeader>
              <IonContent>
                <IonList>
                  <IonMenuToggle autoHide={true}>
                    <IonItem routerLink="/home" routerDirection="none">
                      <IonIcon slot="start" icon={home} />
                      <IonLabel>Home</IonLabel>
                    </IonItem>
                    <IonItem routerLink="/orders" routerDirection="none">
                      <IonIcon slot="start" icon={cartSharp} />
                      <IonLabel>Orders</IonLabel>
                    </IonItem>
                    <IonItem routerLink="/profile" routerDirection="none">
                      <IonIcon slot="start" icon={person} />
                      <IonLabel>Profile</IonLabel>
                    </IonItem>
                    <IonItem
                      button
                      onClick={() => {
                        localStorage.removeItem('CapacitorStorage.token');
                        window.location.href = '/login';
                      }}
                    >
                      <IonIcon slot="start" icon={menuOutline} />
                      <IonLabel>Logout</IonLabel>
                    </IonItem>
                  </IonMenuToggle>
                </IonList>
              </IonContent>
            </IonMenu>

            {/* 🌐 Main App Content */}
            <IonPage id="main">
              <IonTabs>
                <IonRouterOutlet>
                  <Route exact path="/home" component={HomePage} />
                  <Route exact path="/orders" component={OrdersPage} />
                  <Route exact path="/profile" component={ProfilePage} />
                  <Redirect exact from="/" to="/home" />
                </IonRouterOutlet>

                <IonTabBar slot="bottom">
                  <IonTabButton tab="home" href="/home">
                    <IonIcon icon={home} />
                    <IonLabel>Home</IonLabel>
                  </IonTabButton>

                  <IonTabButton tab="orders" href="/orders">
                    <IonIcon icon={cartSharp} />
                    <IonLabel>Orders</IonLabel>
                  </IonTabButton>

                  <IonTabButton tab="profile" href="/profile">
                    <IonIcon icon={person} />
                    <IonLabel>Profile</IonLabel>
                  </IonTabButton>
                </IonTabBar>
              </IonTabs>
            </IonPage>
          </>
        ) : (
          <IonRouterOutlet>
            <Route exact path="/login" component={Login} />
            <Redirect exact from="*" to="/login" />
          </IonRouterOutlet>
        )}
      </IonReactRouter>
    </IonApp>
  );
};

export default App;
