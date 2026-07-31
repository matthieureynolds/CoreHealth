import React from "react";
import { View, Text, TextInput, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import styles from "./emailPasswordStyles";

export type PasswordFormProps = {
  passwordCurrentPassword: string;
  setPasswordCurrentPassword: (text: string) => void;
  newPassword: string;
  setNewPassword: (text: string) => void;
  confirmPassword: string;
  setConfirmPassword: (text: string) => void;
  showPasswordCurrentPassword: boolean;
  togglePasswordCurrentVisibility: () => void;
  showNewPassword: boolean;
  toggleNewPasswordVisibility: () => void;
  showConfirmPassword: boolean;
  toggleConfirmPasswordVisibility: () => void;
  isLoading: boolean;
  handleUpdatePassword: () => void;
};

const PasswordForm: React.FC<PasswordFormProps> = React.memo(
  ({
    passwordCurrentPassword,
    setPasswordCurrentPassword,
    newPassword,
    setNewPassword,
    confirmPassword,
    setConfirmPassword,
    showPasswordCurrentPassword,
    togglePasswordCurrentVisibility,
    showNewPassword,
    toggleNewPasswordVisibility,
    showConfirmPassword,
    toggleConfirmPasswordVisibility,
    isLoading,
    handleUpdatePassword,
  }) => (
    <View style={styles.editForm}>
      <Text style={[styles.fieldLabel, styles.firstFieldLabel]}>
        Current Password *
      </Text>
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.textInput}
          value={passwordCurrentPassword}
          onChangeText={setPasswordCurrentPassword}
          placeholder="Enter current password"
          placeholderTextColor="#999"
          secureTextEntry={!showPasswordCurrentPassword}
          autoCapitalize="none"
          autoCorrect={false}
          spellCheck={false}
          blurOnSubmit={false}
        />
        <TouchableOpacity
          style={styles.eyeButton}
          onPress={togglePasswordCurrentVisibility}
        >
          <Ionicons
            name={showPasswordCurrentPassword ? "eye-off" : "eye"}
            size={20}
            color="#666"
          />
        </TouchableOpacity>
      </View>

      <Text style={styles.fieldLabel}>New Password *</Text>
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.textInput}
          value={newPassword}
          onChangeText={setNewPassword}
          placeholder="Enter new password"
          placeholderTextColor="#999"
          secureTextEntry={!showNewPassword}
          autoCapitalize="none"
          autoCorrect={false}
          spellCheck={false}
          blurOnSubmit={false}
        />
        <TouchableOpacity
          style={styles.eyeButton}
          onPress={toggleNewPasswordVisibility}
        >
          <Ionicons
            name={showNewPassword ? "eye-off" : "eye"}
            size={20}
            color="#666"
          />
        </TouchableOpacity>
      </View>

      <Text style={styles.fieldLabel}>Confirm New Password *</Text>
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.textInput}
          value={confirmPassword}
          onChangeText={setConfirmPassword}
          placeholder="Confirm new password"
          placeholderTextColor="#999"
          secureTextEntry={!showConfirmPassword}
          autoCapitalize="none"
          autoCorrect={false}
          spellCheck={false}
          blurOnSubmit={false}
        />
        <TouchableOpacity
          style={styles.eyeButton}
          onPress={toggleConfirmPasswordVisibility}
        >
          <Ionicons
            name={showConfirmPassword ? "eye-off" : "eye"}
            size={20}
            color="#666"
          />
        </TouchableOpacity>
      </View>

      <View style={styles.buttonRow}>
        <TouchableOpacity
          onPress={handleUpdatePassword}
          disabled={
            isLoading ||
            !passwordCurrentPassword ||
            !newPassword ||
            !confirmPassword
          }
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <Ionicons
            name="checkmark-circle"
            size={32}
            color={
              passwordCurrentPassword && newPassword && confirmPassword
                ? "#34C759"
                : "#3A3A3C"
            }
          />
        </TouchableOpacity>
      </View>
    </View>
  ),
);

export default PasswordForm;
