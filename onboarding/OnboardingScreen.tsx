import React, { useRef, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  Dimensions,
  StyleSheet,
  StatusBar,
  NativeSyntheticEvent,
  NativeScrollEvent,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ChevronRight, Check, ListPlus, TrendingUp, Share2, LucideIcon, Mic } from 'lucide-react-native';

const { width, height } = Dimensions.get('window');

// 🔑 المفتاح المستخدم في AsyncStorage لمعرفة هل المستخدم شاف صفحة الترحيب قبل كده
export const ONBOARDING_KEY = 'hasSeenOnboarding';

interface Slide {
  id: string;
  title: string;
  description: string;
  Icon: LucideIcon; // 🔄 بدّلناها مؤقتًا بأيقونة بدل Lottie animation
  colors: [string, string];
}

// ℹ️ دلوقتي بنستخدم أيقونات بدل Lottie. لما تجهّز ملفات JSON بعدين،
// رجّع استيراد LottieView وبدّل Icon بـ animation: require('../assets/animations/xxx.json')
const slides: Slide[] = [
  {
    id: '1',
    title: 'أضف طلباتك بسهولة',
    description: 'سجّل كل اللي عايز تشتريه بصوتك أو بالكتابة، والتطبيق هيرتبهالك أوتوماتيك.',
    Icon: ListPlus,
    colors: ['#3b82f6', '#2563eb'],
  },
  {
    id: '2',
    title: '    لأول مره سجل طلباتك بصوتك',
    description: 'قول "أضف 2 كيلو طماطم وعلبة لبن" والتطبيق هيفهمك ويضيفهم لقائمة التسوق.',
    Icon: Mic,
    colors: ['#ef4444', '#dc2626'],
  },
  {
    id: '3',
    title: 'تابع تقدمك أول بأول',
    description: 'شوف كام طلب متبقي وكام اشتريت، وراقب نسبة الإنجاز بشكل لحظي.',
    Icon: TrendingUp,
    colors: ['#10b981', '#059669'],
  },
  {
    id: '4',
    title: 'شارك قائمتك مع أي حد',
    description: 'ابعت قائمة التسوق لعيلتك أو أصحابك بضغطة واحدة عبر واتساب أو أي تطبيق.',
    Icon: Share2,
    colors: ['#f59e0b', '#d97706'],
  },
];

interface OnboardingScreenProps {
  onFinish: () => void;
}

export default function OnboardingScreen({ onFinish }: OnboardingScreenProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const flatListRef = useRef<FlatList>(null);

  const isLastSlide = currentIndex === slides.length - 1;

  const handleNext = () => {
    if (isLastSlide) {
      handleFinish();
      return;
    }
    flatListRef.current?.scrollToIndex({ index: currentIndex + 1, animated: true });
  };

  const handleSkip = () => {
    handleFinish();
  };

  const handleFinish = async () => {
    try {
      await AsyncStorage.setItem(ONBOARDING_KEY, 'true');
    } catch (e) {
      // حتى لو فشل التخزين، خلي المستخدم يكمل لاستخدام التطبيق
      console.warn('Failed to save onboarding flag', e);
    } finally {
      onFinish();
    }
  };

  const handleScroll = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    const index = Math.round(e.nativeEvent.contentOffset.x / width);
    if (index !== currentIndex) {
      setCurrentIndex(index);
    }
  };

  const renderSlide = ({ item }: { item: Slide }) => {
    const { Icon } = item;
    return (
      <View style={[styles.slide, { width }]}>
        <LinearGradient colors={item.colors} style={styles.animationWrapper}>
          <Icon size={width * 0.28} color="#fff" strokeWidth={1.5} />
        </LinearGradient>

        <View style={styles.textWrapper}>
          <Text style={styles.title}>{item.title}</Text>
          <Text style={styles.description}>{item.description}</Text>
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />

      {/* زرار تخطي */}
      {!isLastSlide && (
        <TouchableOpacity style={styles.skipButton} onPress={handleSkip}>
          <Text style={styles.skipText}>تخطي</Text>
        </TouchableOpacity>
      )}

      <FlatList
        ref={flatListRef}
        data={slides}
        keyExtractor={(item) => item.id}
        renderItem={renderSlide}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onScroll={handleScroll}
        scrollEventThrottle={16}
        // مهم لدعم RTL: نخليها تبدأ من الشمال بصريًا بس المحتوى يفضل عربي
        inverted={false}
      />

    {/* النقط (Dots Indicator) */}
    <View style={styles.dotsContainer}>
        {slides.map((_, index) => (
          <View
            key={index}
            style={[
              styles.dot,
              index === currentIndex
                ? [styles.dotActive, { backgroundColor: slides[currentIndex].colors[0] }]
                : styles.dotInactive,
            ]}
          />
        ))}
      </View>

      {/* زرار التالي / ابدأ الآن */}
      <TouchableOpacity style={styles.nextButton} onPress={handleNext} activeOpacity={0.85}>
        <LinearGradient
          colors={slides[currentIndex].colors}
          style={styles.nextButtonGradient}
        >
          {isLastSlide ? (
            <>
              <Text style={styles.nextButtonText}>ابدأ الآن</Text>
              <Check size={20} color="#fff" strokeWidth={3} />
            </>
          ) : (
            <>
              <Text style={styles.nextButtonText}>التالي</Text>
              <ChevronRight size={20} color="#fff" strokeWidth={3} />
            </>
          )}
        </LinearGradient>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  skipButton: {
    position: 'absolute',
    top: 55,
    left: 20,
    zIndex: 10,
    paddingVertical: 8,
    paddingHorizontal: 14,
  },
  skipText: {
    fontSize: 16,
    color: '#9ca3af',
    fontFamily: 'IBMPlexSansArabic-Regular',
  },
  slide: {
    flex: 1,
    alignItems: 'center',
    paddingTop: 110,
    paddingHorizontal: 24,
  },
  animationWrapper: {
    width: width * 0.75,
    height: width * 0.75,
    borderRadius: (width * 0.75) / 2,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  textWrapper: {
    marginTop: 40,
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    color: '#111',
    fontFamily: 'IBMPlexSansArabic-Bold',
    textAlign: 'center',
  },
  description: {
    fontSize: 16,
    color: '#6b7280',
    fontFamily: 'IBMPlexSansArabic-Regular',
    textAlign: 'center',
    marginTop: 12,
    lineHeight: 24,
    paddingHorizontal: 10,
  },
  dotsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
    marginBottom: 24,
  },
  dot: {
    height: 8,
    borderRadius: 4,
  },
  dotActive: {
    width: 24,
    backgroundColor: '#3b82f6',
  },
  dotInactive: {
    width: 8,
    backgroundColor: '#e5e7eb',
  },
  nextButton: {
    marginHorizontal: 24,
    marginBottom: 40,
    borderRadius: 28,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4,
  },
  nextButtonGradient: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    height: 56,
    gap: 8,
  },
  nextButtonText: {
    color: '#fff',
    fontSize: 17,
    fontFamily: 'IBMPlexSansArabic-Bold',
  },
});