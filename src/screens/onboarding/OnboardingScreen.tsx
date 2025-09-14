import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
  ScrollView,
  Animated,
} from 'react-native';
import Svg, { Circle, Polyline, Line, Rect } from 'react-native-svg';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../context/AuthContext';
import RegistrationStepScreen from './RegistrationStepScreen';
import AgeGenderStepScreen from './AgeGenderStepScreen';
import EmailVerificationStepScreen from './EmailVerificationStepScreen';
import MedicalDocumentsScreen from './MedicalDocumentsScreen';
import DeviceConnectionScreen from './DeviceConnectionScreen';
import PermissionsScreen from './PermissionsScreen';
import FinishOnboardingScreen from './FinishOnboardingScreen';

const { width, height } = Dimensions.get('window');

const HealthTrackingIcon = () => (
  <Svg width="80" height="80" viewBox="0 0 100 100" fill="none">
    <Circle cx="50" cy="50" r="45" stroke="#2D9CDB" strokeWidth="4"/>
    <Polyline 
      points="20,70 35,55 50,60 65,40 80,45" 
      fill="none" 
      stroke="#27AE60" 
      strokeWidth="4" 
      strokeLinecap="round" 
      strokeLinejoin="round"
    />
    <Circle cx="20" cy="70" r="4" fill="#27AE60"/>
    <Circle cx="35" cy="55" r="4" fill="#27AE60"/>
    <Circle cx="50" cy="60" r="4" fill="#27AE60"/>
    <Circle cx="65" cy="40" r="4" fill="#27AE60"/>
    <Circle cx="80" cy="45" r="4" fill="#27AE60"/>
    <Polyline 
      points="20,70 35,50 50,45 65,25 80,30" 
      fill="none" 
      stroke="#E74C3C" 
      strokeWidth="3" 
      strokeLinecap="round" 
      strokeLinejoin="round"
    />
    <Circle cx="20" cy="70" r="3" fill="#E74C3C"/>
    <Circle cx="35" cy="50" r="3" fill="#E74C3C"/>
    <Circle cx="50" cy="45" r="3" fill="#E74C3C"/>
    <Circle cx="65" cy="25" r="3" fill="#E74C3C"/>
    <Circle cx="80" cy="30" r="3" fill="#E74C3C"/>
  </Svg>
);

const TravelHealthIcon = () => (
  <Svg width="80" height="80" viewBox="0 0 100 100" fill="none">
    <Circle cx="50" cy="50" r="45" stroke="#FF9500" strokeWidth="4"/>
    <Polyline
      points="20,50 30,45 50,50 70,45 80,50 70,55 50,50 30,55 20,50"
      fill="none"
      stroke="#FF9500"
      strokeWidth="3"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

const RobotIcon = () => (
  <Svg width="80" height="80" viewBox="0 0 100 100" fill="none">
    <Circle cx="50" cy="50" r="45" stroke="#AF52DE" strokeWidth="4"/>
    <Rect x="35" y="30" width="30" height="25" rx="5" stroke="#AF52DE" strokeWidth="3" fill="none"/>
    <Circle cx="42" cy="40" r="3" fill="#AF52DE"/>
    <Circle cx="58" cy="40" r="3" fill="#AF52DE"/>
    <Line x1="50" y1="30" x2="50" y2="20" stroke="#AF52DE" strokeWidth="2" strokeLinecap="round"/>
    <Circle cx="50" cy="18" r="2" fill="#AF52DE"/>
    <Rect x="30" y="55" width="40" height="20" rx="8" stroke="#AF52DE" strokeWidth="3" fill="none"/>
    <Line x1="30" y1="60" x2="20" y2="65" stroke="#AF52DE" strokeWidth="3" strokeLinecap="round"/>
    <Line x1="70" y1="60" x2="80" y2="65" stroke="#AF52DE" strokeWidth="3" strokeLinecap="round"/>
    <Line x1="40" y1="75" x2="40" y2="85" stroke="#AF52DE" strokeWidth="3" strokeLinecap="round"/>
    <Line x1="60" y1="75" x2="60" y2="85" stroke="#AF52DE" strokeWidth="3" strokeLinecap="round"/>
  </Svg>
);

const TypewriterText: React.FC<{
  text: string;
  speed?: number;
  onComplete?: () => void;
  style?: any;
}> = ({ text, speed = 60, onComplete, style }) => {
  const [displayedText, setDisplayedText] = useState('');
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showCursor, setShowCursor] = useState(true);

  useEffect(() => {
    if (currentIndex < text.length) {
      const timer = setTimeout(() => {
        setDisplayedText(prev => prev + text[currentIndex]);
        setCurrentIndex(prev => prev + 1);
      }, speed);

      return () => clearTimeout(timer);
    } else if (onComplete) {
      onComplete();
    }
  }, [currentIndex, text, speed, onComplete]);

  useEffect(() => {
    const cursorTimer = setInterval(() => {
      setShowCursor(prev => !prev);
    }, speed * 0.5);

    return () => clearInterval(cursorTimer);
  }, [speed]);

  return (
    <Text style={style}>
      {displayedText}
      {showCursor && '|'}
    </Text>
  );
};

