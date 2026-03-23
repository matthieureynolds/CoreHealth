import React, { useEffect, useMemo, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  TouchableOpacity,
  TextInput,
  ScrollView,
  Alert,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { Ionicons } from '@expo/vector-icons';
import { ProfileTabParamList } from '../../../../../../shared/types';
import { useAuth } from '../../../../../../shared/context/AuthContext';

type EditUsernameScreenNavigationProp = StackNavigationProp<ProfileTabParamList, 'EditUsername'>;

const sanitize = (raw: string) =>
  raw
    .toLowerCase()
    .replace(/[^a-z0-9_\.]/g, '')
    .replace(/\.{2,}/g, '.')
    .replace(/^\.|\.$/g, '');

const EditUsernameScreen: React.FC = () => {
  const navigation = useNavigation<EditUsernameScreenNavigationProp>();
  const { user, updateUsername } = useAuth();
  const [username, setUsername] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const suggested = useMemo(() => {
    const base = user?.username || user?.preferredName || user?.firstName || '';
    if (!base) return '';
    return sanitize(base.replace(/\s+/g, '.'));
  }, [user]);

  useEffect(() => {
    setUsername(suggested);
  }, [suggested]);

  const handleSave = async () => {
    const cleaned = sanitize(username);
    if (!cleaned || cleaned.length < 3) {
      Alert.alert('Invalid username', 'Use 3–20 chars: letters, numbers, _ or .');
      return;
    }
    if (cleaned.length > 20) {
      Alert.alert('Invalid username', 'Max length is 20 characters.');
      return;
    }
    if (!/^[a-z0-9](?:[a-z0-9_.]*[a-z0-9])?$/.test(cleaned)) {
      Alert.alert('Invalid username', 'Must start/end with a letter or number.');
      return;
    }
    try {
      setIsLoading(true);
      await updateUsername(cleaned);
      Alert.alert('Success', 'Username updated');
      navigation.goBack();
    } catch (e: any) {
      Alert.alert('Error', e?.message || 'Failed to update username');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.headerButton}>
          <Ionicons name="chevron-back" size={24} color="#FF3B30" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Edit Username</Text>
        <TouchableOpacity onPress={handleSave} style={styles.headerButton} disabled={isLoading}>
          <Text style={[styles.saveText, isLoading && { opacity: 0.6 }]}>Save</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} contentContainerStyle={styles.contentContainer}>
        <View style={styles.inputContainer}>
          <Text style={styles.label}>Username</Text>
          <TextInput
            style={styles.input}
            value={username}
            onChangeText={(t) => setUsername(sanitize(t))}
            autoCapitalize="none"
            autoCorrect={false}
            placeholder="your.username"
            placeholderTextColor="#666"
            keyboardType="default"
            maxLength={20}
          />
          <Text style={styles.helper}>3–20 chars; letters, numbers, underscore, dot</Text>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 50,
    paddingBottom: 12,
    backgroundColor: '#000000',
    borderBottomWidth: 1,
    borderBottomColor: '#222',
  },
  headerButton: {
    width: 60,
    height: 40,
    justifyContent: 'center',
    alignItems: 'flex-start',
  },
  headerTitle: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  saveText: {
    color: '#0A84FF',
    fontSize: 16,
    fontWeight: '600',
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    padding: 20,
  },
  inputContainer: {
    marginBottom: 16,
  },
  label: {
    color: '#fff',
    fontSize: 14,
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#1a1a1a',
    borderWidth: 1,
    borderColor: '#333',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 12,
    color: '#fff',
    fontSize: 16,
  },
  helper: {
    color: '#888',
    fontSize: 12,
    marginTop: 6,
  },
});

export default EditUsernameScreen;


