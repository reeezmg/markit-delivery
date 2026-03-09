import React, { useState, useEffect, useRef } from "react";
import {
  IonPage,
  IonContent,
  IonImg,
  IonIcon,
  IonToast,
} from "@ionic/react";
import { arrowBackOutline } from "ionicons/icons";
import { useHistory } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";

import { generateOtp, login, signUp } from "../api/auth";
import "./LoginPage.css";

const LoginPage: React.FC = () => {
  const history = useHistory();

  const [mode, setMode] =
    useState<"start" | "loginPhone" | "signupPhone" | "otp">("start");

  const [phone, setPhone] = useState("");
  const [name, setName] = useState("");
  const [otp, setOtp] = useState("");
  const [fullPhone, setFullPhone] = useState("");

  const [toast, setToast] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  // OTP Timer
  const [counter, setCounter] = useState(0);
  const timerRef = useRef<any>(null);

  useEffect(() => {
    return () => timerRef.current && clearInterval(timerRef.current);
  }, []);

  const startTimer = () => {
    setCounter(60);
    timerRef.current = setInterval(() => {
      setCounter((x) => {
        if (x <= 1) {
          clearInterval(timerRef.current);
          return 0;
        }
        return x - 1;
      });
    }, 1000);
  };

  const normalize = (val: string) => val.replace(/\D/g, "").slice(0, 10);

  const requestOtp = async () => {
    if (phone.length !== 10) {
      return showToast("Enter 10-digit phone", "danger");
    }

    const formatted = "+91" + phone;
    setFullPhone(formatted);

    setLoading(true);

    try {
      const res = await generateOtp(formatted);

      // If server returns non-200, this will not run
      showToast("OTP Sent!", "success");
      setMode("otp");
      startTimer();
    } catch (err: any) {
      const code = err?.response?.data?.code;
      const message = err?.response?.data?.error;

      if (code === "ALREADY_EXISTS") {
        showToast("User already exists → Login instead", "warning");
        setMode("loginPhone");
        return;
      }

      showToast(message || "Something went wrong", "danger");
    } finally {
      setLoading(false);
    }
  };


  const [otpDigits, setOtpDigits] = useState(["", "", "", "", "", ""]);
  const otpRefs = useRef<Array<HTMLInputElement | null>>([]);

  const handleOtpChange = (e: React.ChangeEvent<HTMLInputElement>, index: number) => {
    const value = e.target.value.replace(/\D/g, "");
    if (!value) return;

    const newOtp = [...otpDigits];
    newOtp[index] = value;
    setOtpDigits(newOtp);

    // Move to next box
    if (index < 5) otpRefs.current[index + 1]?.focus();
  };

  const handleOtpKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, index: number) => {
    if (e.key === "Backspace") {
      const newOtp = [...otpDigits];
      if (newOtp[index] !== "") {
        newOtp[index] = "";
        setOtpDigits(newOtp);
      } else if (index > 0) {
        otpRefs.current[index - 1]?.focus();
      }
    }
  };

  const verifyOtp = async () => {
    const otp = otpDigits.join("");
    if (otp.length !== 6)
      return showToast("Enter valid OTP", "danger");

    setLoading(true);
    try {
      await login(fullPhone, otp);

      showToast("Login Successful", "success");

      if (mode === "otp" && name.trim()) {
        setTimeout(() => history.push("/signup-details"), 500);
      } else {
        setTimeout(() => history.push("/"), 500);
      }

    } catch (err: any) {
      const code = err?.response?.data?.code;
      if (code === "NOT_REGISTERED") {
        showToast("This number is not registered. Please sign up.", "warning");
        setTimeout(() => history.push("/SignUpDetailsPage"), 500);
      } else {
        showToast("Invalid OTP", "danger");
      }
    }
    setLoading(false);
  };

  const resendOtp = async () => {
    if (counter > 0) return;
    await generateOtp(fullPhone);
    showToast("OTP Resent!", "primary");
    startTimer();
  };

  const showToast = (msg: string, color: string = "primary") =>
    setToast({ msg, color });

  // ------------------ UI VIEWS ------------------

  const renderStart = () => (
    <div className="start-box">
      <button className="login-btn" onClick={() => setMode("loginPhone")}>
        Continue with Phone Number
      </button>
      {/* <div className="bottom-text">
        New user?
        <span className="link" onClick={() => history.push("/SignupDetailsPage")}>
          &nbsp;Sign Up
        </span>
      </div> */}
    </div>
  );

  const renderLoginPhone = () => (
    <div className="card">

      <label className="label-title">Enter Phone</label>

      <div className="phone-row">
        <span className="country-code">+91</span>
        <input
          className="input"
          value={phone}
          onChange={(e) => setPhone(normalize(e.target.value))}
          placeholder="9998887766"
          maxLength={10}
        />
      </div>

      <div className="actions">
        <button className="outline-btn" onClick={() => setMode("start")}>
          Back
        </button>

        <button
          className={`primary-btn ${phone.length === 10 ? "active" : ""}`}
          disabled={phone.length !== 10}
          onClick={() => requestOtp()}
        >
          Send OTP
        </button>
      </div>

      {/* <div className="new-user-text">
        New user?{" "}
        <span className="link" onClick={() => setMode("signupPhone")}>
          Sign Up
        </span>
      </div> */}
    </div>
  );

  const renderOtpScreen = () => (
    <div className="card otp-card">
      <label>Enter OTP sent to</label>
      <div className="otp-phone">{fullPhone}</div>

      {/* OTP Boxes */}
      <div className="otp-box-wrapper">
        {otpDigits.map((digit, index) => (
          <input
            key={index}
            ref={(el) => { otpRefs.current[index] = el; }}
            type="tel"
            maxLength={1}
            className="otp-box"
            value={digit}
            onChange={(e) => handleOtpChange(e as React.ChangeEvent<HTMLInputElement>, index)}
            onKeyDown={(e) => handleOtpKeyDown(e as React.KeyboardEvent<HTMLInputElement>, index)}
          />
        ))}
      </div>

      <div className="resend-row">
        <button
          className={`outline-btn small ${counter > 0 ? "disabled" : ""}`}
          onClick={resendOtp}
          disabled={counter > 0}
        >
          Resend
        </button>
        <span className="timer">
          {counter > 0 ? `${counter}s` : ""}
        </span>
      </div>

      <button className="login-btn" onClick={verifyOtp}>
        Verify OTP
      </button>
    </div>
  );


  // --------------- RENDER PAGE ---------------

  return (
    <IonPage>
      {/* HEADER */}
      <div className="header">
        {/* <div className="header-icon-row">
          <IonIcon icon={arrowBackOutline} className="back-icon" />
        </div> */}

        <div className="header-center">
          <IonImg src="/images/markit-banner.png" className="header-logo" />
          <p className="header-text">
            One app for your local fashion store
          </p>
        </div>
      </div>

      <IonContent className="page-body">
        <AnimatePresence mode="wait">
          <motion.div
            key={mode}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 15 }}
            transition={{ duration: 0.2 }}
          >
            {mode === "start" && renderStart()}
            {mode === "loginPhone" && renderLoginPhone()}
            {mode === "otp" && renderOtpScreen()}
          </motion.div>
        </AnimatePresence>

        <IonToast
          isOpen={toast !== null}
          message={toast?.msg}
          color={toast?.color}
          duration={1500}
          onDidDismiss={() => setToast(null)}
        />
      </IonContent>
    </IonPage>
  );
};

export default LoginPage;
