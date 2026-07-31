import React from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Modal,
  Pressable,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { formModalStyles as s } from "./formModalStyles";

interface FormModalShellProps {
  visible: boolean;
  title: string;
  onClose: () => void;
  onSave: () => void;
  children: React.ReactNode;
}

const FormModalShell: React.FC<FormModalShellProps> = ({
  visible,
  title,
  onClose,
  onSave,
  children,
}) => (
  <Modal
    visible={visible}
    transparent
    animationType="fade"
    statusBarTranslucent
    onRequestClose={onClose}
  >
    <Pressable style={s.overlay} onPress={onClose}>
      <Pressable style={s.sheet} onPress={() => {}}>
        <View style={s.header}>
          <TouchableOpacity
            onPress={onClose}
            hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
          >
            <Ionicons name="close" size={22} color="#FF3B30" />
          </TouchableOpacity>
          <Text style={s.title}>{title}</Text>
          <TouchableOpacity
            onPress={onSave}
            hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
          >
            <Ionicons name="checkmark" size={22} color="#34C759" />
          </TouchableOpacity>
        </View>
        <ScrollView
          style={s.body}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {children}
        </ScrollView>
      </Pressable>
    </Pressable>
  </Modal>
);

export default FormModalShell;
