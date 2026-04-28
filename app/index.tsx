import React, { useState, useEffect, useRef, useCallback, startTransition } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  SafeAreaView,
  ActivityIndicator,
  Alert,
  Animated,
  StyleSheet,
} from 'react-native';
import { useOrders } from '@/contexts/OrdersContext';
import { OrderCard } from '@/components/OrderCard';
import { OrderModal } from '@/components/OrderModal';
import { Order } from '@/types/order';
import { Plus, BadgeCheck, Trash2 } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { VoiceButton } from '@/components/VoiceButton';

export default function HomeScreen() {
  const {
    orders,
    loading,
    addOrder,
    updateOrder,
    deleteOrder,
    togglePurchased,
    remainingCount,
    completedCount,
    deleteAllOrders,
  } = useOrders();

  const [modalVisible, setModalVisible] = useState(false);
  const [editingOrder, setEditingOrder] = useState<Order | undefined>();

  const fabScale = useRef(new Animated.Value(1)).current;
  const animatedProgress = useRef(new Animated.Value(0)).current;

  const progress = orders.length > 0 ? completedCount / orders.length : 0;
  const extractOrder = (text: string) => {
    const match = text.match(/\\d+/);
  
    return {
      quantity: match ? parseInt(match[0]) : 1,
      name: text.replace(/\\d+/, '').trim(),
    };
  };
  useEffect(() => {
    Animated.timing(animatedProgress, {
      toValue: progress,
      duration: 800,
      useNativeDriver: false,
    }).start();
  }, [progress]);

  const widthInterpolated = animatedProgress.interpolate({
    inputRange: [0, 1],
    outputRange: ['0%', '100%'],
  });

  const handleAddPress = useCallback(() => {
    Animated.sequence([
      Animated.spring(fabScale, { toValue: 1.15, useNativeDriver: true }),
      Animated.spring(fabScale, { toValue: 1, useNativeDriver: true }),
    ]).start();

    setEditingOrder(undefined);
    setModalVisible(true);
  }, []);

  const handleEdit = useCallback((order: Order) => {
    setEditingOrder(order);
    setModalVisible(true);
  }, []);

  const handleSave = useCallback(async (order: Order) => {
    if (editingOrder) {
      await updateOrder(order);
    } else {
      await addOrder(order);
    }
  }, [editingOrder, updateOrder, addOrder]);

  const handleDelete = useCallback((id: string) => {
    Alert.alert('حذف الطلب', 'هل أنت متأكد؟', [
      { text: 'إلغاء', style: 'cancel' },
      { text: 'حذف', style: 'destructive', onPress: () => deleteOrder(id) },
    ]);
  }, [deleteOrder]);

  const handleDeleteAll = useCallback(() => {
    Alert.alert('مسح الكل', 'هل أنت متأكد؟', [
      { text: 'إلغاء', style: 'cancel' },
      { text: 'مسح الكل', style: 'destructive', onPress: deleteAllOrders },
    ]);
  }, [deleteAllOrders]);

  // 🔥 FIX: prevent UI blocking / flicker on toggle
  const handleToggle = useCallback((id: string) => {
    startTransition(() => {
      togglePurchased(id);
    });
  }, [togglePurchased]);
  
  const renderItem = useCallback(({ item }: { item: Order }) => {
    return (
      <OrderCard
        order={item}
        onToggle={handleToggle}
        onEdit={handleEdit}
        onDelete={handleDelete}
      />
    );
  }, [handleToggle, handleEdit, handleDelete]);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#3b82f6" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <LinearGradient colors={["#3b82f6", "#2563eb"]} style={styles.header}>
        <View style={styles.headerContent}>
          <View style={styles.headerTop}>
            <BadgeCheck size={42} color="#fff" />
            <Text style={styles.headerTitle}>طلباتك</Text>
          </View>

          {orders.length > 0 && (
            <>
              <View style={styles.stats}>
                <View style={styles.statCard}>
                  <Text style={styles.statNumber}>{remainingCount}</Text>
                  <Text style={styles.statLabel}>متبقي</Text>
                </View>
                <View style={styles.statCard}>
                  <Text style={styles.statNumber}>{completedCount}</Text>
                  <Text style={styles.statLabel}>مكتمل</Text>
                </View>
                <View style={styles.statCard}>
                  <Text style={styles.statNumber}>{orders.length}</Text>
                  <Text style={styles.statLabel}>الإجمالي</Text>
                </View>
              </View>

              <View style={styles.progressContainer}>
                <View style={styles.progressBackground}>
                  <Animated.View
                    style={[styles.progressFill, { width: widthInterpolated }]}
                  />
                </View>
                <Text style={styles.progressText}>
                  {Math.round(progress * 100)}%
                </Text>
              </View>
            </>
          )}
        </View>
      </LinearGradient>

      <View style={styles.content}>
        {orders.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyIcon}>🛒</Text>
            <Text style={styles.emptyTitle}>لا توجد طلبات</Text>
            <Text style={styles.emptyText}>ابدأ بإضافة طلباتك</Text>
          </View>
        ) : (
          <FlatList
            data={orders}
            keyExtractor={(item) => item.id}
            renderItem={renderItem}
            contentContainerStyle={styles.list}
            showsVerticalScrollIndicator={false}
            removeClippedSubviews
            initialNumToRender={10}
          />
        )}
      </View>

      {orders.length > 0 && (
        <TouchableOpacity style={styles.clearAllButton} onPress={handleDeleteAll}>
          <LinearGradient colors={["#ef4444", "#dc2626"]} style={styles.clearAllGradient}>
            <Trash2 size={24} color="#fff" />
            <Text style={styles.clearAllText}>مسح الكل</Text>
          </LinearGradient>
        </TouchableOpacity>
      )}

      <Animated.View style={[styles.fab, { transform: [{ scale: fabScale }] }]}>
      <VoiceButton
  onResult={(orders) => {
    orders.forEach((order, index) => {
      // ✅ أضف تأخير صغير لكل طلب
      setTimeout(() => {
        addOrder({
          id: `${Date.now()}-${index}-${Math.random()}`,
          name: order.name,
          quantity: order.quantity,
          notes: order.unit ? `الوحدة: ${order.unit}` : order.notes,
          icon: order.emoji,
          category: order.category,
          isPurchased: false,
        });
      }, index * 50); // 50ms فرق بين كل طلب
    });
  }}
