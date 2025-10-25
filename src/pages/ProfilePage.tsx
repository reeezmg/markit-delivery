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
  IonButton
} from '@ionic/react';
import './ProfilePage.css';

const ProfilePage: React.FC = () => {
  const userName = 'Mohammed';
  const partnerId = 'DP-123456';

  return (
    <IonPage>
      {/* 🔹 Header */}
      <IonHeader>
        <IonToolbar>
          <IonTitle style={{ textAlign: 'center', fontWeight: 'bold', letterSpacing: '0.5px', fontSize: '22px' }}>
            Profile
          </IonTitle>
        </IonToolbar>
      </IonHeader>

      {/* 🔹 Content */}
      <IonContent fullscreen className="profile-content">
        <IonCard className="profile-card">
          <IonCardContent>
            <IonAvatar className="profile-avatar">
              <img
                src="https://cdn-icons-png.flaticon.com/512/149/149071.png"
                alt="Profile"
              />
            </IonAvatar>

            <div className="profile-text">
              <h2 className="profile-name"><strong>{userName}</strong></h2>
              <p className="profile-id">Delivery Partner ID: <strong>{partnerId}</strong></p>
            </div>
          </IonCardContent>
        </IonCard>

        {/* 🔹 Navigation Buttons */}
        <div className="profile-buttons">
          <IonButton expand="block" routerLink="/PersonalDetailsPage">
            Personal Details
          </IonButton>
          <IonButton expand="block" routerLink="/BankDetailsPage">
            Bank Details
          </IonButton>
        </div>
      </IonContent>
    </IonPage>
  );
};

export default ProfilePage;
