import React from "react";
import { IonButton, IonIcon } from "@ionic/react";
import { locateOutline } from "ionicons/icons";

interface MapLocateButtonProps {
  disabled?: boolean;
  onClick: () => void;
}

const MapLocateButton: React.FC<MapLocateButtonProps> = ({ disabled, onClick }) => {
  return (
    <IonButton
      className="wt-map-locate-btn"
      fill="solid"
      shape="round"
      size="small"
      disabled={disabled}
      onClick={onClick}
      aria-label="Zoom to my location"
    >
      <IonIcon icon={locateOutline} />
    </IonButton>
  );
};

export default MapLocateButton;
