

import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { Order } from '@/types/order';
import { Check, Pencil, Trash2 } from 'lucide-react-native';

interface OrderCardProps {
  order: Order;
  onToggle: () => void;
  onEdit: () => void;
  onDelete: () => void;
}

export function OrderCard({
  order,
  onToggle,
  onEdit,
  onDelete,
}: OrderCardProps) {
  return (
    <View
      style={[
        styles.card,
        order.isPurchased && styles.cardPurchased,
      ]}
    >
      <TouchableOpacity
        style={styles.checkButton}
        onPress={onToggle}
        activeOpacity={0.7}
      >
        <View
          style={[
            styles.checkbox,
            order.isPurchased && styles.checkboxChecked,
          ]}
        >
          {order.isPurchased && <Check size={16} color="#fff" />}
        </View>
      </TouchableOpacity>

      <View style={styles.content}>
        <View style={styles.header}>
          <Text style={styles.icon}>{order.icon}</Text>
          <Text
            style={[
              styles.name,
              order.isPurchased && styles.textPurchased,
            ]}
          >
            {order.name}
          </Text>
        </View>

        <View style={styles.details}>
          <Text
            style={[
              styles.quantity,
              order.isPurchased && styles.textPurchased,
            ]}
          >
            الكمية: {order.quantity}
          </Text>
          {order.notes && (
            <Text
              style={[
                styles.notes,
                order.isPurchased && styles.textPurchased,
              ]}
              numberOfLines={2}
            >
              {order.notes}
            </Text>
          )}
        </View>
      </View>

      <View style={styles.actions}>
        <TouchableOpacity
          style={styles.actionButton}
          onPress={onEdit}
          disabled={order.isPurchased}
        >
          <Pencil
            size={20}
            color={order.isPurchased ? '#ccc' : '#666'}
          />
        </TouchableOpacity>
        <TouchableOpacity style={styles.actionButton} onPress={onDelete}>
          <Trash2 size={20} color="#ef4444" />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  cardPurchased: {
    backgroundColor: '#f9fafb',
    opacity: 0.7,
  },
  checkButton: {
    marginRight: 12,
  },
  checkbox: {
    width: 28,
    height: 28,
    borderRadius: 14,
    borderWidth: 2,
    borderColor: '#d1d5db',
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxChecked: {
    backgroundColor: '#10b981',
    borderColor: '#10b981',
  },
  content: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  icon: {
    fontSize: 24,
    marginRight: 8,
  },
  name: {
    fontSize: 24,
    fontWeight: '600',
    color: '#111827',
    flex: 1,
    fontFamily: 'IBMPlexSansArabic-Medium',
  },
  details: {
    gap: 4,
  },
  quantity: {
    fontSize: 24,
    color: '#6b7280',
    fontFamily: 'IBMPlexSansArabic-Regular',
  },
  notes: {
    fontSize: 18,
    color: '#9ca3af',
    fontFamily: 'IBMPlexSansArabic-Regular',
  },
  textPurchased: {
    textDecorationLine: 'line-through',
    color: '#9ca3af',
  },
  actions: {
    flexDirection: 'row',
    gap: 8,
    marginLeft: 8,
  },
  actionButton: {
    padding: 8,
  },
});