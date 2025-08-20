import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Switch,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { ProfileTabParamList } from '../../types';
import { useAuth } from '../../context/AuthContext';

type ConnectedAccountsScreenNavigationProp = StackNavigationProp<ProfileTabParamList>;

interface ConnectedAccount {
  id: string;
  provider: 'google';
  email: string;
  name: string;
  isConnected: boolean;
  lastUsed: string;
}

const ConnectedAccountsScreen: React.FC = () => {
  const navigation = useNavigation<ConnectedAccountsScreenNavigationProp>();
  const { user, signInWithGoogle, unlinkAccount } = useAuth();
  
  const [connectedAccounts, setConnectedAccounts] = useState<ConnectedAccount[]>([
    {
      id: '1',
      provider: 'google',
      email: 'user@gmail.com',
      name: 'Google Account',
      isConnected: true,
      lastUsed: '2024-01-15',
    },
  ]);

  const handleConnectGoogle = async () => {
    try {
      await signInWithGoogle();
      Alert.alert('Success', 'Google account connected successfully');
      // Update the connected accounts state
      setConnectedAccounts(prev => 
        prev.map(account => 
          account.provider === 'google' 
            ? { ...account, isConnected: true, lastUsed: new Date().toISOString().split('T')[0] }
            : account
        )
      );
    } catch (error) {
      Alert.alert('Error', 'Failed to connect Google account. Please try again.');
    }
  };

  // Apple login removed

  const handleDisconnectAccount = (accountId: string) => {
    const account = connectedAccounts.find(acc => acc.id === accountId);
    if (!account) return;

    Alert.alert(
      'Disconnect Account',
      `Are you sure you want to disconnect your ${account.name}? You can reconnect it anytime.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Disconnect',
          style: 'destructive',
          onPress: async () => {
            try {
              await unlinkAccount(account.provider);
              setConnectedAccounts(prev => 
                prev.map(acc => 
                  acc.id === accountId 
                    ? { ...acc, isConnected: false, lastUsed: 'Never' }
                    : acc
                )
              );
              Alert.alert('Success', `${account.name} disconnected successfully`);
            } catch (error) {
              Alert.alert('Error', 'Failed to disconnect account. Please try again.');
            }
          },
        },
      ]
    );
  };

  const getProviderIcon = (provider: string) => {
    switch (provider) {
      case 'google':
        return 'logo-google';
      default:
        return 'person';
    }
  };

  const getProviderColor = (provider: string) => {
    switch (provider) {
      case 'google':
        return '#4285F4';
      default:
        return '#666';
    }
  };

  const AccountItem = ({ account }: { account: ConnectedAccount }) => (
    <View style={styles.accountItem}>
      <View style={styles.accountInfo}>
        <View style={styles.accountHeader}>
          <Ionicons 
            name={getProviderIcon(account.provider)} 
            size={24} 
            color={getProviderColor(account.provider)} 
          />
          <View style={styles.accountDetails}>
            <Text style={styles.accountName}>{account.name}</Text>
            <Text style={styles.accountEmail}>{account.email}</Text>
            <Text style={styles.lastUsed}>Last used: {account.lastUsed}</Text>
          </View>
        </View>
      </View>
      
      <View style={styles.accountActions}>
        {account.isConnected ? (
          <TouchableOpacity
            style={styles.disconnectButton}
            onPress={() => handleDisconnectAccount(account.id)}
          >
            <Text style={styles.disconnectButtonText}>Disconnect</Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            style={styles.connectButton}
            onPress={handleConnectGoogle}
          >
            <Text style={styles.connectButtonText}>Connect</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color="#007AFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Connected Accounts</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Info Section */}
        <View style={styles.infoSection}>
          <View style={styles.infoCard}>
            <Ionicons name="link" size={24} color="#007AFF" />
            <Text style={styles.infoTitle}>Connected Accounts</Text>
            <Text style={styles.infoText}>
              Connect your social accounts for easier sign-in and enhanced features.
            </Text>
          </View>
        </View>

        {/* Connected Accounts */}
        <View style={styles.accountsSection}>
          <Text style={styles.sectionTitle}>Available Accounts</Text>
          
          {connectedAccounts.map((account) => (
            <AccountItem key={account.id} account={account} />
          ))}
        </View>

        {/* Benefits Section */}
        <View style={styles.benefitsSection}>
          <Text style={styles.sectionTitle}>Benefits</Text>
          <View style={styles.benefitsCard}>
            <View style={styles.benefitItem}>
              <Ionicons name="flash" size={16} color="#4CD964" />
              <Text style={styles.benefitText}>Faster sign-in with one tap</Text>
            </View>
            <View style={styles.benefitItem}>
              <Ionicons name="shield-checkmark" size={16} color="#4CD964" />
              <Text style={styles.benefitText}>Enhanced security with two-factor authentication</Text>
            </View>
            <View style={styles.benefitItem}>
              <Ionicons name="sync" size={16} color="#4CD964" />
              <Text style={styles.benefitText}>Automatic data synchronization</Text>
            </View>
            <View style={styles.benefitItem}>
              <Ionicons name="cloud" size={16} color="#4CD964" />
              <Text style={styles.benefitText}>Backup and restore across devices</Text>
            </View>
          </View>
        </View>

        {/* Privacy Notice */}
        <View style={styles.privacySection}>
          <Text style={styles.sectionTitle}>Privacy & Security</Text>
          <View style={styles.privacyCard}>
            <Text style={styles.privacyText}>
              We only access the information you choose to share. Your data remains secure and private.
              You can disconnect accounts at any time without losing your CoreHealth data.
            </Text>
          </View>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F2F2F7',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#fff',
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#E5E5EA',
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1C1C1E',
  },
  content: {
    flex: 1,
  },
  infoSection: {
    padding: 20,
  },
  infoCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    alignItems: 'center',
  },
  infoTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1C1C1E',
    marginTop: 12,
    marginBottom: 8,
  },
  infoText: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    lineHeight: 20,
  },
  accountsSection: {
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: '#666',
    marginBottom: 16,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  accountItem: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  accountInfo: {
    flex: 1,
  },
  accountHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  accountDetails: {
    flex: 1,
  },
  accountName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1C1C1E',
    marginBottom: 4,
  },
  accountEmail: {
    fontSize: 14,
    color: '#666',
    marginBottom: 2,
  },
  lastUsed: {
    fontSize: 12,
    color: '#999',
  },
  accountActions: {
    marginLeft: 12,
  },
  connectButton: {
    backgroundColor: '#007AFF',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
  },
  connectButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  disconnectButton: {
    backgroundColor: '#FF3B30',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
  },
  disconnectButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  benefitsSection: {
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  benefitsCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
  },
  benefitItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 12,
  },
  benefitText: {
    fontSize: 14,
    color: '#666',
    flex: 1,
  },
  privacySection: {
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  privacyCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
  },
  privacyText: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
});

export default ConnectedAccountsScreen; 