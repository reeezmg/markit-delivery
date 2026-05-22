import store from "../../utils/storage";

export interface StoreStop {
  storeName?: string;
  storeAddress?: string;
  storeLat?: number;
  storeLng?: number;
  storeId?: string; // company UUID (kept for compat)
  companyId?: string; // explicit alias - same value as storeId
}

const ACTIVE_ORDER_KEY = "activeOrder";
const CURRENT_PAGE_KEY = "currentWalkthroughPage";
const PICKUP_INDEX_KEY = "pickupStoreIndex";
const RETURN_INDEX_KEY = "returnStoreIndex";

let activeOrderCache: Record<string, any> = {};
let currentPageCache: string | null = null;
let pickupStoreIndexCache = 0;
let returnStoreIndexCache = 0;
let storageHydrated = false;

const normalizeIndex = (value: unknown): number => {
  const parsed = Number.parseInt(String(value ?? "0"), 10);
  return Number.isFinite(parsed) && parsed >= 0 ? parsed : 0;
};

const cloneOrder = (order: Record<string, any> | null | undefined): Record<string, any> => {
  if (!order || typeof order !== "object") return {};
  return { ...order };
};

export const initWalkthroughStorage = async (): Promise<void> => {
  if (storageHydrated) return;

  const [storedOrder, storedPage, storedPickupIndex, storedReturnIndex] = await Promise.all([
    store.get(ACTIVE_ORDER_KEY),
    store.get(CURRENT_PAGE_KEY),
    store.get(PICKUP_INDEX_KEY),
    store.get(RETURN_INDEX_KEY),
  ]);

  activeOrderCache = cloneOrder(storedOrder as Record<string, any> | null | undefined);
  currentPageCache = typeof storedPage === "string" && storedPage.length > 0 ? storedPage : null;
  pickupStoreIndexCache = normalizeIndex(storedPickupIndex);
  returnStoreIndexCache = normalizeIndex(storedReturnIndex);
  storageHydrated = true;
};

export const getActiveOrder = (): Record<string, any> => activeOrderCache;

export const setActiveOrder = async (order: Record<string, any> | null | undefined): Promise<void> => {
  activeOrderCache = cloneOrder(order);
  await store.set(ACTIVE_ORDER_KEY, activeOrderCache);
};

export const clearActiveOrder = async (): Promise<void> => {
  activeOrderCache = {};
  await store.remove(ACTIVE_ORDER_KEY);
};

const normalizeStoreStop = (storeData: Record<string, any> | null | undefined): StoreStop => ({
  storeName: storeData?.storeName,
  storeAddress: storeData?.storeAddress,
  storeLat: storeData?.storeLat,
  storeLng: storeData?.storeLng,
  storeId: storeData?.storeId ?? storeData?.companyId,
  companyId: storeData?.companyId ?? storeData?.storeId,
});

const buildSingleStore = (order: Record<string, any>): StoreStop[] => [
  normalizeStoreStop({
    storeName: order.storeName,
    storeAddress: order.storeAddress,
    storeLat: order.storeLat,
    storeLng: order.storeLng,
    storeId: order.storeId,
    companyId: order.companyId,
  }),
];

export const getPickupStores = (): StoreStop[] => {
  const order = getActiveOrder();
  if (Array.isArray(order.stores) && order.stores.length > 0) {
    return order.stores.map((storeData: Record<string, any>) => normalizeStoreStop(storeData));
  }
  return buildSingleStore(order);
};

export const getReturnStores = (): StoreStop[] => {
  const order = getActiveOrder();
  if (Array.isArray(order.returnStores)) {
    return order.returnStores.map((storeData: Record<string, any>) => normalizeStoreStop(storeData));
  }
  return getPickupStores();
};

export const getPickupStoreIndex = (): number => pickupStoreIndexCache;

export const setPickupStoreIndex = (n: number): void => {
  pickupStoreIndexCache = normalizeIndex(n);
  void store.set(PICKUP_INDEX_KEY, pickupStoreIndexCache);
};

export const getReturnStoreIndex = (): number => returnStoreIndexCache;

export const setReturnStoreIndex = (n: number): void => {
  returnStoreIndexCache = normalizeIndex(n);
  void store.set(RETURN_INDEX_KEY, returnStoreIndexCache);
};

export const getCurrentPickupStore = (): StoreStop => {
  const stores = getPickupStores();
  return stores[getPickupStoreIndex()] ?? stores[0] ?? {};
};

export const getCurrentReturnStore = (): StoreStop => {
  const stores = getReturnStores();
  return stores[getReturnStoreIndex()] ?? stores[0] ?? {};
};

export const generateStandardSteps = (nPickup: number): string[] => {
  const steps: string[] = [];
  for (let i = 0; i < nPickup; i++) {
    const sfx = nPickup > 1 ? ` ${i + 1}` : "";
    steps.push(`Pickup${sfx}`, `Collect${sfx}`);
  }
  steps.push("Go to Drop", "Delivered");
  return steps;
};

export const generateTrynbuySteps = (nPickup: number, nReturn: number): string[] => {
  const steps: string[] = [];
  for (let i = 0; i < nPickup; i++) {
    const sfx = nPickup > 1 ? ` ${i + 1}` : "";
    steps.push(`Pickup${sfx}`, `Collect${sfx}`);
  }
  steps.push("Go to Customer", "Delivered", "Waiting", "Get Returns", "Payment");
  for (let j = 0; j < nReturn; j++) {
    const sfx = nReturn > 1 ? ` ${j + 1}` : "";
    steps.push(`Return to Store${sfx}`, `Submit${sfx}`);
  }
  return steps;
};

export const getSteps = (orderType?: string): string[] => {
  const order = getActiveOrder();
  const nPickup = (Array.isArray(order.stores) && order.stores.length > 0) ? order.stores.length : 1;
  if (orderType === "Try & Buy") {
    const nReturn = Array.isArray(order.returnStores)
      ? order.returnStores.length
      : nPickup;
    return generateTrynbuySteps(nPickup, nReturn);
  }
  return generateStandardSteps(nPickup);
};

export const getAccentColor = (orderType?: string): string =>
  orderType === "Try & Buy" ? "#ea580c" : "#2563eb";

export const setCurrentPage = (path: string | null): void => {
  if (path) {
    currentPageCache = path;
    void store.set(CURRENT_PAGE_KEY, path);
    return;
  }

  currentPageCache = null;
  pickupStoreIndexCache = 0;
  returnStoreIndexCache = 0;
  void Promise.all([
    store.remove(CURRENT_PAGE_KEY),
    store.remove(PICKUP_INDEX_KEY),
    store.remove(RETURN_INDEX_KEY),
  ]);
};

export const getCurrentPage = (): string | null => currentPageCache;

export const clearWalkthroughState = async (): Promise<void> => {
  activeOrderCache = {};
  currentPageCache = null;
  pickupStoreIndexCache = 0;
  returnStoreIndexCache = 0;
  await Promise.all([
    store.remove(ACTIVE_ORDER_KEY),
    store.remove(CURRENT_PAGE_KEY),
    store.remove(PICKUP_INDEX_KEY),
    store.remove(RETURN_INDEX_KEY),
  ]);
};

export const STANDARD_STEPS = generateStandardSteps(1);
export const TRYNBUY_STEPS = generateTrynbuySteps(1, 1);
