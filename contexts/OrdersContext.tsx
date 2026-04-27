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
  deleteAllOrders: () => Promise<void>; // ✅ added
}

const OrdersContext = createContext<OrdersContextType | undefined>(undefined);

export function OrdersProvider({ children }: { children: React.ReactNode }) {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadOrders();
  }, []);

  const loadOrders = async () => {
    setLoading(true);
    const loadedOrders = await StorageService.getOrders();

    const sorted = loadedOrders.sort((a, b) => {
      if (a.isPurchased !== b.isPurchased) {
        return a.isPurchased ? 1 : -1;
      }
      return b.createdAt - a.createdAt;
    });

    setOrders(sorted);
    setLoading(false);
  };

  const addOrder = async (order: Order) => {
    await StorageService.addOrder(order);
    await loadOrders();
  };

  const updateOrder = async (order: Order) => {
    await StorageService.updateOrder(order);
    await loadOrders();
  };

  const deleteOrder = async (orderId: string) => {
    await StorageService.deleteOrder(orderId);
    await loadOrders();
  };

  const deleteAllOrders = async () => {
    try {
      // حذف من التخزين
      await StorageService.clearOrders();

      // تحديث فوري للواجهة
      setOrders([]);
    } catch (error) {
      console.log('Error deleting all orders:', error);
    }
  };

  const togglePurchased = async (orderId: string) => {
    const order = orders.find((o) => o.id === orderId);
    if (order) {
      const updated = {
        ...order,
        isPurchased: !order.isPurchased,
        updatedAt: Date.now(),
      };
      await updateOrder(updated);
    }
  };

  const remainingCount = orders.filter((o) => !o.isPurchased).length;
  const completedCount = orders.filter((o) => o.isPurchased).length;

  return (
    <OrdersContext.Provider
      value={{
        orders,
        loading,
        addOrder,
        updateOrder,
        deleteOrder,
        togglePurchased,
        remainingCount,
        completedCount,
        deleteAllOrders, // ✅ added
      }}
    >
      {children}
    </OrdersContext.Provider>
  );
}

export function useOrders() {
  const context = useContext(OrdersContext);
  if (!context) {
    throw new Error('useOrders must be used within OrdersProvider');
  }
  return context;
}

