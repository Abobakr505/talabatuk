import React, { useState, useEffect } from 'react';
import {
  Modal, View, Text, TextInput, TouchableOpacity,
  StyleSheet, KeyboardAvoidingView, Platform, ScrollView,
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

const CATEGORIES = [
  { label: 'خضار',    emoji: '🥦', bg: '#E1F5EE', text: '#0F6E56' },
  { label: 'فاكهة',   emoji: '🍎', bg: '#FBEAF0', text: '#993556' },
  { label: 'لحوم',    emoji: '🥩', bg: '#FAECE7', text: '#993C1D' },
  { label: 'دواجن',   emoji: '🍗', bg: '#FAEEDA', text: '#854F0B' },
  { label: 'أسماك',   emoji: '🐟', bg: '#E6F1FB', text: '#185FA5' },
  { label: 'ألبان',   emoji: '🥛', bg: '#EAF3DE', text: '#3B6D11' },
  { label: 'مخبوزات', emoji: '🍞', bg: '#FAEEDA', text: '#854F0B' },
  { label: 'مشروبات', emoji: '🧃', bg: '#E6F1FB', text: '#185FA5' },
  { label: 'حبوب',    emoji: '🌾', bg: '#F1EFE8', text: '#5F5E5A' },
  { label: 'منظفات',  emoji: '🧹', bg: '#EEEDFE', text: '#534AB7' },
  { label: 'أخرى',    emoji: '🛒', bg: '#F1EFE8', text: '#5F5E5A' },
];

export function OrderModal({ visible, order, onClose, onSave }: OrderModalProps) {
  const [formData, setFormData] = useState<OrderFormData>({
    name: '', quantity: '1', notes: '',
  });
  const [suggestedIcon, setSuggestedIcon] = useState('🛒');
  const [selectedCategory, setSelectedCategory] = useState('أخرى');

  useEffect(() => {
    if (order) {
      setFormData({
        name: order.name,
        quantity: order.quantity.toString(),
        notes: order.notes || '',
      });
      setSuggestedIcon(order.icon);
      setSelectedCategory(order.category || 'أخرى');
    } else {
      setFormData({ name: '', quantity: '1', notes: '' });
      setSuggestedIcon('🛒');
      setSelectedCategory('أخرى');
    }
  }, [order, visible]);

  const handleNameChange = (text: string) => {
    setFormData({ ...formData, name: text });
    setSuggestedIcon(suggestIcon(text));
  };

  const handleCategorySelect = (cat: typeof CATEGORIES[0]) => {
    setSelectedCategory(cat.label);
    setSuggestedIcon(cat.emoji);
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
          category: selectedCategory,
          updatedAt: Date.now(),
        }
      : {
          id: Date.now().toString(),
          name: formData.name.trim(),
          quantity,
          notes: formData.notes.trim(),
          icon: suggestedIcon,
          category: selectedCategory,
          isPurchased: false,
          createdAt: Date.now(),
          updatedAt: Date.now(),
        };
    onSave(newOrder);
    onClose();
  };

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
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

            <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>

              <View style={styles.iconPreview}>
                <Text style={styles.iconLarge}>{suggestedIcon}</Text>
              </View>

              {/* ✅ اختيار الفئة */}
              <View style={styles.field}>
                <Text style={styles.label}>الفئة</Text>
                <View style={styles.categoriesGrid}>
                  {CATEGORIES.map((cat) => {
                    const isSelected = selectedCategory === cat.label;
                    return (
                      <TouchableOpacity
                        key={cat.label}
                        onPress={() => handleCategorySelect(cat)}
                        style={[
                          styles.categoryChip,
                          { backgroundColor: isSelected ? cat.bg : '#f3f4f6' },
                          isSelected && { borderColor: cat.text, borderWidth: 1.5 },
                        ]}
                      >
                        <Text style={styles.categoryEmoji}>{cat.emoji}</Text>
                        <Text style={[
                          styles.categoryLabel,
                          { color: isSelected ? cat.text : '#6b7280' },
                        ]}>
                          {cat.label}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              </View>

              <View style={styles.field}>
                <Text style={styles.label}>اسم الطلب *</Text>
                <TextInput
                  style={styles.input}
                  value={formData.name}
                  onChangeText={handleNameChange}
                  placeholder="مثال: خبز، حليب..."
                  placeholderTextColor="#9ca3af"
                />
              </View>

              <View style={styles.field}>
                <Text style={styles.label}>الكمية</Text>
                <TextInput
                  style={styles.input}
                  value={formData.quantity}
                  onChangeText={(text) => setFormData({ ...formData, quantity: text })}
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
                  onChangeText={(text) => setFormData({ ...formData, notes: text })}
                  placeholder="مثال: بدون سكر، حجم كبير..."
                  placeholderTextColor="#9ca3af"
                  multiline
                  numberOfLines={3}
                  textAlignVertical="top"
                />
              </View>

            </ScrollView>

            <View style={styles.footer}>
              <TouchableOpacity
                style={[styles.saveButton, !formData.name.trim() && styles.buttonDisabled]}
                onPress={handleSave}
                disabled={!formData.name.trim()}
              >
                <LinearGradient colors={['#3b82f6', '#2563eb']} style={styles.saveGradient}>
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
  container: { flex: 1 },
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modal: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '92%',
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
  closeButton: { padding: 4 },
  content: { padding: 20 },
  iconPreview: {
    alignItems: 'center',
    marginBottom: 20,
  },
  iconLarge: { fontSize: 64 },
  field: { marginBottom: 20 },
  label: {
    fontSize: 15,
    color: '#374151',
    marginBottom: 10,
    fontFamily: 'IBMPlexSansArabic-Medium',
  },

  // ✅ الفئات
  categoriesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  categoryChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  categoryEmoji: { fontSize: 14 },
  categoryLabel: {
    fontSize: 13,
    fontFamily: 'IBMPlexSansArabic-Regular',
  },

  input: {
    backgroundColor: '#f9fafb',
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 12,
    padding: 14,
    fontSize: 16,
    color: '#111827',
    fontFamily: 'IBMPlexSansArabic-Regular',
  },
  textArea: { minHeight: 80 },
  footer: {
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
  },
  saveButton: {
    borderRadius: 12,
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
    fontFamily: 'IBMPlexSansArabic-Bold',
  },
  buttonDisabled: { opacity: 0.5 },
});