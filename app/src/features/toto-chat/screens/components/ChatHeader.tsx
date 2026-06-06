import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Svg, { Line, Path } from 'react-native-svg';

interface ChatHeaderProps {
  onMenuPress: () => void;
  isIncognito: boolean;
  onIncognitoToggle: () => void;
}

const ChatHeader: React.FC<ChatHeaderProps> = ({
  onMenuPress,
  isIncognito,
  onIncognitoToggle,
}) => (
  <View style={{
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 60,
    paddingBottom: 12,
  }}>
    {/* Menu button — glass pill with 2-bar icon */}
    <TouchableOpacity
      onPress={onMenuPress}
      style={{
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: 'rgba(255, 255, 255, 0.08)',
        borderWidth: 0.5,
        borderColor: 'rgba(255, 255, 255, 0.15)',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <View style={{ gap: 5 }}>
        <View style={{ width: 18, height: 1.5, backgroundColor: '#fff', borderRadius: 1 }} />
        <View style={{ width: 18, height: 1.5, backgroundColor: '#fff', borderRadius: 1 }} />
      </View>
    </TouchableOpacity>

    <View style={{ width: 44 }} />

    {/* Incognito toggle */}
    <TouchableOpacity
      onPress={onIncognitoToggle}
      style={{
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: isIncognito ? 'rgba(255, 255, 255, 0.15)' : 'rgba(255, 255, 255, 0.08)',
        borderWidth: 0.5,
        borderColor: isIncognito ? 'rgba(255, 255, 255, 0.25)' : 'rgba(255, 255, 255, 0.15)',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      {isIncognito ? (
        <Svg width={18} height={18} viewBox="0 0 24 24" fill="none">
          <Line x1="6" y1="6" x2="18" y2="18" stroke="#fff" strokeWidth={2.5} strokeLinecap="round" />
          <Line x1="18" y1="6" x2="6" y2="18" stroke="#fff" strokeWidth={2.5} strokeLinecap="round" />
        </Svg>
      ) : (
        <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
          <Path d="M 17.5 3.5 A 9.5 9.5 0 1 0 20.5 6.5" stroke="#fff" strokeWidth={2} strokeLinecap="round" fill="none" />
          <Path d="M10 14 L16 8" stroke="#fff" strokeWidth={2.2} strokeLinecap="round" />
          <Path d="M10 14 L8.5 15.5" stroke="#fff" strokeWidth={1.5} strokeLinecap="round" />
        </Svg>
      )}
    </TouchableOpacity>

  </View>
);

export default ChatHeader;
