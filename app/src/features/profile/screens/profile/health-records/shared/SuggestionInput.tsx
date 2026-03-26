import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity } from 'react-native';
import { formModalStyles as s } from './formModalStyles';

interface SuggestionInputProps {
  value: string;
  onChangeText: (text: string) => void;
  placeholder: string;
  suggestions: readonly string[];
}

const SuggestionInput: React.FC<SuggestionInputProps> = ({ value, onChangeText, placeholder, suggestions }) => {
  const [showSuggestions, setShowSuggestions] = useState(false);

  const filtered = showSuggestions && value.length > 0
    ? suggestions.filter(item => item.toLowerCase().includes(value.toLowerCase())).slice(0, 5)
    : [];

  return (
    <>
      <TextInput
        style={s.input}
        value={value}
        onChangeText={(t) => { onChangeText(t); setShowSuggestions(t.length > 0); }}
        placeholder={placeholder}
        placeholderTextColor="#8E8E93"
      />
      {filtered.length > 0 && (
        <View style={s.suggestions}>
          {filtered.map((item, i) => (
            <TouchableOpacity key={i} style={s.suggestionItem} onPress={() => { onChangeText(item); setShowSuggestions(false); }}>
              <Text style={s.suggestionText}>{item}</Text>
            </TouchableOpacity>
          ))}
        </View>
      )}
    </>
  );
};

export default SuggestionInput;
