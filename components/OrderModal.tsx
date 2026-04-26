

import React, { useState, useEffect } from 'react';
import {
  Modal,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { Order, OrderFormData } from '@/types/order';
import { suggestIcon } from '@/utils/iconSuggestion';
import { X } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';

interface OrderModalProps {
  visible: boolean;
  order?: Order;
  onClose: () => void;
  onSave: (order: Order) => void;
}

export function OrderModal({
  visible,
  order,
  onClose,
  onSave,
}: OrderModalProps) {
  const [formData, setFormData] = useState<OrderFormData>({
    name: '',
    quantity: '1',
    notes: '',
  });
  const [suggestedIcon, setSuggestedIcon] = useState('🛒');

  useEffect(() => {
    if (order) {
      setFormData({
        name: order.name,
        quantity: order.quantity.toString(),
        notes: order.notes || '',
      });
      setSuggestedIcon(order.icon);
    } else {
      setFormData({ name: '', quantity: '1', notes: '' });
      setSuggestedIcon('🛒');
    }
  }, [order, visible]);

  const handleNameChange = (text: string) => {
    setFormData({ ...formData, name: text });
    setSuggestedIcon(suggestIcon(text));
  };

  const handleSave = () => {
    if (!formData.name.trim()) return;
    const quantity = parseInt(formData.quantity) || 1;
    const newOrder: Order = order
      ? {
          ...order,
          name: formData.name.trim(),
          quantity,
          notes: formData.notes.trim(),
          icon: suggestedIcon,
          updatedAt: Date.now(),
        }
      : {
          id: Date.now().toString(),
          name: formData.name.trim(),
          quantity,
          notes: formData.notes.trim(),
          icon: suggestedIcon,
          isPurchased: false,
          createdAt: Date.now(),
          updatedAt: Date.now(),
        };
    onSave(newOrder);
    onClose();
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent
      onRequestClose={onClose}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.container}
      >
        <View style={styles.backdrop}>
          <View style={styles.modal}>
            <View style={styles.header}>
              <Text style={styles.title}>
                {order ? 'تعديل الطلب' : 'إضافة طلب جديد'}
              </Text>
              <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                <X size={24} color="#6b7280" />
              </TouchableOpacity>
            </View>
            <ScrollView style={styles.content}>
              <View style={styles.iconPreview}>
                <Text style={styles.iconLarge}>{suggestedIcon}</Text>
              </View>
              <View style={styles.field}>
                <Text style={styles.label}>اسم الطلب *</Text>
                <TextInput
                  style={styles.input}
                  value={formData.name}
                  onChangeText={handleNameChange}
                  placeholder="مثال: خبز، حليب، موبايل..."
                  placeholderTextColor="#9ca3af"
                />
              </View>
              <View style={styles.field}>
                <Text style={styles.label}>الكمية *</Text>
                <TextInput
                  style={styles.input}
                  value={formData.quantity}
                  onChangeText={(text) =>
                    setFormData({ ...formData, quantity: text })
                  }
                  placeholder="1"
                  keyboardType="numeric"
                  placeholderTextColor="#9ca3af"
                />
              </View>
              <View style={styles.field}>
                <Text style={styles.label}>ملاحظات (اختياري)</Text>
                <TextInput
                  style={[styles.input, styles.textArea]}
                  value={formData.notes}
                  onChangeText={(text) =>
                    setFormData({ ...formData, notes: text })
                  }
                  placeholder="أي ملاحظات إضافية... مثل اللون أو الحجم"
                  placeholderTextColor="#9ca3af"
                  multiline
                  numberOfLines={3}
                  textAlignVertical="top"
                />
              </View>
              <View style={styles.iconSuggestions}>
                <Text style={styles.label}>اقتراحات الأيقونات:</Text>
                <View style={styles.suggestionsRow}>
                  {['🍞', '🥛', '📱', '👕'].map((icon) => (
                    <TouchableOpacity key={icon} onPress={() => setSuggestedIcon(icon)}>
                      <Text style={styles.suggestionIcon}>{icon}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            </ScrollView>
            <View style={styles.footer}>
              <TouchableOpacity
                style={[
                  styles.button,
                  styles.saveButton,
                  !formData.name.trim() && styles.buttonDisabled,
                ]}
                onPress={handleSave}
                disabled={!formData.name.trim()}
              >
                <LinearGradient
                  colors={['#3b82f6', '#2563eb']}
                  style={styles.saveGradient}
                >
                  <Text style={styles.saveButtonText}>
                    {order ? 'حفظ التعديلات' : 'إضافة الطلب'}
                  </Text>
                </LinearGradient>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modal: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '90%',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  title: {
    fontSize: 22,
    color: '#111827',
    fontFamily: 'IBMPlexSansArabic-Bold',
  },
  closeButton: {
    padding: 4,
  },
  content: {
    padding: 20,
  },
  iconPreview: {
    alignItems: 'center',
    marginBottom: 24,
  },
  iconLarge: {
    fontSize: 64,
  },
  field: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    color: '#374151',
    marginBottom: 8,
    fontFamily: 'IBMPlexSansArabic-Regular',
  },
  input: {
    backgroundColor: '#f9fafb', // رمادي فاتح مريح
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 12,
    padding: 14,
    fontSize: 16,
    color: '#111827',
    fontFamily: 'IBMPlexSansArabic-Regular',
  },
  textArea: {
    minHeight: 80,
  },
  footer: {
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
  },
  button: {
    borderRadius: 12,
    alignItems: 'center',
  },
  saveButton: {
    overflow: 'hidden',
  },
  saveGradient: {
    width: '100%',
    padding: 16,
    alignItems: 'center',
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    fontFamily: 'IBMPlexSansArabic-Bold',
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  iconSuggestions: {
    marginTop: 16,
  },
  suggestionsRow: {
    flexDirection: 'row',
    gap: 16,
    justifyContent: 'center',
  },
  suggestionIcon: {
    fontSize: 32,
    padding: 8,
    backgroundColor: '#f3f4f6',
    borderRadius: 12,
  },
});