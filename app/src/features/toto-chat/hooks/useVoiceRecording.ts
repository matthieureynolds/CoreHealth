import { useState, useRef, useEffect } from 'react';
import { Alert, Animated, Easing } from 'react-native';
import { Audio } from 'expo-av';
import * as FileSystem from 'expo-file-system';
import { DataService } from '../../../shared/services/data/dataService';

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
                const { transcript } = await DataService.transcribeAudio(audioBase64, 'audio/m4a');
                onTranscribed(transcript.trim());
              } catch (txErr) {
                console.error('Transcription error:', txErr);
                Alert.alert('Transcription failed', 'Could not transcribe audio. Please try again.');
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
          await Audio.setAudioModeAsync({ allowsRecordingIOS: true, playsInSilentModeIOS: true });
          const recordingOptions: any = { ...(Audio.RecordingOptionsPresets.HIGH_QUALITY as any) };
          if (recordingOptions.ios) recordingOptions.ios.meteringEnabled = true;
          const { recording: newRecording } = await Audio.Recording.createAsync(recordingOptions as any);
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
