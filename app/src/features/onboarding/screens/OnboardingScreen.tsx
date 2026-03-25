import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../../shared/context/AuthContext';
import RegistrationStepScreen from './RegistrationStepScreen';
import AgeGenderStepScreen from './AgeGenderStepScreen';
import EmailVerificationStepScreen from './EmailVerificationStepScreen';
import MedicalDocumentsScreen from './MedicalDocumentsScreen';
import DeviceConnectionScreen from './DeviceConnectionScreen';
import PermissionsScreen from './PermissionsScreen';
import FinishOnboardingScreen from './FinishOnboardingScreen';
import SequentialTypewriter from './components/SequentialTypewriter';
import { HealthTrackingIcon, TravelHealthIcon, RobotIcon } from './components/OnboardingPageIcons';

const { height } = Dimensions.get('window');

const TYPEWRITER_LINES = [
  'Welcome to CoreHealth.',
  'Track your health.',
  'Stay informed.',
  'Take control.',
  'Stay healthy.',
  'This is CoreHealth.',
];

const onboardingPages = [
  { title: 'Welcome to CoreHealth', subtitle: 'Your Personal Health Companion', description: 'Track, monitor, and optimize your health with AI-powered insights and personalized recommendations.', icon: '', isTypewriter: true },
  { title: 'Health Tracking', subtitle: 'Monitor Your Vital Signs', description: 'Real-time tracking of your health metrics with intelligent analysis and trend detection.', icon: 'custom', isTypewriter: false },
  { title: 'Travel Health', subtitle: 'Stay Healthy Anywhere', description: 'Location-based health insights, air quality monitoring, and jet lag management tips.', icon: 'custom-plane', isTypewriter: false },
  { title: 'AI Health Assistant', subtitle: 'Your Personal Health Expert', description: 'Get instant answers to health questions with our advanced AI assistant trained on medical knowledge.', icon: 'custom-robot', isTypewriter: false },
];

interface OnboardingScreenProps {
  onComplete: () => void;
}

