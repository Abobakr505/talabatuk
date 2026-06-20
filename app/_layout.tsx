import { useEffect, useState, useCallback } from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { useFrameworkReady } from '@/hooks/useFrameworkReady';
import { OrdersProvider } from '@/contexts/OrdersContext';
import { useFonts } from "expo-font";
import { ActivityIndicator, View } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import OnboardingScreen, { ONBOARDING_KEY } from '@/onboarding/OnboardingScreen';

export default function RootLayout() {
  useFrameworkReady();

  const [loaded] = useFonts({
    "IBMPlexSansArabic-Regular": require("../assets/fonts/IBMPlexSansArabic-Regular.ttf"),
    "IBMPlexSansArabic-Medium": require("../assets/fonts/IBMPlexSansArabic-Medium.ttf"),
    "IBMPlexSansArabic-Bold": require("../assets/fonts/IBMPlexSansArabic-Bold.ttf"),
    "GraphicSchool-Regular": require("../assets/fonts/GraphicSchool-Regular.ttf"),
  });

  // null = لسه بنتحقق من AsyncStorage، true/false = القيمة النهائية
  const [showOnboarding, setShowOnboarding] = useState<boolean | null>(null);

  useEffect(() => {
    checkOnboardingStatus();
  }, []);

  const checkOnboardingStatus = async () => {
    try {
      const value = await AsyncStorage.getItem(ONBOARDING_KEY);
      setShowOnboarding(value !== 'true');
    } catch (e) {
      // لو حصل خطأ في القراءة، الأفضل إننا نسيب المستخدم يدخل التطبيق عادي
      setShowOnboarding(false);
    }
  };

  const handleOnboardingFinish = useCallback(() => {
    setShowOnboarding(false);
  }, []);

  // لسه بنحمّل الخطوط أو بنتحقق من حالة الترحيب
  if (!loaded || showOnboarding === null) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#2563eb" />
      </View>
    );
  }

  // أول مرة يفتح فيها المستخدم التطبيق
  if (showOnboarding) {
    return (
      <GestureHandlerRootView style={{ flex: 1 }}>
        <OnboardingScreen onFinish={handleOnboardingFinish} />
        <StatusBar style="dark" />
      </GestureHandlerRootView>
    );
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <OrdersProvider>
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="+not-found" />
        </Stack>
        <StatusBar style="auto" />
      </OrdersProvider>
    </GestureHandlerRootView>
  );
}