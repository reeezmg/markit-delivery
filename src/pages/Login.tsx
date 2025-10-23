import React, { useState } from 'react';
import {
  IonPage,
  IonContent,
  IonIcon,
  IonImg
} from '@ionic/react';
import { arrowBackOutline } from 'ionicons/icons';
import { useHistory } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';

import Login from '../components/Login/Login';
import Phone from '../components/Login/Phone';
import Otp from '../components/Login/Otp';

import { login, generateOtp } from '../api/auth';


const LoginPage = () => {
  const history = useHistory();

  const [phoneNumber, setPhoneNumber] = useState('');
  const [otp, setOtp] = useState('');
  const [showPhone, setShowPhone] = useState(false);
  const [showOtp, setShowOtp] = useState(false);

  // Handle phone number submission
  const handlePhoneSubmitClicked = async (data) => {
    const { phone } = data;
    setPhoneNumber(phone);
    setShowOtp(true);
    try {
      await generateOtp(phone);
    } catch (err) {
      console.error('Login error:', err);
    }
  };

  // Handle OTP submission
  const handleOtpSubmitClicked = async (data) => {
    const { otp } = data;
    setOtp(otp);
    try {
      await login(phoneNumber, otp);

      history.push('/');
    } catch (err) {
      console.error('Login error:', err);
    }
  };

  return (
    <IonPage>
      <IonContent scrollEvents>
        {/* Header */}
        <div className="bg-[#097D4C] text-white pt-5 pb-6 h-1/3">
          {/* Back Icon */}
          <div className="flex items-center px-3">
            <IonIcon icon={arrowBackOutline} className="text-2xl" />
          </div>

          {/* Logo & Text */}
          <div className="text-center mt-10">
            <IonImg src="/images/logo.png" className="w-20 h-20 mx-auto" />
            <div className="text-lg font-semibold mt-3 px-4">
              One app for your local fashion store
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="ion-padding">
          <Login onLoginClicked={() => setShowPhone(true)} />

          <AnimatePresence>
            {showPhone && (
              <motion.div
                initial={{ y: '100%', opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: '100%', opacity: 0 }}
                transition={{ duration: 0.3 }}
              >
                <Phone onSubmitClicked={handlePhoneSubmitClicked} />
              </motion.div>
            )}
          </AnimatePresence>

          <AnimatePresence>
            {showOtp && (
              <motion.div
                initial={{ y: '100%', opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: '100%', opacity: 0 }}
                transition={{ duration: 0.3 }}
              >
                <Otp onSubmitClicked={handleOtpSubmitClicked} />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </IonContent>
    </IonPage>
  );
};

export default LoginPage;