/>
        <TouchableOpacity onPress={handleAddPress}>
          <LinearGradient colors={["#3b82f6", "#2563eb"]} style={styles.fabGradient}>
            <Plus size={28} color="#fff" strokeWidth={3} />
          </LinearGradient>
        </TouchableOpacity>
      </Animated.View>

      <OrderModal
        visible={modalVisible}
        order={editingOrder}
        onClose={() => setModalVisible(false)}
        onSave={handleSave}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#eef2f7',
  },

  header: {
    paddingTop: 60,
    paddingBottom: 30,
    paddingHorizontal: 20,
    borderBottomLeftRadius: 25,
    borderBottomRightRadius: 25,
  },

  headerContent: {
    alignItems: 'center',
    gap: 16,
  },

  headerTop: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },

  headerTitle: {
    fontSize: 38, // 🔥 كان كبير جدًا
    color: '#fff',
    fontFamily: 'GraphicSchool-Regular',
  },

  stats: {
    flexDirection: 'row',
    gap: 10,
    width: '100%',
  },

  statCard: {
    flex: 1,
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderRadius: 16,
    padding: 14,
    alignItems: 'center',
  },

  statNumber: {
    fontSize: 22,
    fontWeight: '700',
    color: '#fff',
    fontFamily: 'IBMPlexSansArabic-Bold',
  },

  statLabel: {
    fontSize: 12,
    color: '#e5e7eb',
    fontFamily: 'GraphicSchool-Regular',

  },

  progressContainer: {
    width: '100%',
    alignItems: 'center',
    gap: 6,
  },

  progressBackground: {
    width: '100%',
    height: 12,
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 10,
    overflow: 'hidden',
  },

  progressFill: {
    height: '100%',
    backgroundColor: '#fff',
    borderRadius: 10,
  },

  progressText: {
    color: '#fff',
    fontSize: 15,
    fontFamily: 'IBMPlexSansArabic-Medium',
    marginTop:4,
  },

  content: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 16,
  },

  list: {
    paddingBottom: 120,
  },

  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },

  emptyIcon: {
    fontSize: 70,
  },

  emptyTitle: {
    fontSize: 25,
    marginTop: 10,
    color: '#111',
      fontFamily: 'IBMPlexSansArabic-Bold',
  },

  emptyText: {
    fontSize: 20,
    color: '#666',
    marginTop: 6,
    fontFamily: 'IBMPlexSansArabic-Regular',
  },

  fab: {
    position: 'absolute',
    bottom: 30,
    right: 20,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    gap: 10,
  },

  fabGradient: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 6,
  },

  clearAllButton: {
    position: 'absolute',
    bottom: 30,
    left: 20,
    borderRadius: 24,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
  },

  clearAllGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    height: 46,
    borderRadius: 24,
    gap: 6,
  },

  clearAllText: {
    color: '#fff',
    fontSize: 14,
    fontFamily: 'IBMPlexSansArabic-Bold',
  },
});

