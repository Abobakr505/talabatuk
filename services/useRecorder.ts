import { Audio } from 'expo-av';

export const startRecording = async () => {
  try {
    await Audio.setAudioModeAsync({
      allowsRecordingIOS: true,
      playsInSilentModeIOS: true,
    });

    const permission = await Audio.requestPermissionsAsync();
    if (!permission.granted) throw new Error('Permission not granted');

    const { recording } = await Audio.Recording.createAsync({
      isMeteringEnabled: true,
      android: {
        extension: '.m4a',
        outputFormat: Audio.AndroidOutputFormat.MPEG_4,
        audioEncoder: Audio.AndroidAudioEncoder.AAC,
        sampleRate: 44100,
        numberOfChannels: 2,
        bitRate: 128000,
      },
      ios: {
        extension: '.wav',        // ✅ wav أفضل لـ Whisper على iOS
        outputFormat: Audio.IOSOutputFormat.LINEARPCM,
        audioQuality: Audio.IOSAudioQuality.HIGH,
        sampleRate: 44100,
        numberOfChannels: 1,
        bitRate: 128000,
        linearPCMBitDepth: 16,
        linearPCMIsBigEndian: false,
        linearPCMIsFloat: false,
      },
      web: {
        mimeType: 'audio/webm',
        blobOptions: { type: 'audio/webm' },
      },
    });

    return recording;
  } catch (err) {
    console.log('❌ Error starting recording', err);
  }
};

export const stopRecording = async (recording: any) => {
  try {
    await recording.stopAndUnloadAsync();
    const uri = recording.getURI();
    console.log('📁 URI:', uri);
    return uri;
  } catch (err) {
    console.log('❌ Error stopping recording', err);
  }
};