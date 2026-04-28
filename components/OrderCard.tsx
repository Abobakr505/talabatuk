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
  order, onToggle, onEdit, onDelete,
}: OrderCardProps) {

  const translateX = useRef(new Animated.Value(0)).current;

  const triggerHaptic = () => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

  const onGestureEvent = Animated.event(
    [{ nativeEvent: { translationX: translateX } }],
    { useNativeDriver: true }
  );

  const onHandlerStateChange = (event: any) => {
    if (event.nativeEvent.oldState === 4) {
      const dx = event.nativeEvent.translationX;
      if (dx > 120) { triggerHaptic(); onToggle(order.id); }
      else if (dx < -120) { triggerHaptic(); onDelete(order.id); }
      Animated.spring(translateX, { toValue: 0, useNativeDriver: true }).start();
    }
  };

  // ألوان التصنيف
  const categoryColors: Record<string, { bg: string; text: string }> = {
    'خضار':    { bg: '#E1F5EE', text: '#0F6E56' },
    'فاكهة':   { bg: '#FBEAF0', text: '#993556' },
    'لحوم':    { bg: '#FAECE7', text: '#993C1D' },
    'دواجن':   { bg: '#FAEEDA', text: '#854F0B' },
    'أسماك':   { bg: '#E6F1FB', text: '#185FA5' },
    'ألبان':   { bg: '#EAF3DE', text: '#3B6D11' },
    'مخبوزات': { bg: '#FAEEDA', text: '#854F0B' },
    'مشروبات': { bg: '#E6F1FB', text: '#185FA5' },
    'حبوب':    { bg: '#F1EFE8', text: '#5F5E5A' },
    'منظفات':  { bg: '#EEEDFE', text: '#534AB7' },
    'أخرى':    { bg: '#F1EFE8', text: '#5F5E5A' },
  };

  const catStyle = categoryColors[order.category ?? 'أخرى'] ?? categoryColors['أخرى'];

  return (
    <PanGestureHandler
      onGestureEvent={onGestureEvent}
      onHandlerStateChange={onHandlerStateChange}
    >
      <Animated.View style={[
        styles.card,
        order.isPurchased && styles.cardPurchased,
        { transform: [{ translateX }] },
      ]}>

        {/* ✅ زر التحقق */}
        <TouchableOpacity onPress={() => { triggerHaptic(); onToggle(order.id); }}>
          <View style={[styles.checkbox, order.isPurchased && styles.checkboxChecked]}>
            {order.isPurchased && <Check size={14} color="#fff" strokeWidth={3} />}
          </View>
        </TouchableOpacity>

        {/* ✅ الإيموجي */}
        <View style={[styles.iconBox, order.isPurchased && { opacity: 0.5 }]}>
          <Text style={styles.icon}>{order.icon}</Text>
        </View>

        {/* ✅ المحتوى */}
        <View style={[styles.content, order.isPurchased && { opacity: 0.5 }]}>
          <Text style={[styles.name, order.isPurchased && styles.textPurchased]}>
            {order.name}
          </Text>

          <View style={styles.tags}>
            <View style={styles.tagGray}>
              <Text style={styles.tagGrayText}>
                {order.notes?.replace('الوحدة: ', '') || 'حبة'} × {order.quantity}
              </Text>
            </View>

            {order.category && (
              <View style={[styles.tag, { backgroundColor: catStyle.bg }]}>
                <Text style={[styles.tagText, { color: catStyle.text }]}>
                  {order.category}
                </Text>
              </View>
            )}

            {order.notes && !order.notes.startsWith('الوحدة:') && (
              <Text style={styles.noteText} numberOfLines={1}>
                {order.notes}
              </Text>
            )}
          </View>
        </View>

        {/* ✅ الأزرار */}
        <View style={styles.actions}>
          <TouchableOpacity
            style={styles.editBtn}
            onPress={() => { triggerHaptic(); onEdit(order); }}
            disabled={order.isPurchased}
          >
            <Pencil size={16} color={order.isPurchased ? '#ccc' : '#6b7280'} />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.deleteBtn}
            onPress={() => { triggerHaptic(); onDelete(order.id); }}
          >
            <Trash2 size={16} color="#e24b4a" />
          </TouchableOpacity>
        </View>

      </Animated.View>
    </PanGestureHandler>
  );
}, (prev, next) =>
prev.order.id === next.order.id &&
prev.order.isPurchased === next.order.isPurchased &&
prev.order.name === next.order.name &&
prev.order.quantity === next.order.quantity &&
prev.order.notes === next.order.notes &&
prev.order.category === next.order.category &&
prev.order.icon === next.order.icon  // ✅ أضف هذا
);

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 14,
    marginBottom: 10,
    gap: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 2,
  },
  cardPurchased: {
    backgroundColor: '#f9fafb',
  },
  checkbox: {
    width: 30,
    height: 30,
    borderRadius: 15,
    borderWidth: 2,
    borderColor: '#d1d5db',
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxChecked: {
    backgroundColor: '#10b981',
    borderColor: '#10b981',
  },
  iconBox: {
    width: 38,
    height: 38,
    borderRadius: 10,
    backgroundColor: '#f3f4f6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  icon: {
    fontSize: 20,
  },
  content: {
    flex: 1,
    gap: 5,
  },
  name: {
    fontSize: 15,
    fontWeight: '600',
    color: '#111827',
    fontFamily: 'IBMPlexSansArabic-Medium',
  },
  textPurchased: {
    textDecorationLine: 'line-through',
    color: '#9ca3af',
  },
  tags: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 6,
  },
  tagGray: {
    backgroundColor: '#f3f4f6',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 20,
  },
  tagGrayText: {
    fontSize: 12,
    color: '#6b7280',
    fontFamily: 'IBMPlexSansArabic-Regular',
  },
  tag: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 20,
  },
  tagText: {
    fontSize: 12,
    fontFamily: 'IBMPlexSansArabic-Regular',
  },
  noteText: {
    fontSize: 12,
    color: '#9ca3af',
    fontFamily: 'IBMPlexSansArabic-Regular',
  },
  actions: {
    flexDirection: 'row',
    gap: 6,
  },
  editBtn: {
    width: 32,
    height: 32,
    borderRadius: 8,
    borderWidth: 0.5,
    borderColor: '#e5e7eb',
    alignItems: 'center',
    justifyContent: 'center',
  },
  deleteBtn: {
    width: 32,
    height: 32,
    borderRadius: 8,
    borderWidth: 0.5,
    borderColor: '#fca5a5',
    backgroundColor: '#fef2f2',
    alignItems: 'center',
    justifyContent: 'center',
  },
});