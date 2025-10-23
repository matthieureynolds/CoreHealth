import React, { useRef, useState } from 'react';
import { View, TextInput, TouchableOpacity, StyleSheet, findNodeHandle } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { measureInWindow } from 'react-native-reanimated';
import { useSendAnimation } from '../../hooks/useSendAnimation';
// import { useHaptics } from '../../lib/haptics';
import { shouldReduceMotion } from '../../lib/reduceMotion';

interface MessageComposerProps {
  onSend: (text: string, clientId: string) => void;
  disabled?: boolean;
  onCameraPress?: () => void;
}

export const MessageComposer: React.FC<MessageComposerProps> = ({ 
  onSend, 
  disabled = false,
  onCameraPress
}) => {
  const [text, setText] = useState('');
  const inputRef = useRef<TextInput>(null);
  const sendAnim = useSendAnimation();
  // const haptics = useHaptics();

  const handleSend = async () => {
    if (!text.trim() || disabled) return;

    const messageText = text.trim();
    const clientId = `c_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    // Clear text instantly
    setText('');
    
    // Light haptic feedback
    // haptics.light();

    // Send the message
    onSend(messageText, clientId);
  };

  const handleTextChange = (newText: string) => {
    setText(newText);
  };

  return (
    <View style={styles.container}>
      <View style={styles.inputContainer}>
        {onCameraPress && (
          <TouchableOpacity 
            onPress={onCameraPress}
            style={styles.cameraButton}
            disabled={disabled}
          >
            <Ionicons 
              name="camera" 
              size={20} 
              color={disabled ? "#8E8E93" : "#007AFF"} 
            />
          </TouchableOpacity>
        )}
        
        <TextInput
          ref={inputRef}
          value={text}
          onChangeText={handleTextChange}
          placeholder="Ask me about health..."
          placeholderTextColor="#8E8E93"
          style={styles.textInput}
          multiline
          maxLength={1000}
          editable={!disabled}
        />
        
        <TouchableOpacity 
          onPress={handleSend} 
          style={[
            styles.sendButton,
            (!text.trim() || disabled) && styles.sendButtonDisabled
          ]}
          disabled={!text.trim() || disabled}
        >
          <Ionicons 
            name="send" 
            size={20} 
            color={text.trim() && !disabled ? "#FFFFFF" : "#8E8E93"} 
          />
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#0B0B0F',
    borderTopWidth: 1,
    borderTopColor: '#1C1C1E',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    backgroundColor: '#1C1C1E',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
    minHeight: 44,
  },
  cameraButton: {
    marginRight: 12,
    padding: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  textInput: {
    flex: 1,
    fontSize: 16,
    color: '#FFFFFF',
    maxHeight: 100,
    paddingVertical: 8,
    lineHeight: 20,
  },
  sendButton: {
    marginLeft: 12,
    padding: 8,
    borderRadius: 16,
    backgroundColor: '#007AFF',
    justifyContent: 'center',
    alignItems: 'center',
    minWidth: 36,
    minHeight: 36,
  },
  sendButtonDisabled: {
    backgroundColor: '#2C2C2E',
  },
});
