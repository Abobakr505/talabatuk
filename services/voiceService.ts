import axios from 'axios';

const API_KEY = process.env.EXPO_PUBLIC_OPENAI_API_KEY;

export const speechToText = async (uri: string) => {
  const formData = new FormData();

  const responseBlob = await fetch(uri);
  const blob = await responseBlob.blob();

  formData.append('file', blob, 'recording.m4a');
  formData.append('model', 'whisper-1');

  try {
    const response = await axios.post(
      'https://api.openai.com/v1/audio/transcriptions',
      formData,
      {
        headers: {
          Authorization: `Bearer ${API_KEY}`,
          'Content-Type': 'multipart/form-data',
        },
      }
    );

    return response.data.text;
  } catch (error) {
    console.log('❌ Speech error:', error);
    console.log("API KEY:", API_KEY);
    throw error;
  }
};