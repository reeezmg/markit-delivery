import { IonContent, IonHeader, IonPage, IonTitle, IonButtons,IonMenuButton, IonToolbar } from '@ionic/react';
import ExploreContainer from '../components/ExploreContainer';
import './HomePage.css';
import Topbar from '../components/Topbar';

const Tab1: React.FC = () => {
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
        <ExploreContainer name="Home page" />
      </IonContent>
    </IonPage>
  );
};

export default Tab1;
