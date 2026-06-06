import { useState, useRef, useEffect } from 'react';
import { Alert, Animated, Easing, Platform } from 'react-native';
import { Audio, type RecordingOptions } from 'expo-av';
import * as FileSystem from 'expo-file-system/legacy';
import { DataService } from '../../../shared/services/data/dataService';

// Speech-optimised: low bitrate AAC mono keeps files small for the 10 MB API Gateway limit.
// Whisper transcribes speech well at 32 kbps / 16 kHz mono.
const SPEECH_RECORDING_OPTIONS: RecordingOptions = {
  isMeteringEnabled: true,
  android: {
    extension: '.m4a',
    outputFormat: 2, // MPEG_4
    audioEncoder: 3, // AAC
    sampleRate: 16_000,
    numberOfChannels: 1,
    bitRate: 32_000,
  },
  ios: {
    extension: '.m4a',
    outputFormat: 'aac ' as any, // IOSOutputFormat.MPEG4AAC
    audioQuality: 32 as any,     // IOSAudioQuality.LOW
    sampleRate: 16_000,
    numberOfChannels: 1,
    bitRate: 32_000,
    linearPCMBitDepth: 16,
    linearPCMIsBigEndian: false,
    linearPCMIsFloat: false,
  },
  web: {
    mimeType: 'audio/webm',
    bitsPerSecond: 32_000,
  },
};

export interface UseVoiceRecordingResult {
  isRecording: boolean;
  recordingDuration: number;
  waveformAnimValues: Animated.Value[];
  recordingPulseAnim: Animated.Value;
  handleVoiceInput: (onTranscribed: (text: string) => void) => Promise<void>;
}

export function useVoiceRecording(): UseVoiceRecordingResult {
  const [isRecording, setIsRecording] = useState(false);
  const [recordingDuration, setRecordingDuration] = useState(0);
  const [recording, setRecording] = useState<Audio.Recording | null>(null);

  const recordingTimer = useRef<NodeJS.Timeout | null>(null);
  const waveformTimer = useRef<NodeJS.Timeout | null>(null);
  const waveformAnimValues = useRef(
    Array.from({ length: 24 }, () => new Animated.Value(0.3)),
  ).current;
  const recordingPulseAnim = useRef(new Animated.Value(1)).current;

  // Cleanup timers on unmount
  useEffect(() => {
    return () => {
      if (recordingTimer.current) clearInterval(recordingTimer.current);
      if (waveformTimer.current) {
        clearInterval(waveformTimer.current);
        waveformTimer.current = null;
      }
    };
  }, []);

  // Pulse animation while recording
  useEffect(() => {
    if (isRecording) {
      const pulseAnimation = Animated.loop(
        Animated.sequence([
          Animated.timing(recordingPulseAnim, { toValue: 1.2, duration: 1000, useNativeDriver: true }),
          Animated.timing(recordingPulseAnim, { toValue: 1, duration: 1000, useNativeDriver: true }),
        ]),
      );
      pulseAnimation.start();
      return () => pulseAnimation.stop();
    } else {
      recordingPulseAnim.setValue(1);
    }
  }, [isRecording]);

  const stopWaveform = () => {
    if (waveformTimer.current) {
      clearInterval(waveformTimer.current);
      waveformTimer.current = null;
    }
    waveformAnimValues.forEach((v) => {
      Animated.timing(v, { toValue: 0.3, duration: 150, useNativeDriver: true }).start();
    });
  };

  const handleVoiceInput = async (onTranscribed: (text: string) => void) => {
    try {
      const { status } = await Audio.requestPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission Required', 'Please grant microphone permissions to use voice input.');
        return;
      }

      // Pre-configure audio mode before any recording attempt
      // Retry once if the session fails to activate (simulator timing issue)
      for (let attempt = 0; attempt < 2; attempt++) {
        try {
          await Audio.setAudioModeAsync({
            allowsRecordingIOS: true,
            playsInSilentModeIOS: true,
            staysActiveInBackground: false,
            interruptionModeIOS: 1,
            shouldDuckAndroid: true,
            interruptionModeAndroid: 1,
            playThroughEarpieceAndroid: false,
          });
          break;
        } catch (modeErr) {
          if (attempt === 1) {
            console.warn('Audio mode setup failed:', modeErr);
            Alert.alert('Microphone Unavailable', 'Voice input is not available right now. Please make sure the app is in the foreground and try again.');
            return;
          }
          // Wait briefly and retry
          await new Promise(r => setTimeout(r, 300));
        }
      }

      if (isRecording) {
        // Stop recording
        if (recording) {
          try {
            await recording.stopAndUnloadAsync();
            const uri = recording.getURI();
            setRecording(null);
            setIsRecording(false);
            if (recordingTimer.current) {
              clearInterval(recordingTimer.current);
              recordingTimer.current = null;
            }
            setRecordingDuration(0);
            stopWaveform();

            if (uri) {
              try {
                const audioBase64 = await FileSystem.readAsStringAsync(uri, { encoding: FileSystem.EncodingType.Base64 });
                const sizeKB = Math.round((audioBase64.length * 3) / 4 / 1024);
                console.log(`Audio file size: ${sizeKB} KB (base64 length: ${audioBase64.length})`);
                const { transcript } = await DataService.transcribeAudio(audioBase64, 'audio/m4a');
                onTranscribed(transcript.trim());
              } catch (txErr: any) {
                console.error('Transcription error:', txErr);
                const detail = txErr?.message || String(txErr);
                Alert.alert('Transcription failed', `Could not transcribe audio. ${detail}`);
              }
            }
          } catch (stopError) {
            console.error('Error stopping recording:', stopError);
            Alert.alert('Error', 'Failed to stop recording. Please try again.');
          }
        }
      } else {
        // Start recording
        try {
          const { recording: newRecording } = await Audio.Recording.createAsync(SPEECH_RECORDING_OPTIONS as any);
          setRecording(newRecording);
          setIsRecording(true);
          setRecordingDuration(0);

          recordingTimer.current = setInterval(() => {
            setRecordingDuration(prev => prev + 1);
          }, 1000);

          if (waveformTimer.current) clearInterval(waveformTimer.current);
          waveformTimer.current = setInterval(async () => {
            try {
              const status: any = await newRecording.getStatusAsync();
              const db = typeof status.metering === 'number' ? status.metering : -160;
              const norm = Math.min(1, Math.max(0, (db + 160) / 160));
              waveformAnimValues.forEach((v, i) => {
                const phase = (i % 5) / 5;
                const shaped = 0.15 + norm * (0.2 + 0.65 * Math.abs(Math.sin(Date.now() / 250 + phase)));
                Animated.timing(v, { toValue: shaped, duration: 100, easing: Easing.out(Easing.quad), useNativeDriver: true }).start();
              });
            } catch { /* audio animation failure is non-fatal */ }
          }, 100);
        } catch (startError) {
          console.error('Error starting recording:', startError);
          Alert.alert('Error', 'Failed to start recording. Please try again.');
          setIsRecording(false);
        }
      }
    } catch (error) {
      console.error('Error with voice input:', error);
      setIsRecording(false);
      setRecording(null);
      if (recordingTimer.current) {
        clearInterval(recordingTimer.current);
        recordingTimer.current = null;
      }
      setRecordingDuration(0);
      Alert.alert('Error', 'Failed to handle voice input. Please try again.');
    }
  };

  return {
    isRecording,
    recordingDuration,
    waveformAnimValues,
    recordingPulseAnim,
    handleVoiceInput,
  };
}
