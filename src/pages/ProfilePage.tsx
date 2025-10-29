import React from 'react';
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
} from '@ionic/react';
import {
  callOutline,
  mailOutline,
  locationOutline,
  arrowForward,
  waterOutline,
} from 'ionicons/icons';
import './ProfilePage.css';

const ProfilePage: React.FC = () => {
  const user = {
    name: 'John Brito',
    phone: '(+91) 123 456 7890',
    email: 'johnbrito@email.com',
    address: '221B, Baker Street, Chennai - 123456',
    bloodGroup: 'O +ve',
    image: 'https://cdn-icons-png.flaticon.com/512/219/219983.png',
  };

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar color="primary">
          <IonTitle className="profile-header">Profile</IonTitle>
        </IonToolbar>
      </IonHeader>

      <div  className="profile-content">
        <IonCard className="profile-card">
          <IonCardContent>
            <IonAvatar className="profile-avatar">
              <img src={user.image} alt="Profile" />
            </IonAvatar>

            <h2 className="profile-name-header">{user.name}</h2>

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
                routerLink="/BankDetailsPage"
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
