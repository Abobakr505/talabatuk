export interface Order {
  id: string;
  name: string;
  quantity: number;
  notes?: string;
  isPurchased: boolean;
  icon: string;
  createdAt: number;
  updatedAt: number;
}

export interface OrderFormData {
  name: string;
  quantity: string;
  notes: string;
}
