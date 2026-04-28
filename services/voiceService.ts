import axios from 'axios';
import { Alert, Platform } from 'react-native';

const GROQ_API_KEY = process.env.EXPO_PUBLIC_GROQ_API_KEY;

// ✅ الخطوة 1: تحويل الصوت لنص
export const speechToText = async (uri: string): Promise<string> => {
  try {
    // ✅ على iOS استخدم الـ URI مباشرة بدل fetch → blob
    const formData = new FormData();
    
    formData.append('file', {
      uri: uri,
      type: 'audio/wav',
      name: 'recording.wav',
    } as any);
    
    formData.append('model', 'whisper-large-v3-turbo');
    formData.append('language', 'ar');

    const response = await axios.post(
      'https://api.groq.com/openai/v1/audio/transcriptions',
      formData,
      {
        headers: {
          Authorization: `Bearer ${GROQ_API_KEY}`,
          'Content-Type': 'multipart/form-data',
        },
        timeout: 15000,
      }
    );

    return response.data.text;

  } catch (error: any) {
    console.log('🔴 Status:', error?.response?.status);
    console.log('🔴 Data:', JSON.stringify(error?.response?.data));
    throw error;
  }
};

// ✅ الخطوة 2: معالجة النص بالذكاء الاصطناعي
export interface ParsedOrder {
  name: string;
  quantity: number;
  unit: string;
  category: string;
  emoji: string;
  notes: string;
}

export const parseOrderWithAI = async (text: string): Promise<ParsedOrder[]> => {
  try {
    const response = await axios.post(
      'https://api.groq.com/openai/v1/chat/completions',
      {
        model: 'llama-3.3-70b-versatile',
        max_tokens: 1000,
        messages: [
          {
            role: 'system',
            content: `أنت مساعد ذكي لتحليل طلبات التسوق العربية. 
أجب فقط بـ JSON صالح بدون أي نص إضافي أو backticks.`,
          },
          {
            role: 'user',
            content: `النص الصوتي: "${text}"

المهم جداً: إذا ذُكر أكثر من منتج، استخرج كل منتج في عنصر منفصل في المصفوفة.
مثال: "واحد لبن وواحد خبز" → عنصران منفصلان.
مثال: "كيلو طماطم وتلاتة بيض وعلبة جبن" → ثلاثة عناصر منفصلة.

أجب بهذا الشكل فقط:
[
  {
    "name": "اسم المنتج",
    "quantity": 1,
    "unit": "علبة",
    "category": "ألبان",
    "emoji": "🥛",
    "notes": ""
  },
  {
    "name": "خبز",
    "quantity": 1,
    "unit": "رغيف",
    "category": "مخبوزات",
    "emoji": "🍞",
    "notes": ""
  }
]

التصنيفات: خضار، فاكهة، لحوم، دواجن، أسماك، ألبان، مخبوزات، مشروبات، حبوب، منظفات، أخرى`,          },
        ],
      },
      {
        headers: {
          Authorization: `Bearer ${GROQ_API_KEY}`,
          'Content-Type': 'application/json',
        },
        timeout: 15000,
      }
    );

    const raw = response.data.choices[0].message.content.trim();
    const clean = raw.replace(/```json|```/g, '').trim();
    return JSON.parse(clean);

  } catch (error: any) {
    console.log('❌ Status:', error?.response?.status);
    console.log('❌ Data:', JSON.stringify(error?.response?.data, null, 2));
    Alert.alert('خطأ', JSON.stringify(error?.response?.data) ?? 'فشل الاتصال');
    throw error;
  }
};