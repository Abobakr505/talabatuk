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
    <SafeAreaView style={styles.container}>
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
  onResult={(text: string) => {
    console.log("🎤 TEXT:", text); // 👈 مهم جدًا

    addOrder({
      id: Date.now().toString(),
      name: text,
      quantity: 1,
      notes: '',
      icon: '🛒',
      isPurchased: false,
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
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f3f4f6',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f3f4f6',
  },
  header: {
    paddingTop: 50,
    paddingBottom: 40,
    paddingHorizontal: 20,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
  },
  headerContent: {
    width: '100%',
    alignItems: 'center',
    justifyContent: 'flex-start',
    gap: 20,
  },
  headerTop: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  headerTitle: {
    fontSize: 48,
    color: '#fff',
    fontFamily: 'GraphicSchool-Regular',
  },
  stats: {
    flexDirection: 'row',
    gap: 12,
    justifyContent: 'space-between',
    width: '100%',
  },
  statCard: {
    flex: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 28,
    fontWeight: '700',
    color: '#fff',
    marginBottom: 4,
    fontFamily: 'IBMPlexSansArabic-Bold',
  },
  statLabel: {
    fontSize: 13,
    color: '#fff',
    opacity: 0.9,
    fontFamily: 'IBMPlexSansArabic-Medium',
  },
  // شريط التقدم الجديد
  progressContainer: {
    width: '100%',
    alignItems: 'center',
    gap: 8,
  },
  progressBackground: {
    width: '100%',
    height: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
    borderRadius: 12,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#ffffff', // لون أبيض نقي
    borderRadius: 12,
    shadowColor: '#fff',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
  },
  progressText: {
    color: '#fff',
    fontSize: 18,
    fontFamily: 'IBMPlexSansArabic-Bold',
    marginTop: 4,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  list: {
    paddingBottom: 100,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  emptyIcon: {
    fontSize: 80,
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 24,
    color: '#111827',
    marginBottom: 8,
    fontFamily: 'IBMPlexSansArabic-Bold',
  },
  emptyText: {
    fontSize: 16,
    color: '#6b7280',
    textAlign: 'center',
    lineHeight: 24,
    fontFamily: 'IBMPlexSansArabic-Regular',
  },
  fab: {
    position: 'absolute',
    bottom: 24,
    right: 20,

    elevation: 8,
    borderRadius: 32,
  },
  fabGradient: {
    width: 64,
    height: 64,
    borderRadius: 32,
    justifyContent: 'center',
    alignItems: 'center',    
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  clearAllButton: {
    position: 'absolute',
    bottom: 24,
    left: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
    borderRadius: 32,
  },
  clearAllGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    gap: 8,
  },
  clearAllText: {
    color: '#fff',
    fontSize: 16,
    fontFamily: 'IBMPlexSansArabic-Bold',
  },
});