const OnboardingScreen: React.FC<OnboardingScreenProps> = ({ onComplete }) => {
  const [currentPage, setCurrentPage] = useState(0);
  const [typewriterComplete, setTypewriterComplete] = useState(false);
  const [userData, setUserData] = useState<Record<string, string>>({});
  const { signUp } = useAuth();

  const handleRegistrationComplete = async (registrationData: Record<string, string>) => {
    try {
      const displayName = `${registrationData.firstName} ${registrationData.surname}`;
      await signUp(registrationData.email, registrationData.password, displayName);
      setUserData((prev) => ({ ...prev, ...registrationData }));
      setCurrentPage(5);
    } catch (error: unknown) {
      console.error('Registration failed in onboarding:', error);
    }
  };

  const handleAgeGenderComplete = (ageGenderData: Record<string, string>) => {
    setUserData((prev) => ({ ...prev, ...ageGenderData }));
    setCurrentPage(6);
  };

  const handleNext = () => {
    if (currentPage < onboardingPages.length - 1) setCurrentPage(prev => prev + 1);
  };

  if (currentPage === 4) return <RegistrationStepScreen onNext={handleRegistrationComplete} />;
  if (currentPage === 5) return <EmailVerificationStepScreen email={userData.email} onNext={() => setCurrentPage(6)} onBack={() => setCurrentPage(4)} />;
  if (currentPage === 6) return <AgeGenderStepScreen onNext={handleAgeGenderComplete} onBack={() => setCurrentPage(5)} />;
  if (currentPage === 7) return <MedicalDocumentsScreen onNext={() => setCurrentPage(8)} onBack={() => setCurrentPage(6)} />;
  if (currentPage === 8) return <DeviceConnectionScreen onNext={() => setCurrentPage(9)} onBack={() => setCurrentPage(7)} />;
  if (currentPage === 9) return <PermissionsScreen onNext={() => setCurrentPage(10)} onBack={() => setCurrentPage(8)} />;
  if (currentPage === 10) return <FinishOnboardingScreen onComplete={onComplete} />;

  const renderPage = (page: typeof onboardingPages[0], index: number) => {
    if (index === 0 && page.isTypewriter) {
      return (
        <View style={styles.typewriterPage}>
          <SequentialTypewriter lines={TYPEWRITER_LINES} onAllComplete={() => setTypewriterComplete(true)} />
          {typewriterComplete && (
            <TouchableOpacity style={styles.typewriterNextButton} onPress={handleNext}>
              <Text style={styles.typewriterNextText}>Next</Text>
              <Ionicons name="arrow-forward" size={16} color="#007AFF" style={styles.typewriterArrow} />
            </TouchableOpacity>
          )}
        </View>
      );
    }
    const IconMap: Record<string, React.ReactNode> = {
      custom: <HealthTrackingIcon />,
      'custom-plane': <TravelHealthIcon />,
      'custom-robot': <RobotIcon />,
    };
    const icon = IconMap[page.icon] ?? null;
    return (
      <View style={styles.pageContent}>
        {icon && <View style={styles.iconContainer}>{icon}</View>}
        <View style={styles.textContainer}>
          <Text style={styles.title}>{page.title}</Text>
          <Text style={styles.subtitle}>{page.subtitle}</Text>
          <Text style={styles.description}>{page.description}</Text>
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false} pagingEnabled scrollEnabled={false}>
        {onboardingPages.map((page, index) => (
          <View key={index} style={styles.page}>{renderPage(page, index)}</View>
        ))}
      </ScrollView>
      <View style={styles.footer}>
        {currentPage !== 0 && (
          <View style={styles.pagination}>
            {onboardingPages.map((_, index) => (
              <View key={index} style={[styles.dot, currentPage === index && styles.activeDot]} />
            ))}
          </View>
        )}
        {currentPage !== 0 && currentPage !== onboardingPages.length - 1 && (
          <TouchableOpacity style={styles.skipButton} onPress={handleNext}>
            <Text style={styles.skipButtonText}>Skip</Text>
          </TouchableOpacity>
        )}
        {currentPage !== 0 && currentPage < onboardingPages.length && !typewriterComplete && (
          <TouchableOpacity style={styles.nextButton} onPress={handleNext}>
            <Text style={styles.nextButtonText}>Next</Text>
            <Ionicons name="arrow-forward" size={20} color="#FFFFFF" style={styles.buttonIcon} />
          </TouchableOpacity>
        )}
        {currentPage === onboardingPages.length - 1 && (
          <TouchableOpacity style={styles.getStartedButton} onPress={() => setCurrentPage(4)}>
            <Text style={styles.getStartedButtonText}>Get Started</Text>
            <Ionicons name="arrow-forward" size={20} color="#FFFFFF" style={styles.buttonIcon} />
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#ffffff' },
  scrollContent: { flexGrow: 1 },
  page: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 20, minHeight: height },
  typewriterPage: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 20 },
  typewriterNextButton: { position: 'absolute', bottom: 100, right: 20, flexDirection: 'row', alignItems: 'center', backgroundColor: '#007AFF', paddingHorizontal: 20, paddingVertical: 12, borderRadius: 25 },
  typewriterNextText: { color: '#FFFFFF', fontSize: 16, fontWeight: '600', marginRight: 8 },
  typewriterArrow: { marginLeft: 4 },
  pageContent: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 20 },
  iconContainer: { position: 'absolute', top: height * 0.1, alignSelf: 'center' },
  textContainer: { marginTop: 50, alignItems: 'center' },
  title: { fontSize: 38, fontWeight: 'bold', color: '#000', textAlign: 'center', marginBottom: 16 },
  subtitle: { fontSize: 28, color: '#007AFF', textAlign: 'center', marginBottom: 20 },
  description: { fontSize: 22, color: '#666', textAlign: 'center', lineHeight: 30, fontWeight: 'normal' },
  footer: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, paddingBottom: 40, paddingTop: 20 },
  pagination: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center' },
  dot: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#E5E5EA', marginHorizontal: 4 },
  activeDot: { backgroundColor: '#007AFF' },
  skipButton: { paddingVertical: 12, paddingHorizontal: 24 },
  skipButtonText: { fontSize: 16, color: '#666', fontWeight: '500' },
  nextButton: { backgroundColor: '#007AFF', paddingVertical: 12, paddingHorizontal: 24, borderRadius: 12, flexDirection: 'row', alignItems: 'center' },
  nextButtonText: { color: '#FFFFFF', fontSize: 16, fontWeight: '600', marginRight: 8 },
  getStartedButton: { backgroundColor: '#007AFF', paddingVertical: 12, paddingHorizontal: 24, borderRadius: 12, flexDirection: 'row', alignItems: 'center' },
  getStartedButtonText: { color: '#FFFFFF', fontSize: 16, fontWeight: '600', marginRight: 8 },
  buttonIcon: { marginLeft: 4 },
});

export default OnboardingScreen;
