// ✅ Define the structure of an Order
export interface Order {
  id: string;
  orderNumber: string;
  from: string;
  to: string;
  earned: number;
  status: OrderStatus;
}

export enum OrderStatus {
  Completed = "completed",
  Pending = "pending",
  Cancelled = "cancelled"
}
