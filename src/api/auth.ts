import { Preferences } from '@capacitor/preferences';
import api from './client';

export const login = async (phone, otp) => {
  const res = await api.post("/auth/deliveryPartner/login", { phone, otp });
  const data = res.data;

  if (data.token) {
    await Preferences.set({ key: 'token', value: data.token });
    await Preferences.set({ key: 'deliveryPartner', value: JSON.stringify(data.deliveryPartner) });
  }    

};

export const logout = async () => {
  await Preferences.remove({ key: 'token' });
  await Preferences.remove({ key: 'deliveryPartner' }); 
};

export const generateOtp = async (phone) => {
  try {
    const res = await api.post("/auth/deliveryPartner/otp", { phone });
    return res.data;
  } catch (error) {
    console.error('Error generating OTP:', error);
    return error;
  }
};
