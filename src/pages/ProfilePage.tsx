import React, { useEffect, useState } from 'react';
import {
  IonContent,
  IonHeader,
  IonPage,
  IonTitle,
  IonToolbar,
  IonAvatar,
  IonCard,
  IonCardContent,
  IonItem,
  IonIcon,
  IonLabel,
  IonButton,
  useIonViewWillEnter,
} from '@ionic/react';
import {
  callOutline,
  mailOutline,
  locationOutline,
  arrowForward,
  waterOutline,
} from 'ionicons/icons';
import './ProfilePage.css';
import store from '../utils/storage';
import { useHistory } from 'react-router';

const ProfilePage: React.FC = () => {
  const history = useHistory();

  const [user, setUser] = useState<any>({});

  // store.remove("profile");

  // useEffect(() => {

  //   loadProfile();
  // }, []);

  useIonViewWillEnter(() => {
    const loadProfile = async () => {
      const storedProfile = await store.get("profile");
      if (storedProfile) {
        setUser(storedProfile);
      }
    };
    loadProfile();   // ← runs every time page becomes visible
  });

  console.log(user, 'user-profile');

  const goToBankDetails = () => {
    history.push({
      pathname: '/BankDetailsPage',
    });
  };

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar color="primary">
          <IonTitle className="profile-header">Profile</IonTitle>
        </IonToolbar>
      </IonHeader>

      <div className="profile-content">
        <IonCard className="profile-card">
          <IonCardContent>
            <IonAvatar className="profile-avatar">
              <img src={user?.profilePic} alt="Profile" />
            </IonAvatar>

            <h2 className="profile-name-header">{user?.name}</h2>

            <div className="profile-info">
              <IonItem lines="none" className="info-item">
                <IonIcon icon={waterOutline} slot="start" color="primary" />
                <IonLabel>{user.bloodGroup}</IonLabel>
              </IonItem>

              <IonItem lines="none" className="info-item">
                <IonIcon icon={callOutline} slot="start" color="primary" />
                <IonLabel>{user.phone}</IonLabel>
              </IonItem>

              <IonItem lines="none" className="info-item">
                <IonIcon icon={mailOutline} slot="start" color="primary" />
                <IonLabel>{user.email}</IonLabel>
              </IonItem>

              <IonItem lines="none" className="info-item">
                <IonIcon icon={locationOutline} slot="start" color="primary" />
                <IonLabel>{user.address}</IonLabel>
              </IonItem>
            </div>

            <div className="profile-buttons">
              <IonButton
                expand="block"
                color="medium"
                shape="round"
                className="bank-button"
                onClick={goToBankDetails}
              >
                Bank Details
                <IonIcon
                  icon={arrowForward}
                  slot="end"
                  style={{ marginLeft: '8px', fontSize: '18px' }}
                />
              </IonButton>

              <IonButton
                expand="block"
                color="primary"
                shape="round"
                className="edit-button"
                routerLink="/EditPersonalDetailsPage"
              >
                Edit Personal Info
              </IonButton>
            </div>
          </IonCardContent>
        </IonCard>
      </div>
    </IonPage>
  );
};

export default ProfilePage;
