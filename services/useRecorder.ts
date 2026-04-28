import { Audio } from 'expo-av';

export const startRecording = async () => {
  try {
    await Audio.setAudioModeAsync({
      allowsRecordingIOS: true,
      playsInSilentModeIOS: true,
    });

    const permission = await Audio.requestPermissionsAsync();

    if (!permission.granted) {
      throw new Error('Permission not granted');
    }

    const { recording } = await Audio.Recording.createAsync(
      Audio.RecordingOptionsPresets.HIGH_QUALITY
    );

    return recording;
  } catch (err) {
    console.log('❌ Error starting recording', err);
  }
};

// ✅ لازم يكون export
export const stopRecording = async (recording: any) => {
  try {
    await recording.stopAndUnloadAsync();
    const uri = recording.getURI();
    return uri;
  } catch (err) {
    console.log('❌ Error stopping recording', err);
  }
};