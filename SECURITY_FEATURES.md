# CoreHealth Security Features

## Overview

CoreHealth implements enterprise-grade security measures to protect your sensitive health data, including biometric authentication and location access controls.

## Biometric Lock & Face ID

### Purpose
- **Primary security layer** - Prevents unauthorized access to your health data if someone gets your phone
- **Health data protection** - Your medical records, conditions, medications are highly sensitive
- **Compliance requirement** - HIPAA and GDPR require "reasonable" security measures

### Why It's Necessary
- Health apps are prime targets for hackers (valuable data for identity theft, insurance fraud)
- If your phone is lost/stolen, biometric lock prevents access to sensitive health information
- Provides enterprise-grade security that's expected for medical applications

### Implementation

#### 1. BiometricService
```typescript
import biometricService from '../services/biometricService';

// Initialize the service
await biometricService.initialize();

// Check if biometric is available
const available = biometricService.isBiometricAvailable();

// Enable biometric authentication
const success = await biometricService.enableBiometric();

// Authenticate user
const authenticated = await biometricService.authenticate({
  promptMessage: 'Authenticate to access your health data',
  fallbackLabel: 'Use passcode',
  cancelLabel: 'Cancel',
});
```

#### 2. BiometricProtection Component
Wrap sensitive screens with biometric protection:

```typescript
import BiometricProtection from '../components/common/BiometricProtection';

const SensitiveScreen = () => (
  <BiometricProtection
    promptMessage="Authenticate to view your medical records"
    requireBiometric={true}
  >
    {/* Your sensitive content here */}
  </BiometricProtection>
);
```

#### 3. useBiometricAuth Hook
Use the hook in your components:

```typescript
import { useBiometricAuth } from '../hooks/useBiometricAuth';

const MyComponent = () => {
  const {
    isBiometricAvailable,
    isBiometricEnabled,
    isAuthenticated,
    authenticate,
    enableBiometric,
    disableBiometric,
  } = useBiometricAuth();

  // Use the biometric functions
};
```

## Location Access

### Purpose
- **Travel Mode features** - Health alerts based on your current location (air quality, disease risks, medication availability)
- **Emergency services** - Quick access to nearby hospitals, pharmacies, clinics
- **Health insights** - Location-specific health recommendations (pollen levels, UV index, etc.)

### Implementation

#### 1. LocationService
```typescript
import locationService from '../services/locationService';

// Initialize the service
await locationService.initialize();

// Request location permission
const status = await locationService.requestPermission();

// Get current location
const location = await locationService.getCurrentLocation({
  accuracy: Location.Accuracy.Balanced,
  timeInterval: 5000,
  distanceInterval: 10,
});

// Start continuous location updates
await locationService.startLocationUpdates();
```

#### 2. useLocationServices Hook
```typescript
import { useLocationServices } from '../hooks/useLocationServices';

const MyComponent = () => {
  const {
    isLocationEnabled,
    isLocationAvailable,
    currentLocation,
    enableLocation,
    getCurrentLocation,
    startLocationUpdates,
  } = useLocationServices();

  // Use location functions
};
```

## Security Best Practices

### 1. Biometric Authentication
- Always require biometric authentication for sensitive health data
- Provide clear feedback when authentication fails
- Allow fallback options for accessibility
- Store biometric settings securely

### 2. Location Services
- Only request location when necessary
- Explain why location access is needed
- Provide granular control over location accuracy
- Respect user privacy preferences

### 3. Data Protection
- Encrypt sensitive data at rest and in transit
- Implement proper session management
- Log security events for audit purposes
- Regular security assessments

## Integration Examples

### Protecting Medical Records Screen
```typescript
const MedicalRecordsScreen = () => {
  const { isAuthenticated, authenticate } = useBiometricAuth();

  useEffect(() => {
    if (!isAuthenticated) {
      authenticate({
        promptMessage: 'Authenticate to view your medical records',
      });
    }
  }, [isAuthenticated, authenticate]);

  if (!isAuthenticated) {
    return <BiometricProtection promptMessage="View Medical Records" />;
  }

  return (
    <View>
      {/* Medical records content */}
    </View>
  );
};
```

### Location-Based Health Alerts
```typescript
const HealthAlertsScreen = () => {
  const { isLocationEnabled, currentLocation, enableLocation } = useLocationServices();

  const showLocationBasedAlerts = async () => {
    if (!isLocationEnabled) {
      const granted = await enableLocation();
      if (!granted) {
        Alert.alert('Location Required', 'Location access is needed for health alerts');
        return;
      }
    }

    // Show location-based health alerts
    if (currentLocation) {
      // Fetch air quality, pollen levels, etc.
    }
  };

  return (
    <View>
      <TouchableOpacity onPress={showLocationBasedAlerts}>
        <Text>Show Health Alerts</Text>
      </TouchableOpacity>
    </View>
  );
};
```

## Testing

### Biometric Testing
```typescript
// Test biometric availability
const testBiometric = async () => {
  await biometricService.initialize();
  console.log('Biometric available:', biometricService.isBiometricAvailable());
  console.log('Biometric enabled:', biometricService.isBiometricEnabled());
};

// Test authentication
const testAuth = async () => {
  const success = await biometricService.authenticate({
    promptMessage: 'Test authentication',
  });
  console.log('Authentication result:', success);
};
```

### Location Testing
```typescript
// Test location services
const testLocation = async () => {
  await locationService.initialize();
  console.log('Location enabled:', locationService.isLocationEnabled());
  console.log('Permission status:', locationService.getPermissionStatus());
  
  if (locationService.isLocationEnabled()) {
    const location = await locationService.getCurrentLocation();
    console.log('Current location:', location);
  }
};
```

## Troubleshooting

### Common Issues

1. **Biometric not working**
   - Check if device supports biometric authentication
   - Verify biometric is enrolled in device settings
   - Check app permissions

2. **Location not working**
   - Verify location services are enabled on device
   - Check app location permissions
   - Ensure location accuracy settings are appropriate

3. **Permission denied**
   - Guide users to device settings
   - Explain why permissions are needed
   - Provide alternative authentication methods

### Debug Mode
Enable debug logging for troubleshooting:

```typescript
// In your app configuration
if (__DEV__) {
  console.log('Biometric service state:', {
    available: biometricService.isBiometricAvailable(),
    enabled: biometricService.isBiometricEnabled(),
  });
  
  console.log('Location service state:', {
    enabled: locationService.isLocationEnabled(),
    permission: locationService.getPermissionStatus(),
  });
}
```

## Compliance Notes

- **HIPAA**: Biometric authentication provides "reasonable" security measures
- **GDPR**: Location data processing requires explicit consent
- **CCPA**: Users must be able to opt-out of data collection
- **SOC 2**: Security controls must be documented and tested

## Future Enhancements

- Multi-factor authentication (MFA)
- Advanced encryption algorithms
- Behavioral biometrics
- Location-based access controls
- Audit logging and monitoring
- Compliance reporting tools 