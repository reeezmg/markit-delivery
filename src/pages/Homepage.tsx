import { IonContent, IonHeader, IonPage, IonTitle, IonButtons,IonMenuButton, IonToolbar } from '@ionic/react';
import ExploreContainer from '../components/ExploreContainer';
import './HomePage.css';
import Topbar from '../components/Topbar';

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
    <IonPage>
      <IonHeader>
      <Topbar title='Home'/>
    </IonHeader>

      <IonContent fullscreen>
        <IonHeader collapse="condense">
          <IonToolbar>
            <IonTitle size="large">Tab 1</IonTitle>
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
