import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Animated } from 'react-native';
import { Ionicons, FontAwesome5 } from '@expo/vector-icons';
import ProfilePicturePicker from '../../../../../../shared/components/profile/ProfilePicturePicker';
import { AVATAR_LARGE } from '../useProfileDetails';

interface ScrollableProfileHeaderProps {
  avatarScale: Animated.AnimatedInterpolation<number>;
  avatarTranslateY: Animated.AnimatedInterpolation<number>;
  largeNameOpacity: Animated.AnimatedInterpolation<number>;
  largeNameTranslateY: Animated.AnimatedInterpolation<number>;
  largeUsernameOpacity: Animated.AnimatedInterpolation<number>;
  largeUsernameTranslateY: Animated.AnimatedInterpolation<number>;
  nameSize: Animated.AnimatedInterpolation<number>;
  usernameSize: Animated.AnimatedInterpolation<number>;
  userName: string;
  userUsername: string;
  profileCompletion: number;
  photoURL?: string;
  userInitial: string;
  onPhotoSelected: (uri: string) => void;
  onCommunityPress: () => void;
  onSettingsPress: () => void;
}

const ScrollableProfileHeader: React.FC<ScrollableProfileHeaderProps> = ({
  avatarScale,
  avatarTranslateY,
  largeNameOpacity,
  largeNameTranslateY,
  largeUsernameOpacity,
  largeUsernameTranslateY,
  nameSize,
  usernameSize,
  userName,
  userUsername,
  profileCompletion,
  photoURL,
  userInitial,
  onPhotoSelected,
  onCommunityPress,
  onSettingsPress,
}) => (
  <View style={styles.profileHeader}>
    <TouchableOpacity onPress={onCommunityPress} style={styles.headerCommunityButton}>
      <FontAwesome5 name="users" size={22} color="#0A84FF" solid />
    </TouchableOpacity>
    <TouchableOpacity onPress={onSettingsPress} style={styles.headerSettingsButton}>
      <Ionicons name="settings" size={24} color="#0A84FF" />
    </TouchableOpacity>

    <Animated.View
      style={[
        styles.animatedAvatarContainer,
        {
          transform: [
            { scale: avatarScale },
            { translateY: avatarTranslateY },
          ],
        },
      ]}
    >
      <ProfilePicturePicker
        currentPhotoURL={photoURL}
        onPhotoSelected={onPhotoSelected}
        size={AVATAR_LARGE}
        userInitial={userInitial}
        progressPercent={profileCompletion}
      />
    </Animated.View>

    <Animated.View
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 2,
        opacity: largeNameOpacity,
        transform: [{ translateY: largeNameTranslateY }],
      }}
    >
      <Animated.Text style={[styles.profileName, { fontSize: nameSize }]}>
        {userName}
      </Animated.Text>
      {profileCompletion >= 100 && (
        <Ionicons name="checkmark-circle" size={22} color="#34C759" style={{ marginLeft: 6 }} />
      )}
    </Animated.View>

    <Animated.Text
      style={[
        styles.profileEmail,
        {
          marginTop: 2,
          opacity: largeUsernameOpacity,
          fontSize: usernameSize,
          transform: [{ translateY: largeUsernameTranslateY }],
        },
      ]}
    >
      {userUsername}
    </Animated.Text>
  </View>
);

const styles = StyleSheet.create({
  profileHeader: {
    alignItems: 'center',
    backgroundColor: '#000000',
    paddingTop: 66,
    paddingBottom: 8,
    marginBottom: 0,
    elevation: 0,
  },
  animatedAvatarContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  headerSettingsButton: {
    position: 'absolute',
    right: 16,
    top: 58,
    padding: 8,
  },
  headerCommunityButton: {
    position: 'absolute',
    left: 16,
    top: 58,
    padding: 8,
  },
  profileName: {
    color: '#fff',
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 2,
  },
  profileEmail: {
    color: '#aaa',
    fontSize: 15,
    marginBottom: 8,
  },
});

export default ScrollableProfileHeader;
