import React, { useEffect, useRef, useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Animated, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useReduceMotion } from '../../../shared/utils/reduceMotion';

interface MessageComposerProps {
  onSend: (text: string, clientId: string) => void;
  disabled?: boolean;
  onCameraPress?: () => void; // backward compatibility
  onAttachPress?: () => void;
  onMicPress?: () => void;
  hasChatted?: boolean; // when true, disable rotating suggestions
}

export const MessageComposer: React.FC<MessageComposerProps> = ({ 
  onSend, 
  disabled = false,
  onCameraPress,
  onAttachPress,
  onMicPress,
  hasChatted: hasChattedProp,
}) => {
  const [text, setText] = useState('');
  const [placeholder, setPlaceholder] = useState('');
  const [hasChattedLocal, setHasChattedLocal] = useState(false);
  const inputRef = useRef<TextInput>(null);
  const reduceMotion = useReduceMotion();

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

    // After first user message, stop placeholder animation for the session
    if (!hasChattedLocal) setHasChattedLocal(true);
  };

  const handleTextChange = (newText: string) => {
    setText(newText);
    if (newText.trim().length > 0 && chipsVisible && !hasChatted) {
      Animated.timing(chipsOpacity, { toValue: 0, duration: 200, useNativeDriver: true }).start(() => {
        setChipsVisible(false);
      });
    }
  };

  const hasText = text.trim().length > 0;

  // Chip fade animation
  const chipsOpacity = useRef(new Animated.Value(1)).current;
  const [chipsVisible, setChipsVisible] = useState(true);

  const CHIPS = [
    'How are my biomarkers?',
    'Summarize my sleep',
    'What should I eat today?',
    "How's my recovery?",
  ];

  const handleChipPress = (chip: string) => {
    Animated.timing(chipsOpacity, { toValue: 0, duration: 250, useNativeDriver: true }).start(() => {
      setChipsVisible(false);
    });
    const clientId = `c_${Date.now()}_chip`;
    onSend(chip, clientId);
    if (!hasChattedLocal) setHasChattedLocal(true);
  };

  // Rotating typewriter placeholder when no text is entered
  const hasChatted = hasChattedProp || hasChattedLocal;

  useEffect(() => {
    if (reduceMotion || hasChatted) {
      setPlaceholder('Ask me about health...');
      return;
    }

    const suggestions = [
      'Ask me about health...',
      'Summarize my sleep last night',
      'What workouts should I do today?',
      'Explain my biomarker trends',
      'How can I improve recovery this week?',
    ];

    let suggestionIndex = 0;
    let charIndex = 0;
    let isUnmounted = false;
    let timeoutId: NodeJS.Timeout | null = null;

    const TYPE_DELAY_MS = 45;
    const PAUSE_FULL_MS = 1400;

    const typeNext = () => {
      if (isUnmounted) return;
      if (text.trim().length > 0) {
        // User started typing: freeze placeholder
        setPlaceholder('');
        return;
      }
      const current = suggestions[suggestionIndex];
      if (charIndex <= current.length) {
        setPlaceholder(current.slice(0, charIndex));
        charIndex += 1;
        timeoutId = setTimeout(typeNext, TYPE_DELAY_MS);
      } else {
        timeoutId = setTimeout(() => {
          charIndex = 0;
          suggestionIndex = (suggestionIndex + 1) % suggestions.length;
          setPlaceholder('');
          typeNext();
        }, PAUSE_FULL_MS);
      }
    };

    typeNext();

    return () => {
      isUnmounted = true;
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, [text, reduceMotion, hasChatted]);

  return (
    <View style={styles.container}>
      {/* Suggestion chips — shown before first message */}
      {chipsVisible && !hasChatted && (
        <Animated.View style={{ opacity: chipsOpacity, marginBottom: 10 }}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.chipsRow}
            keyboardShouldPersistTaps="handled"
          >
            {CHIPS.map((chip) => (
              <TouchableOpacity
                key={chip}
                style={styles.chip}
                onPress={() => handleChipPress(chip)}
                disabled={disabled}
                activeOpacity={0.7}
              >
                <Text style={styles.chipText}>{chip}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </Animated.View>
      )}
      <View style={styles.row}>
        {(onAttachPress || onCameraPress) && (
          <TouchableOpacity 
            onPress={onAttachPress || onCameraPress}
            style={[styles.attachContainer, disabled && { opacity: 0.6 }]}
            disabled={disabled}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            activeOpacity={0.8}
          >
            <View style={styles.attachIconWrap}>
              <Ionicons name="attach" size={34} color="#FFFFFF" />
            </View>
          </TouchableOpacity>
        )}

        <View style={styles.inputContainer}>
          <TextInput
            ref={inputRef}
            value={text}
            onChangeText={handleTextChange}
            placeholder={hasText ? '' : placeholder}
            placeholderTextColor="#8E8E93"
            style={styles.textInput}
            multiline={false}
            numberOfLines={1}
            returnKeyType="send"
            onSubmitEditing={handleSend}
            blurOnSubmit={false}
            maxLength={1000}
            editable={!disabled}
          />
          {hasText && (
            <TouchableOpacity 
              onPress={handleSend}
              style={[styles.inlineSend, disabled && styles.actionButtonDisabled]}
              disabled={disabled}
            >
              <Ionicons name="arrow-up" size={18} color={disabled ? "#8E8E93" : "#FFFFFF"} />
            </TouchableOpacity>
          )}
        </View>

        {!hasText && (
          <TouchableOpacity 
            onPress={onMicPress}
            style={[styles.actionButtonWrapper, disabled && styles.actionButtonWrapperDisabled]}
            disabled={disabled}
            activeOpacity={0.85}
          >
            <LinearGradient
              colors={disabled ? ['#2C2C2E', '#2C2C2E'] : ['#3AABF0', '#2997FF']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.actionButton}
            >
              <Ionicons name="mic" size={28} color={disabled ? "#8E8E93" : "#FFFFFF"} />
            </LinearGradient>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    paddingTop: 10,
    paddingBottom: 12,
    backgroundColor: '#000000',
    borderTopWidth: 1,
    borderTopColor: '#1C1C1E',
  },
  chipsRow: {
    flexDirection: 'row',
    gap: 8,
    paddingHorizontal: 2,
  },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#1C1C1E',
    borderWidth: 1,
    borderColor: '#2C2C2E',
  },
  chipText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '500',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  attachContainer: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#000000',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
    borderWidth: 1.25,
    borderColor: '#2C2C2E',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1.5 },
    shadowOpacity: 0.25,
    shadowRadius: 2.5,
    elevation: 2,
  },
  attachIconWrap: {
    transform: [{ rotate: '-22.5deg' }],
  },
  inputContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#16181C',
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 10,
    height: 44,
    borderWidth: 1,
    borderColor: '#2C2C2E',
  },
  textInput: {
    flex: 1,
    fontSize: 16,
    color: '#FFFFFF',
    maxHeight: 100,
    paddingVertical: 0,
    lineHeight: 20,
  },
  inlineSend: {
    marginLeft: 8,
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#3AABF0',
  },
  actionButtonWrapper: {
    marginLeft: 8,
    borderRadius: 20,
    shadowColor: '#3AABF0',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 5,
  },
  actionButtonWrapperDisabled: {
    shadowOpacity: 0,
  },
  actionButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.15)',
  },
  actionButtonDisabled: {
    opacity: 0.4,
  },
});
