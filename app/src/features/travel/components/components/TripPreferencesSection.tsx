import React from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface TripPrefs {
  sleep_window_local: { start: string; end: string };
  chronotype: 'morning' | 'neutral' | 'evening';
  caffeine: boolean;
  melatonin: boolean;
  naps: boolean;
}

interface TripPreferencesSectionProps {
  prefs: TripPrefs;
  planStyle: 'gentle' | 'aggressive';
  onUpdatePrefs: (updates: Partial<TripPrefs>) => void;
  onUpdatePlanStyle: (style: 'gentle' | 'aggressive') => void;
}

const TripPreferencesSection: React.FC<TripPreferencesSectionProps> = ({
  prefs,
  planStyle,
  onUpdatePrefs,
  onUpdatePlanStyle,
}) => (
  <View style={styles.section}>
    <Text style={styles.sectionTitle}>Personalization</Text>

    {/* Sleep Window */}
    <View style={styles.preferenceRow}>
      <Text style={styles.label}>Usual Sleep Window</Text>
      <View style={styles.row}>
        <View style={styles.halfWidth}>
          <TextInput
            style={styles.input}
            value={prefs.sleep_window_local.start}
            onChangeText={(text) =>
              onUpdatePrefs({ sleep_window_local: { ...prefs.sleep_window_local, start: text } })
            }
            placeholder="23:30"
            placeholderTextColor="#9ca3af"
          />
        </View>
        <View style={styles.halfWidth}>
          <TextInput
            style={styles.input}
            value={prefs.sleep_window_local.end}
            onChangeText={(text) =>
              onUpdatePrefs({ sleep_window_local: { ...prefs.sleep_window_local, end: text } })
            }
            placeholder="07:00"
            placeholderTextColor="#9ca3af"
          />
        </View>
      </View>
    </View>

    {/* Chronotype */}
    <View style={styles.preferenceRow}>
      <Text style={styles.label}>Chronotype</Text>
      <View style={styles.chronotypeContainer}>
        {(['morning', 'neutral', 'evening'] as const).map((type) => (
          <TouchableOpacity
            key={type}
            style={[
              styles.chronotypeButton,
              prefs.chronotype === type && styles.activeChronotypeButton,
            ]}
            onPress={() => onUpdatePrefs({ chronotype: type })}
          >
            <Text
              style={[
                styles.chronotypeText,
                prefs.chronotype === type && styles.activeChronotypeText,
              ]}
            >
              {type.charAt(0).toUpperCase() + type.slice(1)}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>

    {/* Plan Style */}
    <View style={styles.preferenceRow}>
      <Text style={styles.label}>Adjustment Style</Text>
      <View style={styles.styleContainer}>
        {(['gentle', 'aggressive'] as const).map((style) => (
          <TouchableOpacity
            key={style}
            style={[styles.styleButton, planStyle === style && styles.activeStyleButton]}
            onPress={() => onUpdatePlanStyle(style)}
          >
            <Text style={[styles.styleText, planStyle === style && styles.activeStyleText]}>
              {style.charAt(0).toUpperCase() + style.slice(1)}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>

    {/* Guidance Toggles */}
    <View style={styles.preferenceRow}>
      <Text style={styles.label}>Guidance Options</Text>
      {(
        [
          { key: 'caffeine' as const, label: 'Caffeine guidance' },
          { key: 'melatonin' as const, label: 'Melatonin guidance' },
          { key: 'naps' as const, label: 'Nap suggestions' },
        ] as const
      ).map(({ key, label }) => (
        <TouchableOpacity
          key={key}
          style={styles.toggleRow}
          onPress={() => onUpdatePrefs({ [key]: !prefs[key] })}
        >
          <Text style={styles.toggleLabel}>{label}</Text>
          <Ionicons
            name={prefs[key] ? 'checkmark-circle' : 'ellipse-outline'}
            size={20}
            color={prefs[key] ? '#059669' : '#d1d5db'}
          />
        </TouchableOpacity>
      ))}
    </View>
  </View>
);

const styles = StyleSheet.create({
  section: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 16,
  },
  row: {
    flexDirection: 'row',
    gap: 12,
  },
  halfWidth: {
    flex: 1,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    color: '#374151',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    fontSize: 16,
    backgroundColor: 'white',
  },
  preferenceRow: {
    marginBottom: 20,
  },
  chronotypeContainer: {
    flexDirection: 'row',
    gap: 8,
  },
  chronotypeButton: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#d1d5db',
    alignItems: 'center',
  },
  activeChronotypeButton: {
    backgroundColor: '#059669',
    borderColor: '#059669',
  },
  chronotypeText: {
    fontSize: 14,
    color: '#6b7280',
    fontWeight: '500',
  },
  activeChronotypeText: {
    color: 'white',
    fontWeight: '600',
  },
  styleContainer: {
    flexDirection: 'row',
    gap: 8,
  },
  styleButton: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#d1d5db',
    alignItems: 'center',
  },
  activeStyleButton: {
    backgroundColor: '#059669',
    borderColor: '#059669',
  },
  styleText: {
    fontSize: 14,
    color: '#6b7280',
    fontWeight: '500',
  },
  activeStyleText: {
    color: 'white',
    fontWeight: '600',
  },
  toggleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
  },
  toggleLabel: {
    fontSize: 16,
    color: '#374151',
  },
});

export default TripPreferencesSection;
