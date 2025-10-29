import React, { createContext, useContext, useState } from "react";
import { IonModal, IonButton } from "@ionic/react";
import { useIonRouter } from "@ionic/react";
import "./IncomingOrderPopup.css"; // ✅ Rename your CSS file too

interface OrderDetails {
  type: string;
  from: string;
  to: string;
  earnings: number;
  multi: boolean;
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
  const router = useIonRouter();

  const showPopup = (orderData: OrderDetails) => {
    setOrder(orderData);
    setVisible(true);

    // 🔊 Optional: Play ringtone
    const audio = new Audio("/sounds/incoming-order.mp3");
    audio.play().catch(() => { });
  };

  const hidePopup = () => {
    setVisible(false);
    setOrder(null);
  };

  const handleAccept = () => {
    hidePopup();
    router.push("/GoToPickup", "forward"); // ✅ redirect to collect order page
  };

  const handleReject = () => {
    hidePopup();
  };

  return (
    <IncomingOrderPopupContext.Provider value={{ showPopup, hidePopup }}>
      {children}

      <IonModal isOpen={visible} onDidDismiss={hidePopup} backdropDismiss={false}>
        <div className="incoming-order-popup">
          {order && (
            <>
              <h2>🚚 {order.type}</h2>
              <p><strong>From:</strong> {order.from}</p>
              <p><strong>To:</strong> {order.to}</p>
              <p><strong>Earnings:</strong> ₹{order.earnings}</p>
              <p><strong>Multi Order:</strong> {order.multi ? "Yes" : "No"}</p>

              <div className="popup-actions">
                <IonButton color="success" expand="block" onClick={handleAccept}>
                  Accept Order
                </IonButton>
                <IonButton color="medium" expand="block" onClick={handleReject}>
                  Reject
                </IonButton>
              </div>
            </>
          )}
        </div>
      </IonModal>
    </IncomingOrderPopupContext.Provider>
  );
};

export const useIncomingOrderPopup = () => useContext(IncomingOrderPopupContext);
