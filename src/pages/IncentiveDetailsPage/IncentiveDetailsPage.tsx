import React from "react";
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
    IonLabel,
    IonBadge,
    IonButtons,
    IonBackButton
} from "@ionic/react";
import { lockClosedOutline, chevronDownOutline, walletOutline } from "ionicons/icons";
import "./IncentiveDetailsPage.css";

const IncentiveDetailsPage: React.FC = () => {
    const milestones = [
        { pay: 60, points: 14 },
        { pay: 110, points: 20 },
        { pay: 180, points: 26 },
        { pay: 275, points: 34 },
        { pay: 350, points: 42 },
    ];

    return (
        <IonPage>
            <IonHeader>
                <IonToolbar color="primary">
                    <IonButtons slot="start">
                        <IonBackButton defaultHref="/HomePage" />
                    </IonButtons>
                    <IonTitle>Incentive Details</IonTitle>
                </IonToolbar>
            </IonHeader>
            <IonContent className="ion-padding" style={{ background: "#f8f8f8" }}>
                <IonCard className="incentive-card">
                    <IonCardContent className="incentive-content-wrapper">
                        <div className="header-section">
                            <h2>Daily Milestone</h2>
                            <p>12am - 11:59pm</p>
                        </div>

                        <div className="stats-row">
                            <div className="stat">
                                <div>
                                    <IonIcon icon={walletOutline} color="primary" />
                                    <strong>0</strong>
                                </div>
                                <p>touchpoints</p>
                            </div>

                            <div className="stat">
                                <strong>₹0</strong>
                                <p>milestone pay</p>
                            </div>
                        </div>

                        <div className="milestone-section">
                            <div className="milestone-labels">
                                <IonLabel>Milestone Pay</IonLabel>
                                {milestones.map((m, i) => (
                                    <span key={i}>₹{m.pay}</span>
                                ))}
                            </div>

                            <div className="milestone-line">
                                {milestones.map((m, i) => (
                                    <div key={i} className="milestone-lock">
                                        <IonIcon icon={lockClosedOutline} />
                                    </div>
                                ))}
                            </div>

                            <div className="milestone-labels touchpoints">
                                <IonLabel className="touch-points-label">
                                    <IonIcon icon={walletOutline} color="primary" className="label-icon" />
                                    Touchpoints
                                </IonLabel>

                                {milestones.map((m, i) => (
                                    <span key={i}>{m.points}</span>
                                ))}
                            </div>
                        </div>

                        {/* <IonButton
                            fill="clear"
                            color="success"
                            className="see-rate-btn"
                            routerLink="/RateCardPage"
                        >
                            See rate card
                            <IonIcon icon={chevronDownOutline} slot="end" />
                        </IonButton> */}
                    </IonCardContent>
                </IonCard>

                {/* <div className="bottom-note">
                    <IonLabel>
                        Maximum disputes allowed per day:
                        <IonIcon icon={chevronDownOutline} />
                    </IonLabel>
                </div> */}
            </IonContent>

        </IonPage>
    );
};

export default IncentiveDetailsPage;
