import React, { useState } from 'react';
import { TouchableOpacity, View, Alert } from 'react-native';
import { startRecording, stopRecording } from '@/services/useRecorder';
import { speechToText } from '@/services/voiceService';
import { AudioWaveform, AudioLines, Mic } from 'lucide-react-native';

export const VoiceButton = ({ onResult }: any) => {
  const [recording, setRecording] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const handlePress = async () => {
    if (loading) return;
    console.log("🔥 button pressed");

    if (!recording) {
      console.log("🎤 start recording");

      const rec = await startRecording();
      setRecording(rec);
    } else {
      console.log("🛑 stop recording");

      setLoading(true);

      const uri = await stopRecording(recording);
      console.log("📁 uri:", uri);

      setRecording(null);

      try {
        const text = await speechToText(uri);
        console.log("✅ RESULT:", text);

        if (!text) {
          Alert.alert('خطأ', 'لم يتم تحويل الصوت');
          return;
        }

        onResult(text);
      } catch (e) {
        console.log("❌ ERROR:", e);
        Alert.alert('خطأ', 'فشل تحويل الصوت');
      }

      setLoading(false);
    }
  };

  // 🎨 تحديد اللون حسب الحالة
  const getBackgroundColor = () => {
    if (loading) return '#f59e0b'; // أصفر (processing)
    if (recording) return '#ef4444'; // أحمر (recording)
    return '#10b981'; // أخضر (idle)
  };

  return (
    <TouchableOpacity
      onPress={handlePress}
      style={{
        backgroundColor: getBackgroundColor(),
        width: 64,
        height: 64,
        borderRadius: 32,
        justifyContent: 'center', // 👈 أهم حاجة
        alignItems: 'center',     // 👈 أهم حاجة
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        marginBottom: 8,
      }}
    >
      <View>
        {loading ? (
          <AudioWaveform size={28} color="#fff" strokeWidth={3} />
        ) : recording ? (
          <AudioLines size={28} color="#fff" strokeWidth={3} />
        ) : (
          <Mic size={28} color="#fff" strokeWidth={3} />
        )}
      </View>
    </TouchableOpacity>
  );
};