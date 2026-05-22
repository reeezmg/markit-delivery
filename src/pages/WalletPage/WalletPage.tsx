import React, { useMemo, useState } from "react";
import {
    IonPage,
    IonHeader,
    IonToolbar,
    IonTitle,
    IonContent,
    IonCard,
    IonCardContent,
    IonIcon,
    IonList,
    IonItem,
    IonLabel,
    IonButtons,
    IonBackButton,
    IonButton,
    IonAlert,
    IonToast,
    useIonViewWillEnter,
} from "@ionic/react";
import {
    walletOutline,
    cashOutline,
    arrowDownOutline,
    arrowUpOutline,
} from "ionicons/icons";
import { api } from "../../services/api";
import "./WalletPage.css";
import { getDeviceTimeZone } from "../../utils/timezone";

type WalletTransaction = {
    id: string;
    amount: number;
    direction: "CREDIT" | "DEBIT";
    source?: string;
    note?: string;
    trynbuy_id?: string | null;
    createdAt?: string;
};

const WalletPage: React.FC = () => {
    const [cashInHand, setCashInHand] = useState(0);
    const [earnedThisWeek, setEarnedThisWeek] = useState(0);
    const [transactions, setTransactions] = useState<WalletTransaction[]>([]);
    const [loading, setLoading] = useState(true);
    const [showDeposit, setShowDeposit] = useState(false);
    const [toastMessage, setToastMessage] = useState("");
    const [toastColor, setToastColor] = useState<"success" | "danger">("success");

    const refreshWallet = async () => {
        setLoading(true);
        try {
            const tz = getDeviceTimeZone();
            const [walletRes, earningsRes] = await Promise.all([
                api.get<{ cashInHand: number; transactions: WalletTransaction[] }>("/partner/wallet"),
                api.get<{ total_earnings?: string | number }>(
                    `/partner/earnings/week?tz=${encodeURIComponent(tz)}`
                ),
            ]);

            setCashInHand(Number(walletRes.cashInHand || 0));
            setTransactions(walletRes.transactions || []);
            setEarnedThisWeek(Number(earningsRes.total_earnings || 0));
        } catch (err) {
            setToastColor("danger");
            setToastMessage("Failed to load wallet data");
        } finally {
            setLoading(false);
        }
    };

    useIonViewWillEnter(() => {
        refreshWallet();
    });

    const txLabel = useMemo(
        () => (tx: WalletTransaction) => {
            if (tx.note) return tx.note;
            if (tx.source === "COD") return "Cash Collected";
            if (tx.source === "DEPOSIT") return "Deposit";
            return tx.direction === "CREDIT" ? "Wallet Credit" : "Wallet Debit";
        },
        []
    );

    return (
        <IonPage>
            <IonHeader translucent>
                <IonToolbar color="primary">
                    <IonButtons slot="start">
                        <IonBackButton defaultHref="/ProfilePage" />
                    </IonButtons>
                    <IonTitle>Wallet</IonTitle>
                </IonToolbar>
            </IonHeader>

            <IonContent fullscreen className="wallet-content">
                {/* Summary Cards */}
                <div className="summary-grid">
                    <IonCard className="summary-card">
                        <IonCardContent>
                            <IonIcon icon={walletOutline} size="large" color="success" />
                            <h2>Rs {earnedThisWeek.toFixed(0)}</h2>
                            <p>Earned This Week</p>
                        </IonCardContent>
                    </IonCard>

                    <IonCard className="summary-card">
                        <IonCardContent>
                            <IonIcon icon={cashOutline} size="large" color="warning" />
                            <h2>Rs {cashInHand.toFixed(0)}</h2>
                            <p>Cash In Hand</p>
                        </IonCardContent>
                    </IonCard>
                </div>

                <div className="wallet-actions">
                    <IonButton
                        expand="block"
                        color="primary"
                        onClick={() => setShowDeposit(true)}
                    >
                        Deposit Cash
                    </IonButton>
                </div>

                {/* Transaction Section */}
                <div className="transaction-section">
                    <h3>Recent Transactions</h3>
                    <IonList className="custom-transaction-list">
                        {transactions.map((tx) => (
                            <IonItem key={tx.id} lines="full" className="transaction-item">
                                <IonIcon
                                    slot="start"
                                    icon={tx.direction === "CREDIT" ? arrowDownOutline : arrowUpOutline}
                                    color={tx.direction === "CREDIT" ? "success" : "danger"}
                                />
                                <IonLabel>
                                    <h2>{txLabel(tx)}</h2>
                                    <p>{tx.source || "Wallet"}</p>
                                </IonLabel>
                                <IonLabel
                                    slot="end"
                                    className={tx.direction === "CREDIT" ? "amount-credit" : "amount-debit"}
                                >
                                    <span
                                        className="amount-symbol"
                                        style={{
                                            color:
                                                tx.direction === "CREDIT"
                                                    ? "var(--ion-color-success)"
                                                    : "var(--ion-color-danger)",
                                        }}
                                    >
                                        {tx.direction === "CREDIT" ? "+" : "-"}
                                    </span>
                                    Rs {Number(tx.amount || 0).toFixed(0)}
                                </IonLabel>
                            </IonItem>
                        ))}
                        {!loading && transactions.length === 0 && (
                            <IonItem lines="none" className="transaction-item">
                                <IonLabel>No transactions yet</IonLabel>
                            </IonItem>
                        )}
                    </IonList>
                </div>

                <IonAlert
                    isOpen={showDeposit}
                    onDidDismiss={() => setShowDeposit(false)}
                    header="Deposit Cash"
                    inputs={[
                        {
                            name: "amount",
                            type: "number",
                            placeholder: "Amount",
                            min: 1,
                        },
                        {
                            name: "note",
                            type: "text",
                            placeholder: "Note (optional)",
                        },
                    ]}
                    buttons={[
                        { text: "Cancel", role: "cancel" },
                        {
                            text: "Deposit",
                            handler: async (data) => {
                                const amount = Number(data?.amount || 0);
                                if (!amount || amount <= 0) {
                                    setToastColor("danger");
                                    setToastMessage("Enter a valid amount");
                                    return false;
                                }

                                try {
                                    await api.post("/partner/wallet/deposit", {
                                        amount,
                                        note: data?.note || null,
                                    });
                                    setToastColor("success");
                                    setToastMessage("Deposit recorded");
                                    refreshWallet();
                                } catch (err) {
                                    setToastColor("danger");
                                    setToastMessage("Deposit failed");
                                }
                                return true;
                            },
                        },
                    ]}
                />

                <IonToast
                    isOpen={!!toastMessage}
                    message={toastMessage}
                    duration={1800}
                    color={toastColor}
                    onDidDismiss={() => setToastMessage("")}
                />
            </IonContent>
        </IonPage>
    );
};

export default WalletPage;
