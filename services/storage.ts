import AsyncStorage from '@react-native-async-storage/async-storage';
import { Order } from '@/types/order';

const ORDERS_KEY = '@orders';

export const StorageService = {
  async getOrders(): Promise<Order[]> {
    try {
      const data = await AsyncStorage.getItem(ORDERS_KEY);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error('Error loading orders:', error);
      return [];
    }
  },

  async saveOrders(orders: Order[]): Promise<void> {
    try {
      await AsyncStorage.setItem(ORDERS_KEY, JSON.stringify(orders));
    } catch (error) {
      console.error('Error saving orders:', error);
    }
  },

  async addOrder(order: Order): Promise<void> {
    const orders = await this.getOrders();
    orders.push(order);
    await this.saveOrders(orders);
  },

  async updateOrder(updatedOrder: Order): Promise<void> {
    const orders = await this.getOrders();
    const index = orders.findIndex((o) => o.id === updatedOrder.id);
    if (index !== -1) {
      orders[index] = updatedOrder;
      await this.saveOrders(orders);
    }
  },

  async deleteOrder(orderId: string): Promise<void> {
    const orders = await this.getOrders();
    const filtered = orders.filter((o) => o.id !== orderId);
    await this.saveOrders(filtered);
  },

  // ✅ الحل هنا
  async clearOrders(): Promise<void> {
    try {
      await AsyncStorage.removeItem(ORDERS_KEY);
    } catch (error) {
      console.error('Error clearing orders:', error);
    }
  },
};