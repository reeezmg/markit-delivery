import React from 'react';
import {
  IonToolbar,
  IonButtons,
  IonMenuButton,
  IonTitle,
  IonIcon,
  IonButton
} from '@ionic/react';
import { notificationsOutline } from 'ionicons/icons';

interface TopbarProps {
  title: string;
}

const Topbar: React.FC<TopbarProps> = ({ title }) => {
  return (
  <IonToolbar >
  {/* Left: Menu button */}
  <IonButtons slot="start">
    <IonMenuButton />
  </IonButtons>

  {/* Center: Dynamic title */}
    <div className="text-lg w-full text-center font-semibold text-gray-900 z-10">{title}</div>

  {/* Right: Bell icon */}
  <IonButtons slot="end">
    <IonButton>
      <IonIcon icon={notificationsOutline} />
    </IonButton>
  </IonButtons>
</IonToolbar>

  );
};

export default Topbar;
