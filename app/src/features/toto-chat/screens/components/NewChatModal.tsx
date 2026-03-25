import React from 'react';
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  TouchableWithoutFeedback,
  Animated,
  StyleSheet,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface NewChatModalProps {
  visible: boolean;
  translateY: Animated.Value;
  onDismiss: () => void;
  onStartWithMemory: () => void;
  onStartWithoutMemory: () => void;
  styles: typeof import('../HealthAssistantScreen.styles').styles;
}

const NewChatModal: React.FC<NewChatModalProps> = ({
  visible,
  translateY,
  onDismiss,
  onStartWithMemory,
  onStartWithoutMemory,
  styles,
}) => (
  <Modal
    visible={visible}
    transparent
    animationType="none"
    presentationStyle="overFullScreen"
    onRequestClose={onDismiss}
  >
    <View style={styles.newChatModalOverlay}>
      <TouchableWithoutFeedback onPress={onDismiss}>
        <View style={StyleSheet.absoluteFill} />
      </TouchableWithoutFeedback>
      <View style={styles.newChatBottomSheetContainer}>
        <Animated.View style={[styles.newChatBottomSheetContent, { transform: [{ translateY }] }]}>
          <View style={styles.newChatBottomSheetHandleContainer}>
            <View style={styles.newChatBottomSheetHandle} />
          </View>
          <View style={styles.newChatBottomSheetHeader} pointerEvents="box-none">
            <TouchableOpacity
              onPress={onDismiss}
              style={styles.newChatBottomSheetCloseButton}
              hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
              activeOpacity={0.7}
            >
              <Ionicons name="close" size={20} color="#FF3B30" />
            </TouchableOpacity>
            <Text style={styles.newChatBottomSheetTitle}>Start New Chat</Text>
            <View style={{ width: 32 }} />
          </View>
          <View style={styles.newChatBottomSheetBody}>
            <Text style={styles.newChatQuestion}>Would you like this chat to have memory?</Text>
            <TouchableOpacity
              style={styles.newChatButtonWithMemory}
              onPress={onStartWithMemory}
              activeOpacity={0.7}
            >
              <Text style={styles.newChatButtonText}>With Memory</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.newChatButtonNoMemory}
              onPress={onStartWithoutMemory}
              activeOpacity={0.7}
            >
              <Text style={styles.newChatButtonText}>No Memory</Text>
            </TouchableOpacity>
          </View>
        </Animated.View>
      </View>
    </View>
  </Modal>
);

export default NewChatModal;
