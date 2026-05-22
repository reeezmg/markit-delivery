import React from "react";
import { IonButton, IonIcon, IonModal } from "@ionic/react";
import { callOutline, closeOutline } from "ionicons/icons";
import "./OrderWalkthrough.css";

interface ContactCallModalProps {
  isOpen: boolean;
  name: string;
  phone: string;
  title: string;
  onDismiss: () => void;
}

const normalizePhoneHref = (phone: string) => {
  const trimmed = String(phone || "").trim();
  if (!trimmed) return "";
  const cleaned = trimmed.replace(/[^\d+]/g, "");
  return `tel:${cleaned}`;
};

const ContactCallModal: React.FC<ContactCallModalProps> = ({
  isOpen,
  name,
  phone,
  title,
  onDismiss,
}) => {
  const telHref = normalizePhoneHref(phone);

  return (
    <IonModal isOpen={isOpen} onDidDismiss={onDismiss} className="wt-contact-modal">
      <div className="wt-contact-shell">
        <div className="wt-contact-card">
          <div className="wt-contact-top">
            <div>
              <div className="wt-contact-title">{title}</div>
              <div className="wt-contact-name">{name || "Unknown"}</div>
            </div>
            <button type="button" className="wt-contact-close" onClick={onDismiss} aria-label="Close contact popup">
              <IonIcon icon={closeOutline} />
            </button>
          </div>

          <button
            type="button"
            className="wt-contact-number"
            onClick={() => {
              if (telHref) window.location.href = telHref;
            }}
            disabled={!telHref}
          >
            <IonIcon icon={callOutline} />
            <span>{phone || "Phone not available"}</span>
          </button>

          <IonButton
            expand="block"
            className="wt-contact-call-btn"
            disabled={!telHref}
            onClick={() => {
              if (telHref) window.location.href = telHref;
            }}
          >
            Call Now
          </IonButton>
        </div>
      </div>
    </IonModal>
  );
};

export default ContactCallModal;
