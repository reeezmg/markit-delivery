import React, { useEffect, useState } from 'react';
import {
  IonPage,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonCard,
  IonCardContent,
  IonButton,
  IonIcon,
  IonButtons,
  IonBackButton,
} from '@ionic/react';
import { create } from 'ionicons/icons';
import './BankDetailsPage.css';
import { useHistory } from 'react-router';
import store from '../utils/storage';

const BankDetailsPage: React.FC = () => {
  const history = useHistory();

  const [user, setUser] = useState<any>({});

  // store.remove("profile");

  useEffect(() => {
    const loadProfile = async () => {
      const storedProfile = await store.get("profile");
      if (storedProfile) {
        setUser(storedProfile);
      }
    };
    loadProfile();
  }, []);

  const { bankName, accountNumber, ifscCode, branch } = user?.bankDetails || {};


  const goToBankDetails = () => {
    history.push({
      pathname: '/EditBankDetailsPage',
    });
  };

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar color="primary">
          <IonButtons slot="start">
            <IonBackButton defaultHref="/ProfilePage" />
          </IonButtons>
          <IonTitle>Bank Details</IonTitle>

        </IonToolbar>
      </IonHeader>

      <IonContent className="bank-details-content">
        <IonCard className="bank-details-card">
          <IonCardContent>

            <div className='bank-name-wrapper'>
              <h2 className="bank-title">{bankName}</h2>
              <IonButton
                fill="clear"
                color="primary"
                slot="end"
                onClick={goToBankDetails}
                style={{ display: 'flex', alignItems: 'center', fontWeight: 600 }}
              >
                <span style={{ marginRight: '6px' }}>Edit</span>
                <IonIcon icon={create} slot="icon-only" />
              </IonButton>
            </div>

            <div className="bank-info">
              <p>
                <strong>Account Number:</strong> {accountNumber}
              </p>
              <p>
                <strong>IFSC Code:</strong> {ifscCode}
              </p>
              <p>
                <strong>Branch:</strong> {branch}
              </p>
            </div>
          </IonCardContent>
        </IonCard>
      </IonContent>
    </IonPage>
  );
};

export default BankDetailsPage;
