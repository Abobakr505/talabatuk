import React, { useEffect } from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSpring,
  withSequence,
  withDelay,
  withRepeat,
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';

const { width, height } = Dimensions.get('window');

interface CelebrationMessageProps {
  visible: boolean;
  duration?: number; // مدة الظهور الكلية قبل الاختفاء (مللي ثانية)
}

export function CelebrationMessage({
  visible,
  duration = 3000,
}: CelebrationMessageProps) {
  // أنيميشن الـ overlay والكارد
  const overlayOpacity = useSharedValue(0);
  const cardScale = useSharedValue(0.8);
  const cardTranslateY = useSharedValue(100);

  // أنيميشن الكونفيتي
  const confetti1 = useSharedValue(height * 0.8);
  const confetti2 = useSharedValue(height * 0.8);
  const confetti3 = useSharedValue(height * 0.8);
  const confetti4 = useSharedValue(height * 0.8);

  useEffect(() => {
    if (visible) {
      // دخول سريع واحتفالي
      overlayOpacity.value = withTiming(1, { duration: 400 });
      cardScale.value = withSequence(
        withTiming(1.1, { duration: 400 }),
        withSpring(1, { damping: 10, stiffness: 100 })
      );
      cardTranslateY.value = withSpring(0, { damping: 12, stiffness: 90 });

      // كونفيتي يصعد من الأسفل إلى داخل حدود الشاشة
      confetti1.value = withDelay(100, withTiming(height * 0.25, { duration: 2000 }));
      confetti2.value = withDelay(300, withTiming(height * 0.22, { duration: 2200 }));
      confetti3.value = withDelay(500, withTiming(height * 0.28, { duration: 1900 }));
      confetti4.value = withDelay(700, withTiming(height * 0.20, { duration: 2100 }));

      // اختفاء تلقائي بعد المدة المحددة
      const timer = setTimeout(() => {
        overlayOpacity.value = withTiming(0, { duration: 500 });
        cardScale.value = withTiming(0.8, { duration: 400 });
        cardTranslateY.value = withTiming(100, { duration: 400 });
        confetti1.value = withTiming(height * 0.8, { duration: 500 });
        confetti2.value = withTiming(height * 0.8, { duration: 500 });
        confetti3.value = withTiming(height * 0.8, { duration: 500 });
        confetti4.value = withTiming(height * 0.8, { duration: 500 });
      }, duration);

      return () => clearTimeout(timer);
    } else {
      // إعادة تعيين فورية عند الإخفاء
      overlayOpacity.value = 0;
      cardScale.value = 0.8;
      cardTranslateY.value = 100;
      confetti1.value = height * 0.8;
      confetti2.value = height * 0.8;
      confetti3.value = height * 0.8;
      confetti4.value = height * 0.8;
    }
  }, [visible]);

  const overlayStyle = useAnimatedStyle(() => ({
    opacity: overlayOpacity.value,
  }));

  const cardStyle = useAnimatedStyle(() => ({
    transform: [
      { scale: cardScale.value },
      { translateY: cardTranslateY.value },
    ],
  }));

  const confettiStyle1 = useAnimatedStyle(() => ({
    transform: [
      { translateY: confetti1.value },
      { rotate: withRepeat(withTiming('360deg', { duration: 1000 }), -1) },
    ],
  }));

  const confettiStyle2 = useAnimatedStyle(() => ({
    transform: [
      { translateY: confetti2.value },
      { rotate: withRepeat(withTiming('-360deg', { duration: 1000 }), -1) },
    ],
  }));

  const confettiStyle3 = useAnimatedStyle(() => ({
    transform: [
      { translateY: confetti3.value },
      { rotate: withRepeat(withTiming('360deg', { duration: 1000 }), -1) },
    ],
  }));

  const confettiStyle4 = useAnimatedStyle(() => ({
    transform: [
      { translateY: confetti4.value },
      { rotate: withRepeat(withTiming('-360deg', { duration: 1000 }), -1) },
    ],
  }));

  if (!visible && overlayOpacity.value === 0) return null;

  return (
    <Animated.View style={[styles.overlay, overlayStyle]} pointerEvents="none">
      {/* كونفيتي متحرك */}
      <Animated.Text style={[styles.confetti, styles.confetti1, confettiStyle1]}>🎉</Animated.Text>
      <Animated.Text style={[styles.confetti, styles.confetti2, confettiStyle2]}>✨</Animated.Text>
      <Animated.Text style={[styles.confetti, styles.confetti3, confettiStyle3]}>🏆</Animated.Text>
      <Animated.Text style={[styles.confetti, styles.confetti4, confettiStyle4]}>🎊</Animated.Text>

      {/* الكارد الاحتفالي */}
      <Animated.View style={[styles.card, cardStyle]}>
        <LinearGradient
          colors={['#10b981', '#34d399']}
          style={StyleSheet.absoluteFill}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        />

        <View style={styles.iconCircle}>
          <Text style={styles.mainEmoji}>🎉</Text>
        </View>

        <Text style={styles.title}>مبروك! أحسنت جداً 👏</Text>
        <Text style={styles.message}>لقد أكملت جميع طلباتك بنجاح</Text>
        <Text style={styles.subMessage}>استمتع بالإنجاز... تستحق الراحة ✨</Text>
      </Animated.View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    width,
    height,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  card: {
    width: width * 0.85,
    borderRadius: 32,
    paddingVertical: 40,
    paddingHorizontal: 32,
    alignItems: 'center',
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 15 },
    shadowOpacity: 0.4,
    shadowRadius: 30,
    elevation: 20,
  },
  iconCircle: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
    borderWidth: 4,
    borderColor: 'rgba(255, 255, 255, 0.4)',
  },
  mainEmoji: { fontSize: 64 },
  title: {
    fontSize: 30,
    color: '#fff',
    fontFamily: 'IBMPlexSansArabic-Bold',
    textAlign: 'center',
    marginBottom: 12,
    textShadowColor: 'rgba(0,0,0,0.3)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 6,
  },
  message: {
    fontSize: 19,
    color: '#fff',
    fontFamily: 'IBMPlexSansArabic-SemiBold',
    textAlign: 'center',
    marginBottom: 8,
    lineHeight: 28,
  },
  subMessage: {
    fontSize: 16,
    color: '#fff',
    opacity: 0.95,
    fontFamily: 'IBMPlexSansArabic-Regular',
    textAlign: 'center',
  },
  // كونفيتي
  confetti: {
    fontSize: 44,
    position: 'absolute',
  },
  confetti1: { left: width * 0.2, bottom: 0 },
  confetti2: { right: width * 0.2, bottom: 0 },
  confetti3: { left: width * 0.4, bottom: 0 },
  confetti4: { right: width * 0.4, bottom: 0 },
});
