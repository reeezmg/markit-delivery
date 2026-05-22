import React, { useState, useEffect, useRef } from "react";
import { IonModal, IonButton, IonIcon } from "@ionic/react";
import { useIonRouter } from "@ionic/react";
import {
  closeCircleOutline,
  cashOutline,
  locationOutline,
} from "ionicons/icons";
import { io } from "socket.io-client";
import { Preferences } from '@capacitor/preferences';
import "./IncomingOrderPopup.css";
import {
  IncomingOrderPopupContext,
  type OrderDetails,
} from "./IncomingOrderPopupContext";
import { getCurrentLocation, watchLocation } from "../utils/geolocation";
import {
  getActiveOrder,
  setActiveOrder,
  clearActiveOrder,
  setCurrentPage,
  setReturnStoreIndex,
} from "../pages/OrderWalkthrough/walkthroughSteps";

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || "http://localhost:3005";
const driverStatusDedup = new Map<string, number>();
const DRIVER_STATUS_DEDUP_WINDOW_MS = 2000;

export const IncomingOrderPopupProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [visible, setVisible] = useState(false);
  const [order, setOrder] = useState<OrderDetails | null>(null);
  const [cancelVisible, setCancelVisible] = useState(false);
  const [cancelOrder, setCancelOrder] = useState<any | null>(null);
  const [audio] = useState(new Audio("/sounds/incoming-order_.mp3"));
  const router = useIonRouter();
  const pendingRouteRef = useRef<string | null>(null);
  const socketRef = useRef<ReturnType<typeof io> | null>(null);
  const driverIdRef = useRef<string | null>(null);
  const lastLocationSentRef = useRef<number>(0);
  const watchCleanupRef = useRef<null | (() => Promise<void> | void)>(null);
  const isOnlineRef = useRef<boolean>(false);
  const isLiveRef = useRef<boolean>(false);
  const currentOrderRef = useRef<OrderDetails | null>(null);
  const lastDispatchKeyRef = useRef<string | null>(null);
  const autoRejectTimerRef = useRef<number | null>(null);
  const STATUS_RETRY_LIMIT = 3;
  const STATUS_RETRY_DELAY_MS = 2000;
  const STATUS_ACK_TIMEOUT_MS = 4000;
  const PENDING_ORDER_KEY = "pendingDispatchOrder";
  const PENDING_ORDER_TTL_MS = 45000;

  const clearAutoRejectTimer = () => {
    if (autoRejectTimerRef.current !== null) {
      window.clearTimeout(autoRejectTimerRef.current);
      autoRejectTimerRef.current = null;
    }
  };

  const scheduleAutoReject = (timeoutMs: number) => {
    clearAutoRejectTimer();
    if (!Number.isFinite(timeoutMs)) return;
    if (timeoutMs <= 0) {
      triggerAutoReject();
      return;
    }
    autoRejectTimerRef.current = window.setTimeout(() => {
      triggerAutoReject();
    }, timeoutMs);
  };

  const triggerAutoReject = () => {
    const currentOrder = currentOrderRef.current;
    if (!currentOrder) return;
    void clearPendingOrder();
    if (currentOrder.trynbuyId && currentOrder.attemptId && driverIdRef.current) {
      emitWithAck(
        "dispatch:reject",
        {
          trynbuyId: currentOrder.trynbuyId,
          attemptId: currentOrder.attemptId,
          driverId: driverIdRef.current,
          reason: "auto_timeout",
        },
        "dispatch:reject"
      );
    }
    hidePopup();
  };

  const persistPendingOrder = async (orderData: OrderDetails, expiresAtOverride?: number) => {
    try {
      const now = Date.now();
      const timeoutMs = Number(orderData.responseTimeoutMs ?? PENDING_ORDER_TTL_MS);
      const ttlMs = Number.isFinite(timeoutMs) ? timeoutMs : PENDING_ORDER_TTL_MS;
      const expiresAt = Number.isFinite(expiresAtOverride) ? expiresAtOverride : now + ttlMs;
      await Preferences.set({
        key: PENDING_ORDER_KEY,
        value: JSON.stringify({
          order: orderData,
          receivedAt: now,
          expiresAt,
        }),
      });
    } catch (error) {
      console.warn("[dispatch] failed to persist pending order", error);
    }
  };

  const clearPendingOrder = async () => {
    try {
      await Preferences.remove({ key: PENDING_ORDER_KEY });
    } catch (error) {
      console.warn("[dispatch] failed to clear pending order", error);
    }
  };

  const fetchCancellationInfo = async (trynbuyId: string): Promise<any | null> => {
    if (!trynbuyId) return null;
    try {
      const baseUrl = (import.meta.env.VITE_API_URL || "http://localhost:3005/api").replace(/\/+$/, "");
      const token = localStorage.getItem("CapacitorStorage.token") || "";
      const res = await fetch(`${baseUrl}/orders/${trynbuyId}/cancellation-info`, {
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
      });
      if (!res.ok) return null;
      return await res.json();
    } catch (error) {
      console.warn("[dispatch] fetchCancellationInfo failed", error);
      return null;
    }
  };

  // Seed cancel modal/route from a trynbuyCancelled-shaped payload. Reused by:
  //   1. The trynbuyCancelled socket handler
  //   2. App-start verification (active walkthrough order)
  //   3. dispatch:accept ack failure verification
  const seedCancellationRef = useRef<(payload: any) => Promise<void>>(async () => {});

  const restorePendingOrder = async (): Promise<{ order: OrderDetails; expiresAt: number } | null> => {
    try {
      const { value } = await Preferences.get({ key: PENDING_ORDER_KEY });
      if (!value) return null;
      const parsed = JSON.parse(value);
      const orderData = parsed?.order as OrderDetails | undefined;
      const expiresAt = Number(parsed?.expiresAt);
      if (!orderData || !Number.isFinite(expiresAt)) {
        await clearPendingOrder();
        return null;
      }
      if (Date.now() > expiresAt) {
        await clearPendingOrder();
        return null;
      }
      return { order: orderData, expiresAt };
    } catch (error) {
      console.warn("[dispatch] failed to restore pending order", error);
      return null;
    }
  };

  const emitWithAck = (
    event: string,
    payload: Record<string, any>,
    label: string,
    attempt = 1
  ): Promise<any> => {
    const socket = socketRef.current;
    if (!socket || !socket.connected) {
      console.warn(`[dispatch] ${label} failed: socket offline`, { attempt });
      if (attempt < STATUS_RETRY_LIMIT) {
        return new Promise((resolve) => {
          setTimeout(() => {
            emitWithAck(event, payload, label, attempt + 1).then(resolve);
          }, STATUS_RETRY_DELAY_MS);
        });
      }
      return Promise.resolve({ ok: false, error: "socket_offline" });
    }

    return new Promise((resolve) => {
      socket.timeout(STATUS_ACK_TIMEOUT_MS).emit(event, payload, (err: any, response: any) => {
        if (err || !response?.ok) {
          console.warn(`[dispatch] ${label} failed`, {
            attempt,
            error: err?.message || err,
            response,
          });
          if (attempt < STATUS_RETRY_LIMIT) {
            setTimeout(() => {
              emitWithAck(event, payload, label, attempt + 1).then(resolve);
            }, STATUS_RETRY_DELAY_MS);
            return;
          }
          resolve(response || { ok: false, error: err?.message || "ack_failed" });
          return;
        }
        resolve(response);
      });
    });
  };

  const emitDriverStatus = (isLive: boolean, source: string, extra?: { isDelivering?: number | boolean }) => {
    const driverId = driverIdRef.current;
    if (!driverId) return Promise.resolve({ ok: false, error: "missing_driver_id" });

    const isOnline = isOnlineRef.current ? 1 : 0;
    const isDelivering = extra?.isDelivering;
    const statusKey = `${driverId}:${isOnline}:${isLive ? 1 : 0}:${isDelivering === undefined ? "" : Number(isDelivering) ? 1 : 0}`;
    const now = Date.now();
    const lastSentAt = driverStatusDedup.get(statusKey) || 0;
    if (now - lastSentAt < DRIVER_STATUS_DEDUP_WINDOW_MS) {
      return Promise.resolve({ ok: true, deduped: true, source });
    }
    driverStatusDedup.set(statusKey, now);

    return emitWithAck(
      "driver:status",
      {
        driverId,
        isOnline,
        isLive: isLive ? 1 : 0,
        ...(isDelivering === undefined ? {} : { isDelivering: Number(isDelivering) ? 1 : 0 }),
      },
      "driver:status"
    );
  };
  // Connect to socket and listen for real orders from server
  useEffect(() => {
    const startSocket = async () => {
      const { value } = await Preferences.get({ key: 'deliveryPartner' });
      const partner = value ? JSON.parse(value) : null;
      const partnerId = partner?.id || partner?.partnerId || null;
      driverIdRef.current = partnerId;
      const readIsDelivering = () => {
        const parsed = getActiveOrder();
        return !!parsed && Object.keys(parsed).length > 0;
      };

      const readIsLive = async () => {
        try {
          const { value: liveValue } = await Preferences.get({ key: 'deliveryIsLive' });
          return liveValue !== 'false';
        } catch (error) {
          console.warn('[dispatch] failed to read deliveryIsLive', error);
          return true;
        }
      };

      const sendDriverStatus = (overrideLive?: boolean) => {
        const isLive = overrideLive ?? isLiveRef.current;
        return emitDriverStatus(isLive, "socket-connect");
      };

      const logDriverState = async (context: string, location?: { lat: number; lng: number }) => {
        const isOnline = socketRef.current?.connected ?? false;
        const isLive = await readIsLive();
        const isDelivering = readIsDelivering();
        void context;
        void isOnline;
        void isLive;
        void isDelivering;
        void location;
      };

      const socket = io(SOCKET_URL, { transports: ["websocket"] });
      socketRef.current = socket;

      // Verify any persisted ACTIVE walkthrough order against the server.
      // Goal: the driver MUST see the cancel modal — there is no path to
      // miss a cancellation. Used both on initial start and on every socket
      // (re)connect, since the driver could miss a trynbuyCancelled event
      // during a brief disconnect.
      const verifyActiveCancellation = async () => {
        try {
          const active = getActiveOrder();
          const activeTrynbuyId = active?.trynbuyId;
          const isCancellationOnly = !!active?.cancellationOnly;
          const persistedStatus = String(active?.order_status || "").toUpperCase();
          const isPickedCancelInProgress = !isCancellationOnly && persistedStatus === "CANCELLED";

          if (isCancellationOnly && getCurrentPage() !== "/DeliverySuccessPage") {
            // App was closed while the cancel modal was on screen (user never
            // tapped OK). Re-show the modal so the driver claims their fee.
            await seedCancellationRef.current(active);
          } else if (activeTrynbuyId && !isCancellationOnly && !isPickedCancelInProgress) {
            // Driver thinks the order is still live. Verify with the server in
            // case it was cancelled while we were offline.
            const info = await fetchCancellationInfo(activeTrynbuyId);
            if (info?.cancelled) {
              await seedCancellationRef.current(info);
            }
          }
          // isPickedCancelInProgress: user is already in the return-to-store
          // flow. Don't re-seed (would reset returnStoreIndex and reroute).
        } catch (err) {
          console.warn('[dispatch] active-order verify failed', err);
        }
      };

      await verifyActiveCancellation();

      // 2) Verify any persisted PENDING popup against the server. If the order
      //    was cancelled in the meantime, clear silently (driver never accepted,
      //    no fee/UI owed); otherwise replay the popup.
      const pendingOrder = await restorePendingOrder();
      if (pendingOrder && !readIsDelivering()) {
        const pendingTrynbuyId = pendingOrder.order?.trynbuyId;
        let cancelled = false;
        if (pendingTrynbuyId) {
          const info = await fetchCancellationInfo(pendingTrynbuyId);
          cancelled = !!info?.cancelled;
        }
        if (cancelled) {
          await clearPendingOrder();
        } else {
          showPopupRef.current(pendingOrder.order, {
            persist: false,
            expiresAt: pendingOrder.expiresAt,
          });
        }
      } else if (pendingOrder) {
        await clearPendingOrder();
      }

      socket.on("connect", async () => {
        isOnlineRef.current = true;
        if (partnerId) {
          socket.emit("joinDeliveryPartner", partnerId);
        }
        isLiveRef.current = await readIsLive();
        await sendDriverStatus(isLiveRef.current);
        await logDriverState("socket:connect");
        // Catch any trynbuyCancelled events we may have missed during a
        // disconnect: verify the active order's status with the server.
        await verifyActiveCancellation();
      });

      socket.on("connect_error", (error) => {
        console.warn("[dispatch] socket connect_error", error.message);
      });

      socket.on("disconnect", async () => {
        isOnlineRef.current = false;
        await logDriverState("socket:disconnect");
      });

      socket.on("dispatch:request", (orderData: OrderDetails) => {
        const dispatchKey = `${orderData.trynbuyId || ""}:${orderData.attemptId || ""}`;
        if (dispatchKey && lastDispatchKeyRef.current === dispatchKey) return;
        if (dispatchKey) lastDispatchKeyRef.current = dispatchKey;
        showPopupRef.current(orderData);
      });

      socket.on("newDeliveryOrder", (orderData: OrderDetails) => {
        const dispatchKey = `${orderData.trynbuyId || ""}:${orderData.attemptId || ""}`;
        if (dispatchKey && lastDispatchKeyRef.current === dispatchKey) return;
        if (dispatchKey) lastDispatchKeyRef.current = dispatchKey;
        showPopupRef.current(orderData);
      });

      socket.on("trynbuyCancelled", async (payload: any) => {
        const trynbuyId = payload?.trynbuyId;
        if (!trynbuyId) return;

        clearAutoRejectTimer();
        void clearPendingOrder();
        hidePopup();
        lastDispatchKeyRef.current = null;

        // Driver had a popup but never accepted — just dismiss it silently.
        // No cancellation UI/audio/active-order needed.
        if (payload.pendingDispatchOnly) return;

        await seedCancellationRef.current(payload);
      });

      if (partnerId) {
        try {
          const current = await getCurrentLocation({
            enableHighAccuracy: true,
            maximumAge: 10000,
            timeout: 10000,
          });
          const now = Date.now();
          lastLocationSentRef.current = now;
          socket.emit("driver:location", {
            driverId: partnerId,
            lat: current.coords.latitude,
            lng: current.coords.longitude,
            timestamp: now,
          });
        } catch (err) {
          console.warn('[dispatch] initial geolocation error', err);
        }

        try {
          const cleanup = await watchLocation(
            { enableHighAccuracy: true, maximumAge: 10000, timeout: 10000 },
            (pos) => {
              const now = Date.now();
              if (now - lastLocationSentRef.current < 15000) return;
              lastLocationSentRef.current = now;
              socket.emit("driver:location", {
                driverId: partnerId,
                lat: pos.coords.latitude,
                lng: pos.coords.longitude,
                timestamp: now,
              });
              logDriverState("driver:location", {
                lat: pos.coords.latitude,
                lng: pos.coords.longitude,
              });
            },
            (err) => {
              console.warn('[dispatch] geolocation error', err);
            }
          );
          watchCleanupRef.current = cleanup;
        } catch (err) {
          console.warn('[dispatch] geolocation unavailable or missing partnerId', {
            hasGeolocation: false,
            partnerId,
          });
        }
      } else {
        console.warn('[dispatch] geolocation unavailable or missing partnerId', {
          hasGeolocation: false,
          partnerId,
        });
      }
    };

    startSocket();

    return () => {
      void watchCleanupRef.current?.();
      watchCleanupRef.current = null;
      clearAutoRejectTimer();
      socketRef.current?.disconnect();
    };
  }, []);

  // Ref so the socket effect can always call the latest showPopup
  const showPopupRef = useRef<(order: OrderDetails, options?: { persist?: boolean; expiresAt?: number }) => void>(() => {});

  const showPopup = (orderData: OrderDetails, options?: { persist?: boolean; expiresAt?: number }) => {
    const timeoutMs = Number(orderData.responseTimeoutMs ?? PENDING_ORDER_TTL_MS);
    const ttlMs = Number.isFinite(timeoutMs) ? timeoutMs : PENDING_ORDER_TTL_MS;
    const expiresAt = Number.isFinite(options?.expiresAt)
      ? Number(options?.expiresAt)
      : Date.now() + ttlMs;
    scheduleAutoReject(expiresAt - Date.now());
    if (options?.persist !== false) {
      void persistPendingOrder(orderData, expiresAt);
    }
    currentOrderRef.current = orderData;
    setOrder(orderData);
    setVisible(true);
    audio.loop = true;
    audio.volume = 1;
    audio.play().catch(() => { });

    // If multi-store and stores not yet populated, fetch them from DB
    if (orderData.multi && (!Array.isArray(orderData.stores) || orderData.stores.length <= 1) && orderData.trynbuyId) {
      const baseUrl = (import.meta.env.VITE_API_URL || "http://localhost:3005/api").replace(/\/+$/, "");
      const token = localStorage.getItem("CapacitorStorage.token") || "";
      fetch(`${baseUrl}/orders/${orderData.trynbuyId}/stores`, {
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
      })
        .then((r) => (r.ok ? r.json() : Promise.reject("not ok")))
        .then((rows) => {
          if (Array.isArray(rows) && rows.length > 1) {
            const enriched: OrderDetails = {
              ...orderData,
              stores: rows.map((s: any) => ({
                storeId: s.storeId,
                storeName: s.storeName,
                storeAddress: s.storeAddress,
                storeLat: s.storeLat != null ? Number(s.storeLat) : undefined,
                storeLng: s.storeLng != null ? Number(s.storeLng) : undefined,
              })),
            };
            currentOrderRef.current = enriched;
            setOrder(enriched);
          }
        })
        .catch(() => {});
    }
  };

  // Keep ref current so the socket listener always has the latest version
  showPopupRef.current = showPopup;

  const seedCancellation = async (payload: any) => {
    const trynbuyId = payload?.trynbuyId;
    if (!trynbuyId) return;

    const current = getActiveOrder();
    const baseOrder = {
      ...current,
      ...payload,
      type: payload.type || current.type || "Try & Buy",
      trynbuyId,
      orderNumber: payload.orderNumber ?? current.orderNumber,
      deliveryFee: Number(payload.deliveryFee ?? payload.cancellationFee ?? 0),
      waitingFeeMax: 0,
      waitingMinutes: 0,
      returnedItems: Array.isArray(payload.returnedItems) ? payload.returnedItems : [],
      returnStores: Array.isArray(payload.returnStores) ? payload.returnStores : [],
    };

    await setActiveOrder(baseOrder);

    if (payload.pickedOrLater && Array.isArray(payload.returnStores) && payload.returnStores.length > 0) {
      setReturnStoreIndex(0);
      setCurrentPage("/TrynbuyReturnToStore");
      router.push("/TrynbuyReturnToStore", "forward");
      return;
    }

    setCancelOrder(baseOrder);
    setCancelVisible(true);
    audio.loop = true;
    audio.volume = 1;
    audio.play().catch(() => {});
  };

  seedCancellationRef.current = seedCancellation;

  const hidePopup = () => {
    setVisible(false);
    currentOrderRef.current = null;
    clearAutoRejectTimer();
    audio.pause();
    audio.currentTime = 0;
  };

  const markDriverAvailable = (trynbuyId?: string) => {
    const driverId = driverIdRef.current;
    if (!driverId) return Promise.resolve({ ok: false, error: "missing_driver_id" });
    return emitDriverStatus(isLiveRef.current, "dispatch:complete", { isDelivering: 0 })
      .then(() =>
        emitWithAck(
          "dispatch:complete",
          { trynbuyId, driverId },
          "dispatch:complete"
        )
      );
  };

  const setDriverLiveStatus = (next: boolean) => {
    isLiveRef.current = next;
    if (!socketRef.current?.connected) return;
    void emitDriverStatus(next, "toggle");
  };

  const handleAccept = async () => {
    // Cancel the auto-reject FIRST so a near-expiry timer can't fire while we
    // await setActiveOrder() below. Also null the currentOrderRef — if the
    // timer callback was already queued before clearTimeout could land, the
    // null guard inside triggerAutoReject bails out instead of emitting a
    // stale dispatch:reject (which then times out waiting for an ack the
    // server never sends because the accept already cleared its pending key).
    clearAutoRejectTimer();
    currentOrderRef.current = null;
    if (order) {
      await setActiveOrder(order);
    }
    void clearPendingOrder();
    if (order?.trynbuyId && order?.attemptId && driverIdRef.current) {
      const acceptAck = await emitWithAck(
        "dispatch:accept",
        {
          trynbuyId: order.trynbuyId,
          attemptId: order.attemptId,
          driverId: driverIdRef.current,
        },
        "dispatch:accept"
      );
      if (!acceptAck?.ok) {
        console.warn("[dispatch] accept rejected by server", acceptAck);
        // Race: cancellation may have landed at or just before the accept ack.
        // Verify with the server — if cancelled, show the cancel modal so the
        // driver knows what happened instead of a silent disappear.
        hidePopup();
        const info = await fetchCancellationInfo(order.trynbuyId);
        if (info?.cancelled) {
          await seedCancellationRef.current(info);
        } else {
          await clearActiveOrder();
        }
        return;
      }
    }

    // Fetch all store details from DB so multi-store walkthrough works
    if (order?.trynbuyId) {
      try {
        const baseUrl = (import.meta.env.VITE_API_URL || "http://localhost:3005/api").replace(/\/+$/, "");
        const token = localStorage.getItem("CapacitorStorage.token") || "";
        const res = await fetch(`${baseUrl}/orders/${order.trynbuyId}/stores`, {
          headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
        });
        if (res.ok) {
          const stores = await res.json();
          if (Array.isArray(stores) && stores.length > 0) {
            const enriched = {
              ...order,
              stores: stores.map((s: any) => ({
                storeId: s.storeId,
                storeName: s.storeName,
                storeAddress: s.storeAddress,
                storeLat: s.storeLat != null ? Number(s.storeLat) : undefined,
                storeLng: s.storeLng != null ? Number(s.storeLng) : undefined,
              })),
            };
            await setActiveOrder(enriched);
          }
        }
      } catch (err) {
        console.warn("[dispatch] failed to fetch stores — single-store fallback", err);
      }
    }

    pendingRouteRef.current = "/GoToPickup";
    hidePopup();
  };

  const handleDismiss = () => {
    setOrder(null);
    if (pendingRouteRef.current) {
      const route = pendingRouteRef.current;
      pendingRouteRef.current = null;
      router.push(route, "forward");
    }
  };

  const handleReject = () => {
    clearAutoRejectTimer();
    void clearPendingOrder();
    if (order?.trynbuyId && order?.attemptId && driverIdRef.current) {
      emitWithAck(
        "dispatch:reject",
        {
          trynbuyId: order.trynbuyId,
          attemptId: order.attemptId,
          driverId: driverIdRef.current,
          reason: "manual_reject",
        },
        "dispatch:reject"
      );
    }
    hidePopup();
  };

  const handleCancelOk = async () => {
    if (!cancelOrder?.trynbuyId) {
      setCancelVisible(false);
      return;
    }

    audio.pause();
    audio.currentTime = 0;
    setCancelVisible(false);
    await setActiveOrder({
      ...cancelOrder,
      deliveryFee: Number(cancelOrder.deliveryFee ?? cancelOrder.cancellationFee ?? 15),
      waitingFeeMax: 0,
      waitingMinutes: 0,
      cancellationOnly: true,
      type: cancelOrder.type || "Try & Buy",
    });
    setCurrentPage("/DeliverySuccessPage");
    router.push("/DeliverySuccessPage", "forward");
  };

  const cancelTitle = cancelOrder?.faultParty === "driver"
    ? "Order cancelled by admin"
    : cancelOrder?.faultParty === "store"
      ? "Store cancelled this order"
      : "Item is cancelled";

  const cancelSubtitle = cancelOrder?.faultParty === "driver"
    ? "This order was cancelled with driver responsibility. No cancellation earning was added."
    : cancelOrder?.faultParty === "store"
      ? `The order was cancelled because of a store issue. Rs ${Number(cancelOrder?.deliveryFee ?? cancelOrder?.cancellationFee ?? 0).toFixed(2)} earned.`
      : `The customer cancelled before pickup. Rs ${Number(cancelOrder?.deliveryFee ?? cancelOrder?.cancellationFee ?? 15).toFixed(2)} earned.`;


  return (
    <IncomingOrderPopupContext.Provider value={{ showPopup, hidePopup, markDriverAvailable, setDriverLiveStatus }}>
      {children}

      <IonModal isOpen={visible} onDidDismiss={handleDismiss} backdropDismiss={false}>
        {order && (
          <div className="incoming-popup">
            <div className="popup-header">
              <div className="order-type">
                {order.type}
                {order.orderNumber ? (
                  <div className="order-number">Order #{order.orderNumber}</div>
                ) : null}
              </div>
              <IonIcon icon={closeCircleOutline} className="close-icon" onClick={handleReject} />
            </div>

            <div className="popup-body">
              <div className="earnings-section">
                <IonIcon icon={cashOutline} className="cash-icon" />
                <div>
                  <div className="earnings-text">Estimated Earnings (worst case)</div>
                  {(() => {
                    // Worst case = all items returned: original shipping
                    // (forward×8 + backward×8) minus the ₹4/km return-route deduction
                    // applied in /checkout/trynbuy/complete → forward×8 + backward×4.
                    // Per-store dispatch uses one-way road distance, so forward ≈ backward = distance.
                    const km = Math.max(0, Number(order.distance) || 0);
                    const deliveryFeeEstimate = Math.round(km * 8 + km * 4);
                    const waitingFeeEstimate = 15;
                    return (
                      <>
                        <div className="earnings-line">
                          Estimated delivery fees: ₹{deliveryFeeEstimate}
                        </div>
                        <div className="earnings-line">
                          Waiting fees: ₹{waitingFeeEstimate}
                        </div>
                      </>
                    );
                  })()}

                  {order.multi && (
                    <div className="multi-box">
                      <b>Multi Order</b>
                    </div>
                  )}
                </div>
              </div>

              <div className="address-section">
                {/* Pickup stores */}
                {Array.isArray(order.stores) && order.stores.length > 1 ? (
                  order.stores.map((store, idx) => (
                    <div className="address-item" key={store.storeId ?? idx}>
                      <div>
                        <b>
                          <IonIcon icon={locationOutline} className="location-icon" />
                          {" "}Pickup {idx + 1}:
                        </b>
                        <p>{store.storeName}{store.storeAddress ? `, ${store.storeAddress}` : ""}</p>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="address-item">
                    <div>
                      <b> <IonIcon icon={locationOutline} className="location-icon" /> Pickup:</b>
                      <p>{order.from}</p>
                    </div>
                  </div>
                )}

                <div className="address-item">
                  <div>
                    <b> <IonIcon icon={locationOutline} className="location-icon" /> Drop:</b>
                    <p>{order.to}</p>
                  </div>
                </div>
                <div className="address-item">
                  <div>
                    <b> <IonIcon icon={locationOutline} className="location-icon" /> Distance:</b>
                    <p>{order.distance} {order.distance > 1 ? "Kms" : "Km"} </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="popup-footer">
              <IonButton color="medium" onClick={handleReject} className="reject-btn">
                Reject
              </IonButton>
              <IonButton color="success" onClick={handleAccept} className="accept-btn">
                Accept
              </IonButton>
            </div>
          </div>
        )}
      </IonModal>

      <IonModal isOpen={cancelVisible} backdropDismiss={false} className="incoming-order-modal">
        {cancelOrder && (
          <div className="incoming-popup cancel-popup">
            <div className="cancel-ring">
              <div className="cancel-ring-inner">!</div>
            </div>
            <div className="cancel-title">{cancelTitle}</div>
            <div className="cancel-subtitle">{cancelSubtitle}</div>
            <IonButton expand="block" color="success" className="cancel-ok-btn" onClick={handleCancelOk}>
              OK
            </IonButton>
          </div>
        )}
      </IonModal>
    </IncomingOrderPopupContext.Provider>
  );
};

export default IncomingOrderPopupProvider;
