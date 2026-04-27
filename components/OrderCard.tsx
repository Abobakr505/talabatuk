import React, { memo, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Animated,
} from 'react-native';
import { Order } from '@/types/order';
import { Check, Pencil, Trash2 } from 'lucide-react-native';
import { PanGestureHandler } from 'react-native-gesture-handler';
import * as Haptics from 'expo-haptics';

interface OrderCardProps {
  order: Order;
  onToggle: (id: string) => void;
  onEdit: (order: Order) => void;
  onDelete: (id: string) => void;
}

export const OrderCard = memo(function OrderCard({
  order,
  onToggle,
  onEdit,
  onDelete,
}: OrderCardProps) {

  const translateX = useRef(new Animated.Value(0)).current;

  // 📳 Haptic
  const triggerHaptic = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  // 👉 أثناء السحب
  const onGestureEvent = Animated.event(
    [{ nativeEvent: { translationX: translateX } }],
    { useNativeDriver: true }
  );

  // 👉 عند الإفلات
  const onHandlerStateChange = (event: any) => {
    if (event.nativeEvent.oldState === 4) { // END
      const dx = event.nativeEvent.translationX;

      if (dx > 120) {
        // 👉 يمين = إكمال
        triggerHaptic();
        onToggle(order.id);
      } else if (dx < -120) {
        // 👉 شمال = حذف
        triggerHaptic();
        onDelete(order.id);
      }

      // رجوع للمكان
      Animated.spring(translateX, {
        toValue: 0,
        useNativeDriver: true,
      }).start();
    }
  };

  return (
    <PanGestureHandler
      onGestureEvent={onGestureEvent}
      onHandlerStateChange={onHandlerStateChange}
    >
      <Animated.View
        style={[
          styles.card,
          order.isPurchased && styles.cardPurchased,
          { transform: [{ translateX }] },
        ]}
      >
        <TouchableOpacity
          style={styles.checkButton}
          onPress={() => {
            triggerHaptic();
            onToggle(order.id);
          }}
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
            onPress={() => {
              triggerHaptic();
              onEdit(order);
            }}
            disabled={order.isPurchased}
          >
            <Pencil
              size={20}
              color={order.isPurchased ? '#ccc' : '#666'}
            />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => {
              triggerHaptic();
              onDelete(order.id);
            }}
          >
            <Trash2 size={20} color="#ef4444" />
          </TouchableOpacity>
        </View>
      </Animated.View>
    </PanGestureHandler>
  );
}, (prev, next) => {
  return (
    prev.order.id === next.order.id &&
    prev.order.isPurchased === next.order.isPurchased &&
    prev.order.name === next.order.name &&
    prev.order.quantity === next.order.quantity &&
    prev.order.notes === next.order.notes
  );
});

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