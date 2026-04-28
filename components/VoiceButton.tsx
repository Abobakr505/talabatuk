import React, { useState } from 'react';
import { TouchableOpacity, View, Alert } from 'react-native';
import { startRecording, stopRecording } from '@/services/useRecorder';
import { speechToText, parseOrderWithAI, ParsedOrder } from '@/services/voiceService';
import { AudioWaveform, AudioLines, Mic } from 'lucide-react-native';

interface VoiceButtonProps {
  onResult: (orders: ParsedOrder[]) => void;
}

export const VoiceButton = ({ onResult }: VoiceButtonProps) => {
  const [recording, setRecording] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const handlePress = async () => {
    if (loading) return;

    if (!recording) {
      const rec = await startRecording();
      if (rec) setRecording(rec);
    } else {
      setLoading(true);
      const uri = await stopRecording(recording);
      setRecording(null);

      if (!uri) {
        Alert.alert('خطأ', 'لم يتم حفظ التسجيل');
        setLoading(false);
        return;
      }

      try {
        // الخطوة 1: تحويل الصوت لنص
        const text = await speechToText(uri);
        if (!text?.trim()) {
          Alert.alert('تنبيه', 'لم يتم التعرف على الصوت');
          setLoading(false);
          return;
        }

        // الخطوة 2: تحليل النص بالذكاء الاصطناعي
        const orders = await parseOrderWithAI(text);
        onResult(orders);

      } catch (e: any) {
        console.log('❌ Error:', e);
        Alert.alert('خطأ', 'فشل المعالجة، حاول مجدداً');
      }

      setLoading(false);
    }
  };

  const getBackgroundColor = () => {
    if (loading) return '#f59e0b';
    if (recording) return '#ef4444';
    return '#10b981';
  };

  return (
    <TouchableOpacity
      onPress={handlePress}
      style={{
        backgroundColor: getBackgroundColor(),
        width: 64, height: 64, borderRadius: 32,
        justifyContent: 'center', alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3, shadowRadius: 8,
        marginBottom: 8,
      }}
    >
      <View>
        {loading ? <AudioWaveform size={28} color="#fff" strokeWidth={3} />
          : recording ? <AudioLines size={28} color="#fff" strokeWidth={3} />
          : <Mic size={28} color="#fff" strokeWidth={3} />}
      </View>
    </TouchableOpacity>
  );
};