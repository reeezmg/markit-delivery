import React, { useEffect, useState } from "react";
import {
    IonPage,
    IonHeader,
    IonToolbar,
    IonTitle,
    IonContent,
    IonCard,
    IonCardContent,
    IonIcon,
    IonLabel,
    IonButtons,
    IonBackButton,
    IonSpinner,
} from "@ionic/react";
import { lockClosedOutline, walletOutline } from "ionicons/icons";
import { api } from "../../services/api";
import "./IncentiveDetailsPage.css";
import { getDeviceTimeZone } from "../../utils/timezone";

type Milestone = {
    target: number;
    reward: number;
    achieved: boolean;
};

type IncentiveSummary = {
    daily: {
        count: number;
        earned: number;
        milestones: Milestone[];
    };
    weekly: {
        count: number;
        bonus: number;
        milestones: Milestone[];
    };
};

const IncentiveDetailsPage: React.FC = () => {
    const [loading, setLoading] = useState(true);
    const [summary, setSummary] = useState<IncentiveSummary>({
        daily: { count: 0, earned: 0, milestones: [] },
        weekly: { count: 0, bonus: 0, milestones: [] },
    });

    useEffect(() => {
        let mounted = true;
        setLoading(true);
        const tz = getDeviceTimeZone();
        api.get<IncentiveSummary>(`/partner/earnings/incentives?tz=${encodeURIComponent(tz)}`)
            .then((data) => {
                if (mounted) setSummary(data);
            })
            .catch((err) => console.error("Failed to load incentives:", err))
            .finally(() => {
                if (mounted) setLoading(false);
            });
        return () => { mounted = false; };
    }, []);

    return (
        <IonPage>
            <IonHeader>
                <IonToolbar color="primary">
                    <IonButtons slot="start">
                        <IonBackButton defaultHref="/HomePage" />
                    </IonButtons>
                    <IonTitle className="incentive-details-header">Incentive Details</IonTitle>
                </IonToolbar>
            </IonHeader>
            <IonContent className="ion-padding" style={{ background: "#f8f8f8" }}>
                <IonCard className="incentive-card">
                    <IonCardContent className="incentive-content-wrapper">
                        <div className="header-section">
                            <h2>Daily Milestone</h2>
                            <p>12:00am - 11:59pm</p>
                        </div>

                        {loading ? (
                            <div style={{ display: "flex", justifyContent: "center", padding: "12px 0" }}>
                                <IonSpinner name="crescent" color="primary" />
                            </div>
                        ) : (
                            <>
                                <div className="stats-row">
                                    <div className="stat">
                                        <div>
                                            <IonIcon icon={walletOutline} color="primary" />
                                            <strong>{summary.daily.count}</strong>
                                        </div>
                                        <p>touchpoints</p>
                                    </div>

                                    <div className="stat">
                                        <strong>Rs {summary.daily.earned}</strong>
                                        <p>milestone pay</p>
                                    </div>
                                </div>

                                <div className="milestone-section">
                                    <div className="milestone-labels">
                                        <IonLabel>Milestone Pay</IonLabel>
                                        {summary.daily.milestones.map((m, i) => (
                                            <span key={i}>Rs {m.reward}</span>
                                        ))}
                                    </div>

                                    <div className="milestone-line">
                                        {summary.daily.milestones.map((m, i) => (
                                            <div key={i} className={`milestone-lock ${m.achieved ? "milestone-unlocked" : ""}`}>
                                                <IonIcon icon={lockClosedOutline} />
                                            </div>
                                        ))}
                                    </div>

                                    <div className="milestone-labels touchpoints">
                                        <IonLabel className="touch-points-label">
                                            <IonIcon icon={walletOutline} color="primary" className="label-icon" />
                                            Touchpoints
                                        </IonLabel>

                                        {summary.daily.milestones.map((m, i) => (
                                            <span key={i}>{m.target}</span>
                                        ))}
                                    </div>
                                </div>
                            </>
                        )}
                    </IonCardContent>
                </IonCard>

                <IonCard className="incentive-card">
                    <IonCardContent className="incentive-content-wrapper">
                        <div className="header-section">
                            <h2>Weekly Bonus</h2>
                            <p>Mon - Sun</p>
                        </div>

                        {loading ? (
                            <div style={{ display: "flex", justifyContent: "center", padding: "12px 0" }}>
                                <IonSpinner name="crescent" color="primary" />
                            </div>
                        ) : (
                            <>
                                <div className="stats-row">
                                    <div className="stat">
                                        <div>
                                            <IonIcon icon={walletOutline} color="primary" />
                                            <strong>{summary.weekly.count}</strong>
                                        </div>
                                        <p>orders this week</p>
                                    </div>

                                    <div className="stat">
                                        <strong>Rs {summary.weekly.bonus}</strong>
                                        <p>weekly bonus</p>
                                    </div>
                                </div>

                                <div className="milestone-section">
                                    <div className="milestone-labels">
                                        <IonLabel>Bonus Pay</IonLabel>
                                        {summary.weekly.milestones.map((m, i) => (
                                            <span key={i}>Rs {m.reward}</span>
                                        ))}
                                    </div>

                                    <div className="milestone-line">
                                        {summary.weekly.milestones.map((m, i) => (
                                            <div key={i} className={`milestone-lock ${m.achieved ? "milestone-unlocked" : ""}`}>
                                                <IonIcon icon={lockClosedOutline} />
                                            </div>
                                        ))}
                                    </div>

                                    <div className="milestone-labels touchpoints">
                                        <IonLabel className="touch-points-label">
                                            <IonIcon icon={walletOutline} color="primary" className="label-icon" />
                                            Orders
                                        </IonLabel>

                                        {summary.weekly.milestones.map((m, i) => (
                                            <span key={i}>{m.target}</span>
                                        ))}
                                    </div>
                                </div>
                            </>
                        )}
                    </IonCardContent>
                </IonCard>
            </IonContent>
        </IonPage>
    );
};

export default IncentiveDetailsPage;
