import React, { useRef, useState } from 'react';
import { View, TextInput, TouchableOpacity, StyleSheet, Animated } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface MessageComposerProps {
  onSend: (text: string, clientId: string) => void;
  disabled?: boolean;
  onAttachPress?: () => void;
  onMicPress?: () => void;
  isRecording?: boolean;
  waveformAnimValues?: Animated.Value[];
  hasChatted?: boolean;
}

export const MessageComposer: React.FC<MessageComposerProps> = ({
  onSend,
  disabled = false,
  onAttachPress,
  onMicPress,
  isRecording = false,
  waveformAnimValues = [],
}) => {
  const [text, setText] = useState('');
  const inputRef = useRef<TextInput>(null);

  const handleSend = () => {
    if (!text.trim() || disabled) return;
    const messageText = text.trim();
    const clientId = `c_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`;
    setText('');
    onSend(messageText, clientId);
  };

  const hasText = text.trim().length > 0;

  return (
    <View style={styles.container}>
      <View style={styles.bar}>
        {/* Plus / attach button */}
        <TouchableOpacity
          onPress={onAttachPress}
          disabled={disabled || isRecording}
          activeOpacity={0.6}
          style={styles.iconBtn}
        >
          <Ionicons name="add" size={26} color={disabled || isRecording ? '#555' : '#999'} />
        </TouchableOpacity>

        {isRecording ? (
          /* Waveform visualisation while recording */
          <View style={styles.waveformContainer}>
            {waveformAnimValues.map((animVal, i) => (
              <Animated.View
                key={i}
                style={[
                  styles.waveformBar,
                  { transform: [{ scaleY: animVal }] },
                ]}
              />
            ))}
          </View>
        ) : (
          /* Text input */
          <TextInput
            ref={inputRef}
            value={text}
            onChangeText={setText}
            placeholder="Ask Toto"
            placeholderTextColor="#666"
            style={styles.input}
            multiline={false}
            numberOfLines={1}
            returnKeyType="send"
            onSubmitEditing={handleSend}
            blurOnSubmit={false}
            maxLength={1000}
            editable={!disabled}
          />
        )}

        {isRecording ? (
          /* Stop button + send while recording */
          <View style={styles.rightIcons}>
            <TouchableOpacity
              onPress={onMicPress}
              activeOpacity={0.7}
              style={styles.stopBtn}
            >
              <View style={styles.stopSquare} />
            </TouchableOpacity>
            <TouchableOpacity
              onPress={handleSend}
              disabled
              activeOpacity={0.7}
              style={[styles.sendBtn, styles.sendBtnDisabled]}
            >
              <Ionicons name="arrow-up" size={18} color="#fff" />
            </TouchableOpacity>
          </View>
        ) : hasText ? (
          /* Send button — replaces mic+voice when typing */
          <TouchableOpacity
            onPress={handleSend}
            disabled={disabled}
            activeOpacity={0.7}
            style={styles.sendBtn}
          >
            <Ionicons name="arrow-up" size={18} color="#fff" />
          </TouchableOpacity>
        ) : (
          /* Mic + voice buttons */
          <View style={styles.rightIcons}>
            <TouchableOpacity
              onPress={onMicPress}
              disabled={disabled}
              activeOpacity={0.6}
              style={styles.iconBtn}
            >
              <Ionicons name="mic-outline" size={24} color={disabled ? '#555' : '#999'} />
            </TouchableOpacity>
            <TouchableOpacity
              onPress={onMicPress}
              disabled={disabled}
              activeOpacity={0.6}
              style={styles.voiceBtn}
            >
              <View style={styles.voiceLines}>
                <View style={[styles.voiceLine, { height: 14 }]} />
                <View style={[styles.voiceLine, { height: 8 }]} />
                <View style={[styles.voiceLine, { height: 14 }]} />
              </View>
            </TouchableOpacity>
          </View>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 10,
    paddingTop: 8,
    paddingBottom: 12,
  },
  bar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1C1C1E',
    borderRadius: 28,
    height: 56,
    paddingHorizontal: 6,
  },
  iconBtn: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: '#FFFFFF',
    paddingVertical: 0,
  },
  rightIcons: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  sendBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#3AABF0',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 4,
  },
  sendBtnDisabled: {
    backgroundColor: '#2C2C2E',
  },
  voiceBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#2C2C2E',
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 2,
  },
  voiceLines: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },
  voiceLine: {
    width: 2.5,
    borderRadius: 1.5,
    backgroundColor: '#999',
  },
  // Waveform
  waveformContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 36,
    gap: 2.5,
  },
  waveformBar: {
    width: 3,
    height: 28,
    borderRadius: 1.5,
    backgroundColor: '#FFFFFF',
  },
  stopBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#2C2C2E',
    alignItems: 'center',
    justifyContent: 'center',
  },
  stopSquare: {
    width: 14,
    height: 14,
    borderRadius: 3,
    backgroundColor: '#FFFFFF',
  },
});
