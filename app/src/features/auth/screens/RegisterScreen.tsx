import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  TextInput,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useAuth } from "@shared/context/AuthContext";
import { StackNavigationProp } from "@react-navigation/stack";
import { AuthStackParamList } from "@shared/types";
import {
  NameField,
  EmailField,
  PasswordField,
  ProgressBar,
} from "./components/RegisterFormFields";

const CONSENT_PENDING_KEY = "@corehealth_pending_consent";
const CONSENT_VERSION = "1.0";
const CONSENT_PURPOSES = [
  "health_data_processing",
  "ai_analysis",
  "biomarker_tracking",
  "third_party_ai_openai",
];

type RegisterScreenNavigationProp = StackNavigationProp<
  AuthStackParamList,
  "Register"
>;

interface Props {
  navigation: RegisterScreenNavigationProp;
}

const TOTAL_STEPS = 7;
const MIN_AGE = 18;

const RegisterScreen: React.FC<Props> = ({ navigation }) => {
  const [firstName, setFirstName] = useState("");
  const [surname, setSurname] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [dateOfBirth, setDateOfBirth] = useState("");
  const [dobError, setDobError] = useState("");
  const [consentGiven, setConsentGiven] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);

  const { signUp } = useAuth();

  const advance = (step: number) =>
    setCurrentStep((s) => (s === step ? step + 1 : s));

  const validateAndAdvanceDob = () => {
    setDobError("");
    const parts = dateOfBirth.split("/");
    if (parts.length !== 3) {
      setDobError("Enter your date of birth as DD/MM/YYYY");
      return;
    }
    const [d, m, y] = parts.map(Number);
    const dob = new Date(y, m - 1, d);
    if (
      isNaN(dob.getTime()) ||
      dob.getFullYear() !== y ||
      dob.getMonth() !== m - 1 ||
      dob.getDate() !== d
    ) {
      setDobError("Enter a valid date of birth");
      return;
    }
    const today = new Date();
    let age = today.getFullYear() - dob.getFullYear();
    if (
      today.getMonth() < dob.getMonth() ||
      (today.getMonth() === dob.getMonth() && today.getDate() < dob.getDate())
    )
      age--;
    if (age < MIN_AGE) {
      setDobError(`You must be ${MIN_AGE} or older to use CoreHealth.`);
      return;
    }
    advance(6);
  };

  const handleSignUp = async () => {
    if (
      !firstName ||
      !surname ||
      !email ||
      !password ||
      !confirmPassword ||
      !dateOfBirth
    ) {
      Alert.alert("Error", "Please fill in all fields");
      return;
    }
    if (password !== confirmPassword) {
      Alert.alert("Error", "Passwords do not match");
      return;
    }
    if (!consentGiven) {
      Alert.alert(
        "Consent required",
        "You must agree to the Privacy Policy and Terms to create an account.",
      );
      return;
    }
    setIsLoading(true);
    try {
      // Store consent timestamp in AsyncStorage — flushed to DB after email verification + sign-in
      await AsyncStorage.setItem(
        CONSENT_PENDING_KEY,
        JSON.stringify({
          version: CONSENT_VERSION,
          purposes: CONSENT_PURPOSES,
          givenAt: new Date().toISOString(),
        }),
      );
      await signUp(email, password, `${firstName} ${surname}`);
      navigation.navigate("EmailSent", { email });
    } catch (error: any) {
      Alert.alert("Registration Failed", error.message || "Please try again");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Ionicons name="arrow-back" size={24} color="#3AABF0" />
          </TouchableOpacity>
          <Text style={styles.title}>Create Account</Text>
          <Text style={styles.subtitle}>
            Join TOTO for personalized health insights
          </Text>
        </View>

        <View style={styles.form}>
          <ProgressBar currentStep={currentStep} totalSteps={TOTAL_STEPS} />

          {currentStep >= 1 && (
            <NameField
              value={firstName}
              onChange={setFirstName}
              onEndEditing={() => {
                if (firstName.trim()) advance(1);
              }}
              placeholder="First Name"
              completed={currentStep > 1}
            />
          )}

          {currentStep >= 2 && (
            <NameField
              value={surname}
              onChange={setSurname}
              onEndEditing={() => {
                if (surname.trim()) advance(2);
              }}
              placeholder="Surname"
              completed={currentStep > 2}
            />
          )}

          {currentStep >= 3 && (
            <EmailField
              value={email}
              onChange={setEmail}
              onEndEditing={() => {
                if (email.trim()) advance(3);
              }}
              completed={currentStep > 3}
            />
          )}

          {currentStep >= 4 && (
            <PasswordField
              value={password}
              onChange={setPassword}
              onEndEditing={() => {
                if (password.trim()) advance(4);
              }}
              placeholder="Password"
              showPassword={showPassword}
              onToggleShow={() => setShowPassword((p) => !p)}
              completed={currentStep > 4}
            />
          )}

          {currentStep >= 5 && (
            <PasswordField
              value={confirmPassword}
              onChange={setConfirmPassword}
              onEndEditing={() => {
                if (confirmPassword && password === confirmPassword) advance(5);
              }}
              placeholder="Confirm Password"
              showPassword={showPassword}
              onToggleShow={() => setShowPassword((p) => !p)}
              completed={!!(confirmPassword && password === confirmPassword)}
            />
          )}

          {currentStep >= 6 && (
            <View style={styles.dobContainer}>
              <TextInput
                style={[
                  styles.dobInput,
                  dobError ? styles.dobInputError : null,
                ]}
                value={dateOfBirth}
                onChangeText={(text) => {
                  setDateOfBirth(text);
                  setDobError("");
                }}
                placeholder="Date of birth (DD/MM/YYYY)"
                placeholderTextColor="#555"
                keyboardType="numbers-and-punctuation"
                returnKeyType="done"
                onSubmitEditing={validateAndAdvanceDob}
                maxLength={10}
              />
              {dobError ? (
                <Text style={styles.dobError}>{dobError}</Text>
              ) : null}
              {!dobError && dateOfBirth.length === 10 && currentStep === 6 && (
                <TouchableOpacity
                  style={styles.dobContinueButton}
                  onPress={validateAndAdvanceDob}
                  activeOpacity={0.8}
                >
                  <Text style={styles.dobContinueText}>Continue</Text>
                </TouchableOpacity>
              )}
            </View>
          )}

          {currentStep >= 7 && (
            <TouchableOpacity
              style={styles.consentRow}
              onPress={() => setConsentGiven((v) => !v)}
              activeOpacity={0.7}
            >
              <View
                style={[
                  styles.checkbox,
                  consentGiven && styles.checkboxChecked,
                ]}
              >
                {consentGiven && (
                  <Ionicons name="checkmark" size={14} color="#000" />
                )}
              </View>
              <Text style={styles.consentText}>
                I agree to CoreHealth's{" "}
                <Text
                  style={styles.consentLink}
                  onPress={() => navigation.navigate("PrivacyNotice")}
                >
                  Privacy Notice
                </Text>{" "}
                and Terms of Service, including the processing of my health data
                by AI systems for personalised insights.
              </Text>
            </TouchableOpacity>
          )}

          {currentStep >= 7 &&
            firstName &&
            surname &&
            email &&
            password &&
            confirmPassword &&
            dateOfBirth && (
              <TouchableOpacity
                style={[
                  styles.button,
                  styles.registerButton,
                  !consentGiven && styles.registerButtonDisabled,
                ]}
                onPress={handleSignUp}
                disabled={isLoading || !consentGiven}
              >
                <Text style={styles.registerButtonText}>
                  {isLoading ? "Creating Account..." : "Create Account"}
                </Text>
              </TouchableOpacity>
            )}

          <View style={styles.footer}>
            <Text style={styles.footerText}>Already have an account? </Text>
            <TouchableOpacity onPress={() => navigation.navigate("Login")}>
              <Text style={styles.signInText}>Sign In</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000000",
  },
  scrollContent: {
    flexGrow: 1,
    padding: 20,
    paddingTop: 60,
  },
  header: {
    alignItems: "center",
    marginBottom: 40,
  },
  backButton: {
    position: "absolute",
    left: 0,
    top: 0,
    padding: 8,
  },
  title: {
    fontSize: 32,
    fontWeight: "bold",
    color: "#3AABF0",
    marginTop: 40,
  },
  subtitle: {
    fontSize: 16,
    color: "#A0A0A0",
    marginTop: 8,
    textAlign: "center",
  },
  form: {
    width: "100%",
  },
  button: {
    height: 50,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 20,
    marginBottom: 16,
  },
  registerButton: {
    backgroundColor: "#3AABF0",
  },
  registerButtonDisabled: {
    opacity: 0.4,
  },
  registerButtonText: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "600",
  },
  consentRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 20,
    gap: 12,
  },
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: 6,
    borderWidth: 1.5,
    borderColor: "#555",
    backgroundColor: "#1C1C1E",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 1,
    flexShrink: 0,
  },
  checkboxChecked: {
    backgroundColor: "#3AABF0",
    borderColor: "#3AABF0",
  },
  consentText: {
    flex: 1,
    fontSize: 13,
    color: "#A0A0A0",
    lineHeight: 19,
  },
  consentLink: {
    color: "#3AABF0",
    textDecorationLine: "underline",
  },
  dobContainer: {
    marginBottom: 16,
  },
  dobInput: {
    height: 52,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#333",
    backgroundColor: "#1C1C1E",
    paddingHorizontal: 16,
    color: "#fff",
    fontSize: 16,
  },
  dobInputError: {
    borderColor: "#FF453A",
  },
  dobError: {
    color: "#FF453A",
    fontSize: 13,
    marginTop: 6,
    marginLeft: 4,
  },
  dobContinueButton: {
    height: 50,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 12,
    backgroundColor: "#2C2C2E",
    borderWidth: 1,
    borderColor: "#3AABF0",
  },
  dobContinueText: {
    color: "#3AABF0",
    fontSize: 16,
    fontWeight: "600",
  },
  footer: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 20,
  },
  footerText: {
    color: "#666",
    fontSize: 14,
  },
  signInText: {
    color: "#3AABF0",
    fontSize: 14,
    fontWeight: "600",
  },
});

export default RegisterScreen;
