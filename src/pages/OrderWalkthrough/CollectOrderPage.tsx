import React, { useEffect, useState } from "react";
import {
  IonPage,
  IonHeader,
  IonToolbar,
  IonButtons,
  IonMenuButton,
  IonTitle,
  IonContent,
  IonButton,
  IonIcon,
  useIonRouter,
} from "@ionic/react";
import { arrowBack, cameraOutline } from "ionicons/icons";
import "./CollectOrderPage.css";
import SlideToAction from "../../components/SlideToAction";
import { useHistory } from "react-router";

const items = [
  { id: 1, name: "Hot Carrot Halwa", price: 171.42, quantity: 3 },
  { id: 2, name: "Samosa", price: 309.5, quantity: 5 },
  { id: 3, name: "Paneer Butter Masala", price: 249.0, quantity: 2 },
  { id: 4, name: "Veg Biryani", price: 199.99, quantity: 4 },
  { id: 5, name: "Gulab Jamun", price: 89.5, quantity: 6 },
  { id: 6, name: "Masala Dosa", price: 120.75, quantity: 3 },
  { id: 7, name: "Chole Bhature", price: 180.25, quantity: 2 },
  { id: 8, name: "Tandoori Roti", price: 25.0, quantity: 10 },
  { id: 9, name: "Butter Naan", price: 35.0, quantity: 8 },
  { id: 10, name: "Mango Lassi", price: 90.0, quantity: 5 },
];

const CollectOrderPage: React.FC = () => {
  const [minutes, setMinutes] = useState(20);
  const [seconds, setSeconds] = useState(0);
  const [photo, setPhoto] = useState<string | null>(null);
  const router = useHistory(); // 👈 Ionic Router hook (better than useHistory)

  // ✅ Countdown timer
  useEffect(() => {
    const timer = setInterval(() => {
      if (seconds > 0) {
        setSeconds((s) => s - 1);
      } else if (minutes > 0) {
        setMinutes((m) => m - 1);
        setSeconds(59);
      }
    }, 1000);
    return () => clearInterval(timer);
  }, [minutes, seconds]);

  // ✅ Handle Android system / browser back button
  useEffect(() => {
    const handleBackButton = (ev: any) => {
      ev.preventDefault();
      router.push("/HomePage", "root"); // 👈 Go to HomePage directly
    };

    document.addEventListener("ionBackButton", handleBackButton);
    window.onpopstate = () => router.push("/HomePage", "root"); // 👈 Handles browser back too

    return () => {
      document.removeEventListener("ionBackButton", handleBackButton);
      window.onpopstate = null;
    };
  }, [router]);

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar className="collect-toolbar">
          <IonButtons slot="start">
            <IonMenuButton />
          </IonButtons>
          <IonTitle>Collect Order</IonTitle>
        </IonToolbar>
      </IonHeader>

      <IonContent fullscreen>
        <div className="collect-content">
          <div className="order-id">
            Order Id : <b>220108140641716</b>
          </div>

          <div className="otp-warning">This order requires an OTP</div>

          {/* Wait Timer Section */}
          <div className="timer-card">
            <div className="timer-header">
              <div>
                <b>Wait Timer</b>
                <div className="timer-time">
                  {minutes.toString().padStart(2, "0")}:
                  {seconds.toString().padStart(2, "0")}
                </div>
              </div>
              <div className="timer-note">
                You are now earning ₹1 for each min of waiting (upto 20 mins)
              </div>
            </div>

            <div className="food-ready">
              <div>
                <b>Please Wait!</b>
                <div>Food will be ready in</div>
              </div>
              <div className="food-time">
                <span>22</span>:<span>50</span>
              </div>
            </div>
          </div>

          {/* Delivery Section */}
          <div className="delivery-info-card">
            <div className="info-header">Delivery</div>
            <div className="info-address">
              <b>Delivery - Mangalore-Lakshmi</b>
              <p>
                flat 306, Divya mahal, karangalpady market road, Mallikatte, Kadri,
                Mangaluru, Karnataka 575002, India
              </p>
            </div>
          </div>

          {/* Items Section */}
          <div className="info-card">
            <div className="info-header">Items to Pickup</div>
            <table className="items-table">
              <thead>
                <tr>
                  <th>Item Name</th>
                  <th>Quantity</th>
                </tr>
              </thead>
              <tbody>
                {items.map((item) => (
                  <tr key={item.id}>
                    <td>
                      {item.name} - ₹{item.price}
                    </td>
                    <td>{item.quantity}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Upload Photo */}
          <div className="upload-card">
            <div className="info-header">Upload Photo</div>

            <div
              className="upload-box"
              onClick={() => document.getElementById("photoInput")?.click()}
            >
              <IonIcon icon={cameraOutline} className="upload-icon" />
              <p>{photo ? "Photo added ✅" : "Tap to add photo of the package"}</p>
              <input
                id="photoInput"
                type="file"
                accept="image/*"
                style={{ display: "none" }}
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) setPhoto(URL.createObjectURL(file));
                }}
              />
              {photo && <img src={photo} alt="Preview" className="photo-preview" />}
            </div>
          </div>
        </div>
      </IonContent>

      {/* Bottom Section */}
      <div className="pickup-info">
        <h2>Parika</h2>
        <p>Near Vijayabank, Marnamikatte, Mangalore</p>

        <SlideToAction
          text="Collected"
          color="var(--ion-color-success, #28a745)"
          onSlideComplete={() => router.push("/GoToDrop", "forward")}
        />
      </div>
    </IonPage>
  );
};

export default CollectOrderPage;
