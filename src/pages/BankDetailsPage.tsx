import React from 'react';
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

const BankDetailsPage: React.FC = () => {
  const bankDetails = {
    bankName: 'HDFC Bank',
    accountNumber: '123456789012',
    ifscCode: 'HDFC0001234',
    branch: 'Koramangala, Bengaluru',
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
              <h2 className="bank-title">{bankDetails.bankName}</h2>
              <IonButton
                fill="clear"
                color="primary"
                slot="end"
                routerLink="/EditBankDetailsPage"
                style={{ display: 'flex', alignItems: 'center', fontWeight: 600 }}
              >
                <span style={{ marginRight: '6px' }}>Edit</span>
                <IonIcon icon={create} slot="icon-only" />
              </IonButton>
            </div>

            <div className="bank-info">
              <p>
                <strong>Account Number:</strong> {bankDetails.accountNumber}
              </p>
              <p>
                <strong>IFSC Code:</strong> {bankDetails.ifscCode}
              </p>
              <p>
                <strong>Branch:</strong> {bankDetails.branch}
              </p>
            </div>
          </IonCardContent>
        </IonCard>
      </IonContent>
    </IonPage>
  );
};

export default BankDetailsPage;
