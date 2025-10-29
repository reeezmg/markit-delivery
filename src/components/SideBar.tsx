import React from 'react';
import {
    IonMenu,
    IonHeader,
    IonToolbar,
    IonTitle,
    IonContent,
    IonList,
    IonItem,
    IonMenuToggle,
    IonFooter,
    IonIcon,
    IonLabel,
} from '@ionic/react';
import {
    home,
    diamond,
    person,
    wallet,
    helpCircle,
    logOutOutline,
} from 'ionicons/icons';

interface SidebarProps {
    onLogout: () => void;
}

const menuItems = [
    // { title: 'Home', icon: home, path: '/HomePage' },
    { title: 'Earnings', icon: wallet, path: '/MyEarnings' },
    { title: 'Incentives', icon: diamond, path: '/IncentiveDetailsPage' },
    { title: 'Support', icon: helpCircle, path: '/HelpSupportPage' },
    { title: 'Profile', icon: person, path: '/ProfilePage' },

];

const Sidebar: React.FC<SidebarProps> = ({ onLogout }) => {
    return (
        <IonMenu side="start" color='primary' contentId="main-content" swipeGesture={false}>
            <IonHeader>
                <IonToolbar color="primary">
                    <IonTitle>Menu</IonTitle>
                </IonToolbar>
            </IonHeader>

            <IonContent>
                <IonList>
                    <IonMenuToggle autoHide={true}>
                        {menuItems.map((item, index) => (
                            <IonItem key={index} routerLink={item.path} routerDirection="root">
                                <IonIcon slot="start" icon={item.icon} style={{ marginRight: '12px' }} />
                                <IonLabel>{item.title}</IonLabel>
                            </IonItem>
                        ))}
                    </IonMenuToggle>
                </IonList>
            </IonContent>

            {/* ✅ Logout Section */}
            <IonFooter>
                <IonItem
                    button
                    onClick={onLogout}
                    color="danger"
                    lines="none"
                    detail={false}
                    style={{
                        borderTop: '1px solid rgba(255,255,255,0.2)',
                        backgroundColor: 'danger',
                        color: 'white',
                        fontWeight: 'bold',
                        justifyContent: 'center',
                    }}
                >
                    <IonIcon slot="start" icon={logOutOutline} style={{ marginRight: '10px' }} />
                    <IonLabel>Logout</IonLabel>
                </IonItem>
            </IonFooter>
        </IonMenu>
    );
};

export default Sidebar;
