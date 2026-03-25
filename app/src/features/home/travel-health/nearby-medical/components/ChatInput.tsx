import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface Props {
  inputText: string;
  onChangeText: (text: string) => void;
  isLoading: boolean;
  isInitializing: boolean;
  isStreaming: boolean;
  isRecording: boolean;
  recordingDuration: number;
  showAttach: boolean;
  onToggleAttach: () => void;
  onSend: () => void;
  onVoice: () => void;
  onPickImage: () => void;
  onPickDocument: () => void;
}

const ChatInput: React.FC<Props> = ({
  inputText,
  onChangeText,
  isLoading,
  isInitializing,
  isStreaming,
  isRecording,
  recordingDuration,
  showAttach,
  onToggleAttach,
  onSend,
  onVoice,
  onPickImage,
  onPickDocument,
}) => {
  const isBusy = isLoading || isInitializing || isStreaming;
  const hasText = !!inputText.trim();
  const sendIconColor = isBusy ? '#8E8E93' : hasText ? '#FFFFFF' : isRecording ? '#FFFFFF' : '#8E8E93';

  return (
    <View style={styles.inputContainer}>
      <View style={styles.inputWrapper}>
        <TouchableOpacity onPress={onToggleAttach} style={styles.iconButton}>
          <Ionicons name="add" size={22} color="#8E8E93" />
        </TouchableOpacity>
        <TextInput
          style={styles.textInput}
          placeholder={
            isRecording
              ? `Recording... ${Math.floor(recordingDuration / 60)}:${String(recordingDuration % 60).padStart(2, '0')}`
              : 'Ask about your health data...'
          }
          value={inputText}
          onChangeText={onChangeText}
          multiline
          maxLength={500}
          editable={!isBusy}
        />
        <TouchableOpacity
          style={[styles.sendButton, !hasText && !isRecording && styles.sendButtonDisabled]}
          onPress={hasText ? onSend : onVoice}
          disabled={isBusy}
        >
          <Ionicons
            name={hasText ? 'arrow-up' : isRecording ? 'stop' : 'mic'}
            size={20}
            color={sendIconColor}
          />
        </TouchableOpacity>
      </View>

      {showAttach && (
        <View style={styles.attachRow}>
          <TouchableOpacity style={styles.attachButton} onPress={onPickImage}>
            <Ionicons name="camera" size={18} color="#FFFFFF" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.attachButton} onPress={onPickDocument}>
            <Ionicons name="attach" size={18} color="#FFFFFF" />
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  inputContainer: {
    backgroundColor: '#fff',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: '#E5E5EA',
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    backgroundColor: '#F2F2F7',
    borderRadius: 20,
    paddingHorizontal: 8,
    paddingVertical: 8,
    minHeight: 44,
  },
  iconButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
  },
  textInput: {
    flex: 1,
    fontSize: 16,
    color: '#1C1C1E',
    maxHeight: 100,
    textAlignVertical: 'top',
  },
  sendButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#2563EB',
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 8,
  },
  sendButtonDisabled: {
    backgroundColor: '#E5E7EB',
  },
  attachRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 8,
  },
  attachButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#2C2C2E',
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default ChatInput;
