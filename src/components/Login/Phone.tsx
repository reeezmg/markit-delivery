import React, { useState, useMemo } from 'react';
import { Combobox } from '@headlessui/react';
import { IonInput, IonButton } from '@ionic/react';
import countryCodes from '../../assets/PhoneCode.json'; // adjust path if needed

// Define the structure of a country object
interface Country {
  name: string;
  dial_code: string;
  code: string;
}

// Define props for the component
interface LoginBottomSheetProps {
  onSubmitClicked: (data: { phone: string }) => void;
}

const LoginBottomSheet: React.FC<LoginBottomSheetProps> = ({ onSubmitClicked }) => {
  const [phoneNumber, setPhoneNumber] = useState<string>('');
  const [selectedCountry, setSelectedCountry] = useState<Country>(
    (countryCodes as Country[]).find((c) => c.dial_code === '+91') as Country
  );
  const [query, setQuery] = useState<string>('');

  // Filter countries dynamically
  const filteredCountries = useMemo(() => {
    if (!query) return countryCodes as Country[];
    return (countryCodes as Country[]).filter(
      (c) =>
        c.name.toLowerCase().includes(query.toLowerCase()) ||
        c.dial_code.includes(query)
    );
  }, [query]);

  // Handle submit
  const submitOtp = () => {
    try {
      onSubmitClicked({
        phone: `${selectedCountry.dial_code}${phoneNumber}`,
      });
    } catch (err) {
      console.error('Submit error in LoginBottomSheet:', err);
    }
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white rounded-t-xl p-4 shadow-lg z-50 h-2/3 ion-padding">
      <div className="max-w-md mx-auto">
        <div className="text-lg font-semibold">Login</div>
        <div className="text-sm text-gray-500">
          Enter your phone number to continue
        </div>
      </div>

      <div className="max-w-md mx-auto mt-4">
        {/* Unified Row */}
        <div className="flex items-center border border-gray-300 rounded-lg shadow-sm bg-white">
          {/* Country Code Combobox */}
          <Combobox value={selectedCountry} onChange={setSelectedCountry}>
            <div className="relative w-20">
              <Combobox.Input
                className="w-full px-3 py-2 border-r border-gray-300 outline-none"
                displayValue={(country: Country) => (country ? country.dial_code : '')}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="+91"
              />
              <Combobox.Options className="absolute z-50 mt-1 max-h-60 w-full overflow-auto rounded-md bg-white py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm">
                {filteredCountries.map((country: Country) => (
                  <Combobox.Option
                    key={country.code}
                    value={country}
                    className="cursor-pointer select-none px-4 py-2 hover:bg-gray-100"
                  >
                    {country.name} ({country.dial_code})
                  </Combobox.Option>
                ))}
              </Combobox.Options>
            </div>
          </Combobox>

          {/* Phone Number Input */}
          <IonInput
            type="tel"
            inputMode="tel"
            className="flex-1 mx-3"
            value={phoneNumber}
            onIonInput={(e) => setPhoneNumber(e.detail.value!)} // non-null assertion
          />
        </div>

        {/* Submit Button */}
        <IonButton expand="block" className="mt-6" onClick={submitOtp}>
          Submit
        </IonButton>
      </div>
    </div>
  );
};

export default LoginBottomSheet;
