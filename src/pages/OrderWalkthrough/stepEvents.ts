import { api } from "../../services/api";

export type StepEventAction = "enter" | "complete";

export const postStepEvent = async (
  trynbuyId: string | undefined,
  step: string,
  action: StepEventAction,
  meta?: Record<string, any>,
  companyId?: string
) => {
  if (!trynbuyId) return;
  try {
    await api.post(`/orders/${trynbuyId}/step-event`, { step, action, meta, companyId });
  } catch {
    // non-blocking
  }
};
