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
} from "@ionic/react";
import {
    walletOutline,
    cashOutline,
    arrowDownOutline,
    arrowUpOutline,
} from "ionicons/icons";
import "./WalletPage.css";

const WalletPage: React.FC = () => {
    const transactions = [
        { id: 1, type: "COD", label: "Order Delivery", amount: 250, isCredit: true },
        { id: 2, type: "Debit", label: "Cash Withdrawal", amount: 100, isCredit: false },
        { id: 3, type: "COD", label: "Order Delivery", amount: 300, isCredit: true },
        { id: 4, type: "Debit", label: "Cash Withdrawal", amount: 150, isCredit: false },
        { id: 5, type: "COD", label: "Order Delivery", amount: 400, isCredit: true },
    ];

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
                            <h2>₹2,450</h2>
                            <p>Earned This Week</p>
                        </IonCardContent>
                    </IonCard>

                    <IonCard className="summary-card">
                        <IonCardContent>
                            <IonIcon icon={cashOutline} size="large" color="warning" />
                            <h2>₹1,200</h2>
                            <p>Cash In Hand</p>
                        </IonCardContent>
                    </IonCard>
                </div>

                {/* Transaction Section */}
                <div className="transaction-section">
                    <h3>Recent Transactions</h3>
                    <IonList className="custom-transaction-list">
                        {transactions.map((tx) => (
                            <IonItem key={tx.id} lines="full" className="transaction-item">
                                <IonIcon
                                    slot="start"
                                    icon={tx.isCredit ? arrowDownOutline : arrowUpOutline}
                                    color={tx.isCredit ? "success" : "danger"}
                                />
                                <IonLabel>
                                    <h2>{tx.label}</h2>
                                    <p>{tx.type}</p>
                                </IonLabel>
                                <IonLabel
                                    slot="end"
                                    className={tx.isCredit ? "amount-credit" : "amount-debit"}
                                >
                                    <span
                                        className="amount-symbol"
                                        style={{ color: tx.isCredit ? 'var(--ion-color-success)' : 'var(--ion-color-danger)' }}
                                    >
                                        {tx.isCredit ? "+" : "-"}
                                    </span>
                                    ₹{tx.amount}
                                </IonLabel>
                            </IonItem>
                        ))}
                    </IonList>
                </div>
            </IonContent>
        </IonPage>
    );
};

export default WalletPage;
