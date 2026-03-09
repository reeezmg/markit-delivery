import React from 'react';
import {
  IonButton,
  IonItem,
  IonIcon,
  IonLabel
} from '@ionic/react';
import { pricetagOutline, chatboxEllipsesOutline } from 'ionicons/icons';

// Define the props type for this component
interface AccountSectionProps {
  onLoginClicked: () => void;
}

const AccountSection: React.FC<AccountSectionProps> = ({ onLoginClicked }) => {
  return (
    <div>
      {/* Account Section */}
      <div className="mx-3 mt-4 border border-gray-300 rounded-xl text-center p-4">
        <h3 className="text-lg font-medium mb-2">Account</h3>
        <p className="text-sm text-gray-500 mb-4">
          Login/Create Account to manage orders
        </p>

        <IonButton expand="block" color="primary" onClick={onLoginClicked}>
          LOGIN
        </IonButton>

        <p className="text-xs text-gray-400 mt-3 px-2">
          By clicking in, I accept the{' '}
          <a href="#" className="underline">
            terms of service
          </a>{' '}
          &{' '}
          <a href="#" className="underline">
            privacy policy
          </a>
        </p>
      </div>

      {/* Offers and Feedback */}
      <div className="mt-4 mx-3 border border-gray-300 rounded-xl overflow-hidden">
        {/* Offers */}
        <IonItem button lines="none" className="my-1">
          <IonIcon className="me-3" slot="start" icon={chatboxEllipsesOutline} />
          <IonLabel>Offers</IonLabel>
        </IonItem>

        {/* Divider */}
        <div className="border-t border-gray-300 mx-4" />

        {/* Feedback */}
        <IonItem button lines="none" className="my-1">
          <IonIcon className="me-3" slot="start" icon={pricetagOutline} />
          <IonLabel>Feedback</IonLabel>
        </IonItem>
      </div>
    </div>
  );
};

export default AccountSection;
