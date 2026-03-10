export const STANDARD_STEPS = ["Go to Pickup", "Collect", "Go to Drop", "Delivered"];

export const TRYNBUY_STEPS = [
  "Go to Pickup",
  "Collect",
  "Go to Customer",
  "Delivered",
  "Waiting",
  "Get Returns",
  "Back to Store",
  "Done",
];

export const getActiveOrder = (): Record<string, any> => {
  try {
    return JSON.parse(sessionStorage.getItem("activeOrder") || "{}");
  } catch {
    return {};
  }
};

export const getSteps = (orderType?: string): string[] =>
  orderType === "Try & Buy" ? TRYNBUY_STEPS : STANDARD_STEPS;

export const getAccentColor = (orderType?: string): string =>
  orderType === "Try & Buy" ? "#ea580c" : "#2563eb";

/** Save the current walkthrough page so HomePage can resume it */
export const setCurrentPage = (path: string | null): void => {
  if (path) {
    sessionStorage.setItem("currentWalkthroughPage", path);
  } else {
    sessionStorage.removeItem("currentWalkthroughPage");
  }
};

/** Read the last saved walkthrough page */
export const getCurrentPage = (): string | null =>
  sessionStorage.getItem("currentWalkthroughPage");
