import { Redirect, Route } from 'react-router-dom';
import {
  IonApp,
  IonIcon,
  IonLabel,
  IonRouterOutlet,
  IonTabBar,
  IonTabButton,
  IonTabs,
  setupIonicReact
} from '@ionic/react';
import { IonReactRouter } from '@ionic/react-router';
import { cartSharp, home, person } from 'ionicons/icons';
import HomePage from './pages/Homepage';
import OrdersPage from './pages/OrdersPage';
import ProfilePage from './pages/ProfilePage';
import Login from './pages/Login';

/* Core CSS required for Ionic components to work properly */
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

setupIonicReact();

const App: React.FC = () => {
  // Check if user is logged in (e.g., token exists in localStorage)
  //localStorage.setItem('token', 'abc123'); // key = 'token'

  const isLoggedIn = !!localStorage.getItem('CapacitorStorage.token'); // change 'token' to your key
  console.log(localStorage.getItem('token'))

  return (
    <IonApp>
      <IonReactRouter>
        <IonTabs>
          <IonRouterOutlet>
            <Route exact path="/">
              {isLoggedIn ? <HomePage /> : <Redirect to="/login" />}
            </Route>
            <Route exact path="/OrdersPage">
              {isLoggedIn ? <OrdersPage /> : <Redirect to="/login" />}
            </Route>
            <Route path="/ProfilePage">
              {isLoggedIn ? <ProfilePage /> : <Redirect to="/login" />}
            </Route>
            <Route exact path="/login">
              {!isLoggedIn ? <Login /> : <Redirect to="/" />}
            </Route>
            <Route exact path="/">
              <Redirect to={isLoggedIn ? "/" : "/login"} />
            </Route>
          </IonRouterOutlet>

          {isLoggedIn && (
            <IonTabBar slot="bottom">
              <IonTabButton tab="HomePage" href="/">
                <IonIcon aria-hidden="true" icon={home} />
                <IonLabel>Home</IonLabel>
              </IonTabButton>

              <IonTabButton tab="OrdersPage" href="/OrdersPage">
                <IonIcon aria-hidden="true" icon={cartSharp} />
                <IonLabel>Orders</IonLabel>
              </IonTabButton>

              <IonTabButton tab="ProfilePage" href="/ProfilePage">
                <IonIcon aria-hidden="true" icon={person} />
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
