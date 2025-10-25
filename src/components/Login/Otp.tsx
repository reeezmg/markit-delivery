import React, { useState } from 'react';
import { IonButton, IonInputOtp } from '@ionic/react';

// Define the props type for this component
interface OtpVerificationProps {
  onSubmitClicked: (data: { otp: string }) => void;
}

const OtpVerification: React.FC<OtpVerificationProps> = ({ onSubmitClicked }) => {
  const [otp, setOtp] = useState<string>('');

  const submitPhoneNumber = () => {
    try {
      onSubmitClicked({ otp });
    } catch (err) {
      console.error('Submit error in OtpVerification:', err);
    }
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white rounded-t-xl p-4 shadow-lg z-50 h-2/3">
      <div className="max-w-md mx-auto">
        <div className="text-lg font-semibold">Verify</div>
        <div className="text-sm text-gray-500">Enter the OTP sent to your phone</div>
      </div>

      <div className="max-w-md mx-auto mt-4">
        {/* OTP Input */}
        <IonInputOtp
          value={otp}
          size="medium"
          length={6}
          onIonInput={(e) => setOtp(e.detail.value!)} // Non-null assertion because `value` is a string
        >
          Didn't get a code? <a href="#">Resend the code</a>
        </IonInputOtp>

        {/* Submit Button */}
        <IonButton expand="block" className="mt-6" onClick={submitPhoneNumber}>
          Submit
        </IonButton>
      </div>
    </div>
  );
};

export default OtpVerification;
