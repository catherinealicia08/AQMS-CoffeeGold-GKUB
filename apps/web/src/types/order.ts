export interface OrderItem {
  product_id: string;
  name: string;
  price: number;
  qty: number;
  customizations: string[];
}

export interface Order {
  id: string;
  user_id: string | null;
  user_name: string;
  queue_number?: number;
  items: OrderItem[];
  subtotal: number;
  service_charge: number;
  total: number;
  payment_method: string;
  status: string;
  created_at?: { toDate: () => Date } | null;
  completed_at?: { toDate: () => Date } | null;
}
