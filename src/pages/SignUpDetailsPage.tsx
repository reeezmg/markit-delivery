import React, { useState } from "react";
import {
    IonPage,
    IonContent,
    IonButton,
    IonInput,
    IonItem,
    IonLabel,
    IonToast,
    IonSelect,
    IonSelectOption,
} from "@ionic/react";
import { useHistory } from "react-router-dom";
import "./SignupDetailsPage.css";
import UploadButton from "../components/UploadButton/UploadButton";
import axios from "axios";

const SignupDetailsPage = () => {
    const history = useHistory();

    const [form, setForm] = useState({
        name: "pet1",
        address: "mangalore",
        // vehicle: "",
        gender: "",
        dob: "",
        bloodGroup: "o+",
        ifsc: "3333",
        accountNo: "223333",
        bankName: "icici",
        upiId: "a2@sa",
        branch: "mlr",
    });

    const [docs, setDocs] = useState({
        adharnumber: "6789",
        panNumber: "gtr345",
        drivingLicenseDoc: null as File | null,
        aadhaarCardDocs: null as File | null,
        panCardDoc: null as File | null,
        profilePic: null as File | null,
    });

    const [toast, setToast] = useState<any>(null);

    const updateField = (key: string, value: string) => {
        setForm((prev) => ({ ...prev, [key]: value }));
    };

    const updateDocField = (key: string, file: File | null) => {
        setDocs((prev) => ({ ...prev, [key]: file }));
    };

    const submitDetails = async () => {
        const missingFields = Object.values(form).some((v) => !v);
        const missingDocs =
            !docs.drivingLicenseDoc ||
            !docs.aadhaarCardDocs ||
            !docs.panCardDoc ||
            !docs.profilePic ||
            !docs.adharnumber ||
            !docs.panNumber;

        if (missingFields || missingDocs) {
            setToast({ msg: "Please fill all fields & upload all documents", color: "danger" });
            return;
        }

        try {
            const formData = new FormData();

            // append normal fields
            Object.entries(form).forEach(([key, value]) => {
                formData.append(key, value);
            });

            // append file fields
            Object.entries(docs).forEach(([key, value]) => {
                if (value instanceof File) {
                    formData.append(key, value); // single file
                } else if (typeof value === "string") {
                    formData.append(key, value);
                }
            });

            const token = localStorage.getItem("dpToken");
            console.log(formData, 'fff');

            const response = await axios.put(
                `${import.meta.env.VITE_API_URL || 'http://localhost:3005/api'}/deliveryPartner/onboard-user`,
                formData,
                {
                    headers: {
                        "Content-Type": "multipart/form-data",
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            setToast({ msg: "Profile updated successfully!", color: "success" });

            setTimeout(() => {
                history.replace("/VerificationPendingScreen");
            }, 1200);

        } catch (err: any) {
            console.log(err);
            const msg = err?.response?.data?.error || "Something went wrong!";
            setToast({ msg, color: "danger" });
        }
    };


    return (
        <IonPage>
            <IonContent className="form-page">
                <h2 className="form-title">Complete Your Profile</h2>
                <div className="signup-container">

                    {/* PERSONAL DETAILS SECTION */}
                    <h3 className="section-title">Personal Details</h3>

                    <IonItem>
                        <IonLabel position="stacked">Full Name</IonLabel>
                        <IonInput
                            value={form.name}
                            onIonChange={(e) => updateField("name", e.detail.value!)}
                            placeholder="Enter full name"
                        />
                    </IonItem>

                    <IonItem>
                        <IonLabel position="stacked">address</IonLabel>
                        <IonInput
                            value={form.address}
                            onIonChange={(e) => updateField("address", e.detail.value!)}
                            placeholder="Enter address"
                        />
                    </IonItem>

                    {/* <IonItem>
                        <IonLabel position="stacked">Vehicle Type</IonLabel>
                        <IonInput
                            value={form.vehicle}
                            onIonChange={(e) => updateField("vehicle", e.detail.value!)}
                            placeholder="Bike / Cycle / Scooty"
                        />
                    </IonItem> */}

                    <IonItem>
                        <IonLabel position="stacked">Gender</IonLabel>
                        <IonSelect
                            value={form.gender}
                            onIonChange={(e) => updateField("gender", e.detail.value!)}
                        >
                            <IonSelectOption value="Male">Male</IonSelectOption>
                            <IonSelectOption value="Female">Female</IonSelectOption>
                            <IonSelectOption value="Other">Other</IonSelectOption>
                        </IonSelect>
                    </IonItem>

                    <IonItem>
                        <IonLabel position="stacked">Date of Birth</IonLabel>
                        <IonInput
                            type="date"
                            value={form.dob}
                            onIonChange={(e) => updateField("dob", e.detail.value!)}
                        />
                    </IonItem>

                    <IonItem>
                        <IonLabel position="stacked">Blood Group</IonLabel>
                        <IonInput
                            value={form.bloodGroup}
                            onIonChange={(e) => updateField("bloodGroup", e.detail.value!)}
                            placeholder="O+, B-, A+, etc"
                        />
                    </IonItem>

                    {/* BANK DETAILS SECTION */}
                    <h3 className="section-title">Bank Account Details</h3>

                    <IonItem>
                        <IonLabel position="stacked">Bank Name</IonLabel>
                        <IonInput
                            value={form.bankName}
                            onIonChange={(e) => updateField("bankName", e.detail.value!)}
                            placeholder="Bank name"
                        />
                    </IonItem>

                    <IonItem>
                        <IonLabel position="stacked">Account Number</IonLabel>
                        <IonInput
                            value={form.accountNo}
                            onIonChange={(e) => updateField("accountNo", e.detail.value!)}
                            placeholder="Enter account number"
                        />
                    </IonItem>

                    <IonItem>
                        <IonLabel position="stacked">IFSC Code</IonLabel>
                        <IonInput
                            value={form.ifsc}
                            onIonChange={(e) => updateField("ifsc", e.detail.value!)}
                            placeholder="Enter IFSC"
                        />
                    </IonItem>

                    <IonItem>
                        <IonLabel position="stacked">UPI ID</IonLabel>
                        <IonInput
                            value={form.upiId}
                            onIonChange={(e) => updateField("upiId", e.detail.value!)}
                            placeholder="yourupi@bank"
                        />
                    </IonItem>

                    <IonItem>
                        <IonLabel position="stacked">Bank Branch</IonLabel>
                        <IonInput
                            value={form.branch}
                            onIonChange={(e) => updateField("branch", e.detail.value!)}
                            placeholder="Branch name"
                        />
                    </IonItem>

                    {/* DOCUMENT UPLOAD SECTION */}
                    <h3 className="section-title">Upload Documents</h3>

                    <IonItem>
                        <IonLabel position="stacked">Aadhaar Number</IonLabel>
                        <IonInput
                            value={docs.adharnumber}
                            onIonChange={(e) => setDocs((p) => ({ ...p, adharnumber: e.detail.value! }))}
                            placeholder="Enter Aadhaar number"
                        />
                    </IonItem>

                    <IonItem>
                        <IonLabel position="stacked">PAN Number</IonLabel>
                        <IonInput
                            value={docs.panNumber}
                            onIonChange={(e) => setDocs((p) => ({ ...p, panNumber: e.detail.value! }))}
                            placeholder="Enter PAN number"
                        />
                    </IonItem>

                    <IonItem lines="none">
                        <UploadButton
                            label="Driving License"
                            id="dlUpload"
                            file={docs.drivingLicenseDoc}
                            onSelect={(file) => updateDocField("drivingLicenseDoc", file)}
                        />
                    </IonItem>

                    <IonItem lines="none">
                        <UploadButton
                            label="Aadhaar Card"
                            id="aadhaarUpload"
                            file={docs.aadhaarCardDocs}
                            onSelect={(file) => updateDocField("aadhaarCardDocs", file)}
                        />
                    </IonItem>

                    <IonItem lines="none">
                        <UploadButton
                            label="PAN Card"
                            id="panUpload"
                            file={docs.panCardDoc}
                            onSelect={(file) => updateDocField("panCardDoc", file)}
                        />
                    </IonItem>

                    <IonItem lines="none">
                        <UploadButton
                            label="Profile Picture"
                            id="profilePic"
                            file={docs.profilePic}
                            onSelect={(file) => updateDocField("profilePic", file)}
                        />
                    </IonItem>


                    <IonButton expand="block" className="submit-btn" onClick={submitDetails}>
                        Submit Details
                    </IonButton>

                    <IonToast
                        isOpen={toast !== null}
                        message={toast?.msg}
                        color={toast?.color}
                        duration={1500}
                        onDidDismiss={() => setToast(null)}
                    />
                </div>
            </IonContent>
        </IonPage>
    );
};

export default SignupDetailsPage;
