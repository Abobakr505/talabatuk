// OrdersContext.tsx
import React, { createContext, useContext, useState, useEffect } from 'react';
import { Order } from '@/types/order';
import { StorageService } from '@/services/storage';

interface OrdersContextType {
  orders: Order[];
  loading: boolean;
  addOrder: (order: Order) => Promise<void>;
  updateOrder: (order: Order) => Promise<void>;
  deleteOrder: (orderId: string) => Promise<void>;
  togglePurchased: (orderId: string) => Promise<void>;
  remainingCount: number;
  completedCount: number;
  deleteAllOrders: () => Promise<void>;
}

const OrdersContext = createContext<OrdersContextType | undefined>(undefined);

const sortOrders = (orders: Order[]) =>
  [...orders].sort((a, b) => {
    if (a.isPurchased !== b.isPurchased) return a.isPurchased ? 1 : -1;
    return b.createdAt - a.createdAt;
  });

export function OrdersProvider({ children }: { children: React.ReactNode }) {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadOrders();
  }, []);

  const loadOrders = async () => {
    setLoading(true);
    const loadedOrders = await StorageService.getOrders();
    setOrders(sortOrders(loadedOrders));
    setLoading(false);
  };

  // ✅ تحديث فوري بدون loadOrders
  const addOrder = async (order: Order) => {
    const newOrder = { ...order, createdAt: order.createdAt ?? Date.now(), updatedAt: Date.now() };
    setOrders((prev) => sortOrders([newOrder, ...prev]));
    StorageService.addOrder(newOrder).catch(console.error);
  };

  const updateOrder = async (order: Order) => {
    const updated = { ...order, updatedAt: Date.now() };
    setOrders((prev) => sortOrders(prev.map((o) => o.id === order.id ? updated : o)));
    StorageService.updateOrder(updated).catch(console.error);
  };

  const deleteOrder = async (orderId: string) => {
    setOrders((prev) => prev.filter((o) => o.id !== orderId));
    StorageService.deleteOrder(orderId).catch(console.error);
  };

  const deleteAllOrders = async () => {
    setOrders([]);
    StorageService.clearOrders().catch(console.error);
  };

  const togglePurchased = async (orderId: string) => {
    const order = orders.find((o) => o.id === orderId);
    if (!order) return;
    const updated = { ...order, isPurchased: !order.isPurchased, updatedAt: Date.now() };
    setOrders((prev) => sortOrders(prev.map((o) => o.id === orderId ? updated : o)));
    StorageService.updateOrder(updated).catch(console.error);
  };

  const remainingCount = orders.filter((o) => !o.isPurchased).length;
  const completedCount = orders.filter((o) => o.isPurchased).length;

  return (
    <OrdersContext.Provider value={{
      orders, loading, addOrder, updateOrder,
      deleteOrder, togglePurchased, remainingCount,
      completedCount, deleteAllOrders,
    }}>
      {children}
    </OrdersContext.Provider>
  );
}

export function useOrders() {
  const context = useContext(OrdersContext);
  if (!context) throw new Error('useOrders must be used within OrdersProvider');
  return context;
}