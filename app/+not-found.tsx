import { Stack, router } from 'expo-router';
import { StyleSheet, Text, View, Pressable } from 'react-native';
import { Feather } from '@expo/vector-icons';

export default function NotFoundScreen() {
  return (
    <>
      <Stack.Screen options={{ title: '404' }} />
      <View style={styles.container}>

        <View style={styles.iconWrapper}>
          <Feather name="alert-triangle" size={64} color="#f97316" />
        </View>

        <Text style={styles.title}>الصفحة غير موجودة</Text>

        <Text style={styles.description}>
          يبدو أنك وصلت إلى صفحة غير متاحة أو تم حذفها.
        </Text>

        {/* Button */}
        <Pressable
          style={({ pressed }) => [
            styles.button,
            pressed && { opacity: 0.8 },
          ]}
          onPress={() => router.replace('/')}
        >
          <Text style={styles.buttonText}>العودة إلى الرئيسية</Text>
        </Pressable>

      </View>
    </>
  );
}


const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },

  iconWrapper: {
    backgroundColor: '#fff7ed',
    padding: 24,
    borderRadius: 100,
    marginBottom: 24,
  },

  title: {
    fontSize: 26,
    color: '#0f172a',
    marginBottom: 10,
    fontFamily: 'IBMPlexSansArabic-Bold',
  },

  description: {
    fontSize: 16,
    color: '#64748b',
    textAlign: 'center',
    marginBottom: 30,
    lineHeight: 24,
    fontFamily: 'IBMPlexSansArabic-Regular',
  },

  buttonText: {
    color: '#ffffff',
    fontSize: 16,
    fontFamily: 'IBMPlexSansArabic-Bold',
  },

  button: {
    backgroundColor: '#2563eb',
    paddingVertical: 14,
    paddingHorizontal: 32,
    borderRadius: 14,
    shadowColor: '#2563eb',
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 3,
  },
});
