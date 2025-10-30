import React, { createContext, useContext, useState, useEffect } from "react";
import { IonModal, IonButton, IonIcon } from "@ionic/react";
import { useIonRouter } from "@ionic/react";
import {
  closeCircleOutline,
  cashOutline,
  locationOutline,
} from "ionicons/icons";
import "./IncomingOrderPopup.css";

interface OrderDetails {
  type: string;
  from: string;
  to: string;
  earnings: number;
  multi: boolean;
  distance: number;
}

interface IncomingOrderPopupContextType {
  showPopup: (order: OrderDetails) => void;
  hidePopup: () => void;
}

const IncomingOrderPopupContext = createContext<IncomingOrderPopupContextType>({
  showPopup: () => { },
  hidePopup: () => { },
});

export const IncomingOrderPopupProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [visible, setVisible] = useState(false);
  const [order, setOrder] = useState<OrderDetails | null>(null);
  const [audio] = useState(new Audio("/sounds/incoming-order.mp3"));
  const router = useIonRouter();

  const showPopup = (orderData: OrderDetails) => {
    setOrder(orderData);
    setVisible(true);
    audio.loop = true;
    audio.volume = 1;
    audio.play().catch(() => { });
  };

  const hidePopup = () => {
    setVisible(false);
    setOrder(null);
    audio.pause();
    audio.currentTime = 0;
  };

  const handleAccept = () => {
    hidePopup();
    router.push("/GoToPickup", "forward"); // ✅ redirect to CollectOrder route
  };

  const handleReject = () => hidePopup();

  useEffect(() => {
    if (!visible) {
      audio.pause();
      audio.currentTime = 0;
    }
  }, [visible]);

  return (
    <IncomingOrderPopupContext.Provider value={{ showPopup, hidePopup }}>
      {children}

      <IonModal isOpen={visible} onDidDismiss={hidePopup} backdropDismiss={false}>
        {order && (
          <div className="incoming-popup">
            <div className="popup-header">
              <div className="order-type">{order.type}</div>
              <IonIcon icon={closeCircleOutline} className="close-icon" onClick={handleReject} />
            </div>

            <div className="popup-body">
              <div className="earnings-section">
                <IonIcon icon={cashOutline} className="cash-icon" />
                <div>
                  <div className="earnings-text">Earnings</div>
                  <div className="earnings-amount">₹{order.earnings.toFixed(2)}</div>

                  {order.multi && (
                    <div className="multi-box">
                      <b>Multi Order</b>
                    </div>
                  )}
                </div>
              </div>

              <div className="address-section">
                <div className="address-item">

                  <div>
                    <b> <IonIcon icon={locationOutline} className="location-icon" /> Pickup:</b>
                    <p>{order.from}</p>
                  </div>
                </div>
                <div className="address-item">

                  <div>
                    <b> <IonIcon icon={locationOutline} className="location-icon" /> Drop:</b>
                    <p>{order.to}</p>
                  </div>
                </div>
                <div className="address-item">

                  <div>
                    <b> <IonIcon icon={locationOutline} className="location-icon" /> Distance:</b>
                    <p>{order.distance} {order.distance > 1 ? "Kms" : "Km"} </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="popup-footer">
              <IonButton color="medium" onClick={handleReject} className="reject-btn">
                Reject
              </IonButton>
              <IonButton color="success" onClick={handleAccept} className="accept-btn">
                Accept
              </IonButton>
            </div>
          </div>
        )}
      </IonModal>
    </IncomingOrderPopupContext.Provider>
  );
};

export const useIncomingOrderPopup = () => useContext(IncomingOrderPopupContext);
