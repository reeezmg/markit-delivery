import React, { createContext, useContext } from "react";

export interface StoreInfo {
  storeId?: string;
  storeName?: string;
  storeAddress?: string;
  storeLat?: number;
  storeLng?: number;
}

export interface OrderDetails {
  type: string;
  from: string;
  to: string;
  earnings: number;
  multi: boolean;
  distance: number;
  orderNumber?: string | number;
  responseTimeoutMs?: number;
  trynbuyId?: string;
  attemptId?: string;
  deliveryFee?: number;
  waitingFeeMax?: number;
  waitingMinutes?: number;
  tips?: number;
  returnedItems?: { id?: number; name: string; size?: string; quantity: number }[];
  storeName?: string;
  storeAddress?: string;
  storeLat?: number;
  storeLng?: number;
  deliveryAddress?: string;
  stores?: StoreInfo[];
}

interface IncomingOrderPopupContextType {
  showPopup: (order: OrderDetails, options?: { persist?: boolean; expiresAt?: number }) => void;
  hidePopup: () => void;
  markDriverAvailable: (trynbuyId?: string) => Promise<any>;
  setDriverLiveStatus: (isLive: boolean) => void;
}

export const IncomingOrderPopupContext = createContext<IncomingOrderPopupContextType>({
  showPopup: () => {},
  hidePopup: () => {},
  markDriverAvailable: () => Promise.resolve({ ok: true }),
  setDriverLiveStatus: () => {},
});

export const useIncomingOrderPopup = () => useContext(IncomingOrderPopupContext);
