# Contacts Setup Guide

To enable contact import functionality in the Emergency Contacts screen, follow these steps:

## 1. Install expo-contacts

```bash
npx expo install expo-contacts
```

## 2. Update app.json

Add the following permissions to your `app.json`:

```json
{
  "expo": {
    "name": "CoreHealth",
    "slug": "CoreHealth",
    "version": "1.0.0",
    "orientation": "portrait",
    "icon": "./assets/icon.png",
    "userInterfaceStyle": "light",
    "newArchEnabled": true,
    "splash": {
      "image": "./assets/splash-icon.png",
      "resizeMode": "contain",
      "backgroundColor": "#ffffff"
    },
    "ios": {
      "supportsTablet": true,
      "infoPlist": {
        "NSContactsUsageDescription": "This app needs access to contacts to help you import emergency contacts from your device."
      }
    },
    "android": {
      "adaptiveIcon": {
        "foregroundImage": "./assets/adaptive-icon.png",
        "backgroundColor": "#ffffff"
      },
      "edgeToEdgeEnabled": true,
      "permissions": [
        "android.permission.READ_CONTACTS"
      ]
    },
    "web": {
      "favicon": "./assets/favicon.png"
    }
  }
}
```

## 3. Enable Contacts in EmergencyContactsScreen.tsx

Uncomment the following lines in `src/screens/profile/EmergencyContactsScreen.tsx`:

1. Import statement:
```typescript
import * as Contacts from 'expo-contacts';
```

2. Permission request function:
```typescript
const requestContactsPermission = async () => {
  try {
    const { status } = await Contacts.requestPermissionsAsync();
    return status === 'granted';
  } catch (error) {
    console.error('Error requesting contacts permission:', error);
    return false;
  }
};
```

3. Contact loading function:
```typescript
const loadDeviceContacts = async () => {
  try {
    const hasPermission = await requestContactsPermission();
    if (!hasPermission) {
      Alert.alert(
        'Permission Required',
        'Please grant contacts permission to import contacts from your device.',
        [{ text: 'OK' }]
      );
      return;
    }

    const { data } = await Contacts.getContactsAsync({
      fields: [
        Contacts.Fields.Name,
        Contacts.Fields.PhoneNumbers,
        Contacts.Fields.Emails,
      ],
    });

    if (data.length > 0) {
      const filteredContacts = data
        .filter(contact => contact.phoneNumbers && contact.phoneNumbers.length > 0)
        .map(contact => ({
          id: contact.id,
          name: contact.name || 'Unknown',
          phoneNumbers: contact.phoneNumbers || [],
          emails: contact.emails || [],
        }));
      setDeviceContacts(filteredContacts);
      setContactSelectionModalVisible(true);
    } else {
      Alert.alert('No Contacts', 'No contacts found on your device.');
    }
  } catch (error) {
    console.error('Error loading contacts:', error);
    Alert.alert('Error', 'Failed to load contacts from your device.');
  }
};
```

## 4. Features Available

Once set up, users will be able to:

- **Import from Contacts**: Tap the "Import" button to access device contacts
- **Manual Entry**: Add contacts manually with full details
- **Contact Selection**: Choose from device contacts and auto-fill name, phone, and email
- **Primary Contact**: Set one contact as primary for emergency situations
- **Full Contact Management**: Edit, delete, and manage all emergency contacts

## 5. Privacy & Security

- Contacts are only accessed when the user explicitly chooses to import
- Only name, phone numbers, and emails are accessed
- No contact data is stored permanently - only the selected emergency contact information
- Users can revoke permissions at any time through device settings

## 6. Testing

After setup, test the functionality by:

1. Adding a few test contacts to your device
2. Opening the Emergency Contacts screen
3. Tapping "Import from Contacts"
4. Granting permission when prompted
5. Selecting a contact and verifying the form is populated
6. Saving the contact and verifying it appears in the list 