const SequentialTypewriter: React.FC<{
  lines: string[];
  onAllComplete: () => void;
}> = ({ lines, onAllComplete }) => {
  const [currentLineIndex, setCurrentLineIndex] = useState(0);
  const [completedLines, setCompletedLines] = useState<number[]>([]);

  const handleLineComplete = useCallback(() => {
    setCompletedLines(prev => [...prev, currentLineIndex]);
    if (currentLineIndex < lines.length - 1) {
      setTimeout(() => {
        setCurrentLineIndex(prev => prev + 1);
      }, 300);
    } else {
      setTimeout(() => {
        onAllComplete();
      }, 1000);
    }
  }, [currentLineIndex, lines.length, onAllComplete]);

  return (
    <View style={styles.typewriterContainer}>
      {lines.map((line, index) => (
        <View key={index} style={styles.typewriterLine}>
          {index <= currentLineIndex && (
            <TypewriterText
              text={line}
              speed={60}
              onComplete={index === currentLineIndex ? handleLineComplete : undefined}
              style={styles.typewriterText}
            />
          )}
        </View>
      ))}
    </View>
  );
};

interface OnboardingScreenProps {
  onComplete: () => void;
}

const OnboardingScreen: React.FC<OnboardingScreenProps> = ({ onComplete }) => {
  const [currentPage, setCurrentPage] = useState(0);
  const [typewriterComplete, setTypewriterComplete] = useState(false);
  const [userData, setUserData] = useState<any>({});
  const { signUp } = useAuth();

  const onboardingPages = [
    {
      title: 'Welcome to CoreHealth',
      subtitle: 'Your Personal Health Companion',
      description: 'Track, monitor, and optimize your health with AI-powered insights and personalized recommendations.',
      icon: '',
      isTypewriter: true,
    },
    {
      title: 'Health Tracking',
      subtitle: 'Monitor Your Vital Signs',
      description: 'Real-time tracking of your health metrics with intelligent analysis and trend detection.',
      icon: 'custom',
      isTypewriter: false,
    },
    {
      title: 'Travel Health',
      subtitle: 'Stay Healthy Anywhere',
      description: 'Location-based health insights, air quality monitoring, and jet lag management tips.',
      icon: 'custom-plane',
      isTypewriter: false,
    },
    {
      title: 'AI Health Assistant',
      subtitle: 'Your Personal Health Expert',
      description: 'Get instant answers to health questions with our advanced AI assistant trained on medical knowledge.',
      icon: 'custom-robot',
      isTypewriter: false,
    },
  ];

  const handleRegistrationComplete = async (registrationData: any) => {
    try {
      console.log('🚀 Starting registration in onboarding...');
      const displayName = `${registrationData.firstName} ${registrationData.surname}`;
      const result = await signUp(registrationData.email, registrationData.password, displayName);
      console.log('✅ Registration successful in onboarding:', result);
      setUserData(prev => ({ ...prev, ...registrationData }));
      setCurrentPage(5); // Move to email verification
    } catch (error: any) {
      console.error('❌ Registration failed in onboarding:', error);
      // Don't navigate on error, let user try again
    }
  };

  const handleAgeGenderComplete = (ageGenderData: any) => {
    setUserData(prev => ({ ...prev, ...ageGenderData }));
    setCurrentPage(6); // Move to medical documents
  };

  const handleEmailVerificationComplete = () => {
    setCurrentPage(6); // Move to medical documents
  };

  const handleMedicalDocumentsComplete = () => {
    setCurrentPage(7); // Move to device connection
  };

  const handleDeviceConnectionComplete = () => {
    setCurrentPage(8); // Move to permissions
  };

  const handlePermissionsComplete = () => {
    setCurrentPage(9); // Move to finish
  };

  const handleFinishComplete = () => {
    onComplete();
  };

  const handleNext = () => {
    if (currentPage < onboardingPages.length - 1) {
      setCurrentPage(prev => prev + 1);
    }
  };

  const handleSkip = () => {
    if (currentPage < onboardingPages.length - 1) {
      setCurrentPage(prev => prev + 1);
    }
  };

  const renderPage = (page: any, index: number) => {
    if (index === 0 && page.isTypewriter) {
      return (
        <View style={styles.typewriterPage}>
          <SequentialTypewriter
            lines={[
              'Welcome to CoreHealth.',
              'Your personal health companion.',
              'Track your health.',
              'Stay informed.',
              'Take control.',
              'Stay healthy.',
              'This is CoreHealth.'
            ]}
            onAllComplete={() => setTypewriterComplete(true)}
          />
          {typewriterComplete && (
            <TouchableOpacity
              style={styles.typewriterNextButton}
              onPress={handleNext}
            >
              <Text style={styles.typewriterNextText}>Next</Text>
              <Ionicons name="arrow-forward" size={16} color="#007AFF" style={styles.typewriterArrow} />
            </TouchableOpacity>
          )}
        </View>
      );
    }

    if (index === 1 && page.icon === 'custom') {
      return (
        <View style={styles.pageContent}>
          <View style={styles.iconContainer}>
            <HealthTrackingIcon />
          </View>
          <View style={styles.textContainer}>
            <Text style={styles.title}>{page.title}</Text>
            <Text style={styles.subtitle}>{page.subtitle}</Text>
            <Text style={styles.description}>{page.description}</Text>
          </View>
        </View>
      );
    }

    if (index === 2 && page.icon === 'custom-plane') {
      return (
        <View style={styles.pageContent}>
          <View style={styles.iconContainer}>
            <TravelHealthIcon />
          </View>
          <View style={styles.textContainer}>
            <Text style={styles.title}>{page.title}</Text>
            <Text style={styles.subtitle}>{page.subtitle}</Text>
            <Text style={styles.description}>{page.description}</Text>
          </View>
        </View>
      );
    }

    if (index === 3 && page.icon === 'custom-robot') {
      return (
        <View style={styles.pageContent}>
          <View style={styles.iconContainer}>
            <RobotIcon />
          </View>
          <View style={styles.textContainer}>
            <Text style={styles.title}>{page.title}</Text>
            <Text style={styles.subtitle}>{page.subtitle}</Text>
            <Text style={styles.description}>{page.description}</Text>
          </View>
        </View>
      );
    }

    return null;
  };

  // Handle different onboarding steps
  if (currentPage === 4) {
    return (
      <RegistrationStepScreen
        onNext={handleRegistrationComplete}
      />
    );
  }

  if (currentPage === 5) {
    return (
      <EmailVerificationStepScreen
        email={userData.email}
        onNext={handleEmailVerificationComplete}
        onBack={() => setCurrentPage(4)}
      />
    );
  }

  if (currentPage === 6) {
    return (
      <AgeGenderStepScreen
        onNext={handleAgeGenderComplete}
        onBack={() => setCurrentPage(5)}
      />
    );
  }

  if (currentPage === 7) {
    return (
      <MedicalDocumentsScreen
        onNext={handleMedicalDocumentsComplete}
        onBack={() => setCurrentPage(6)}
      />
    );
  }

  if (currentPage === 8) {
    return (
      <DeviceConnectionScreen
        onNext={handleDeviceConnectionComplete}
        onBack={() => setCurrentPage(7)}
      />
    );
  }

  if (currentPage === 9) {
    return (
      <PermissionsScreen
        onNext={handlePermissionsComplete}
        onBack={() => setCurrentPage(8)}
      />
    );
  }

  if (currentPage === 10) {
    return (
      <FinishOnboardingScreen
        onComplete={handleFinishComplete}
      />
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        pagingEnabled
        scrollEnabled={false}
      >
        {onboardingPages.map((page, index) => (
          <View key={index} style={styles.page}>
            {renderPage(page, index)}
          </View>
        ))}
      </ScrollView>

      <View style={styles.footer}>
        {currentPage !== 0 && (
          <View style={styles.pagination}>
            {onboardingPages.map((_, index) => (
              <View
                key={index}
                style={[
                  styles.dot,
                  currentPage === index && styles.activeDot,
                ]}
              />
            ))}
          </View>
        )}

        {currentPage !== 0 && currentPage !== onboardingPages.length - 1 && (
          <TouchableOpacity style={styles.skipButton} onPress={handleSkip}>
            <Text style={styles.skipButtonText}>Skip</Text>
          </TouchableOpacity>
        )}

        {currentPage !== 0 && currentPage < onboardingPages.length && (
          <TouchableOpacity style={styles.nextButton} onPress={handleNext}>
            <Text style={styles.nextButtonText}>Next</Text>
            <Ionicons name="arrow-forward" size={20} color="#FFFFFF" style={styles.buttonIcon} />
          </TouchableOpacity>
        )}

        {currentPage === onboardingPages.length - 1 && (
          <TouchableOpacity
            style={styles.getStartedButton}
            onPress={() => setCurrentPage(4)} // Move to registration
          >
            <Text style={styles.getStartedButtonText}>Get Started</Text>
            <Ionicons name="arrow-forward" size={20} color="#FFFFFF" style={styles.buttonIcon} />
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  scrollContent: {
    flexGrow: 1,
  },
  page: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
    minHeight: height,
  },
  typewriterPage: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  typewriterContainer: {
    alignItems: 'center',
    marginBottom: 60,
  },
  typewriterLine: {
    height: 60,
    justifyContent: 'center',
    alignItems: 'center',
  },
  typewriterText: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#000',
    textAlign: 'center',
  },
  typewriterNextButton: {
    position: 'absolute',
    bottom: 100,
    right: 20,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#007AFF',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 25,
  },
  typewriterNextText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    marginRight: 8,
  },
  typewriterArrow: {
    marginLeft: 4,
  },
  pageContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  iconContainer: {
    position: 'absolute',
    top: height * 0.1,
    alignSelf: 'center',
  },
  textContainer: {
    marginTop: 50,
    alignItems: 'center',
  },
  title: {
    fontSize: 38,
    fontWeight: 'bold',
    color: '#000',
    textAlign: 'center',
    marginBottom: 16,
  },
  subtitle: {
    fontSize: 28,
    color: '#007AFF',
    textAlign: 'center',
    marginBottom: 20,
  },
  description: {
    fontSize: 22,
    color: '#666',
    textAlign: 'center',
    lineHeight: 30,
    fontWeight: 'normal',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingBottom: 40,
    paddingTop: 20,
  },
  pagination: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#E5E5EA',
    marginHorizontal: 4,
  },
  activeDot: {
    backgroundColor: '#007AFF',
  },
  skipButton: {
    paddingVertical: 12,
    paddingHorizontal: 24,
  },
  skipButtonText: {
    fontSize: 16,
    color: '#666',
    fontWeight: '500',
  },
  nextButton: {
    backgroundColor: '#007AFF',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
  },
  nextButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    marginRight: 8,
  },
  getStartedButton: {
    backgroundColor: '#007AFF',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
  },
  getStartedButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    marginRight: 8,
  },
  buttonIcon: {
    marginLeft: 4,
  },
});

export default OnboardingScreen;