import React, { useState } from "react";
import {
  IonPage,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonButtons,
  IonBackButton,
  IonList,
  IonItem,
  IonLabel,
  IonSpinner,
  useIonViewWillEnter,
} from "@ionic/react";
import { api } from "../../services/api";
import { formatDate } from "../../utils/helper";
import "./PayoutsPage.css";

type PayoutTransaction = {
  id: string;
  amount: number;
  note?: string | null;
  status?: string;
  createdAt?: string;
};

const PayoutsPage: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [payouts, setPayouts] = useState<PayoutTransaction[]>([]);

  const fetchPayouts = async () => {
    setLoading(true);
    try {
      const data = await api.get<PayoutTransaction[]>("/partner/payouts");
      setPayouts(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("payouts error:", error);
      setPayouts([]);
    } finally {
      setLoading(false);
    }
  };

  useIonViewWillEnter(() => {
    fetchPayouts();
  });

  return (
    <IonPage className="payouts-page">
      <IonHeader translucent>
        <IonToolbar color="primary">
          <IonButtons slot="start">
            <IonBackButton defaultHref="/MyEarnings" />
          </IonButtons>
          <IonTitle>Payouts</IonTitle>
        </IonToolbar>
      </IonHeader>

      <IonContent fullscreen className="payouts-content">
        {loading && (
          <div className="payouts-loading">
            <IonSpinner name="crescent" />
            <span>Loading payouts...</span>
          </div>
        )}

        {!loading && (
          <IonList className="payouts-list">
            {payouts.map((payout) => (
              <IonItem key={payout.id} className="payout-item" lines="full">
                <IonLabel>
                  <h2>Rs {Number(payout.amount || 0).toFixed(0)}</h2>
                  <p>{payout.note || "Payout"}</p>
                  <p className={`payout-status ${String(payout.status || "PENDING").toLowerCase()}`}>
                    Status: {payout.status || "PENDING"}
                  </p>
                </IonLabel>
                <IonLabel slot="end" className="payout-date">
                  {payout.createdAt ? formatDate(payout.createdAt) : "-"}
                </IonLabel>
              </IonItem>
            ))}

            {payouts.length === 0 && (
              <IonItem lines="none" className="payout-item empty">
                <IonLabel>No payouts yet</IonLabel>
              </IonItem>
            )}
          </IonList>
        )}
      </IonContent>
    </IonPage>
  );
};

export default PayoutsPage;
