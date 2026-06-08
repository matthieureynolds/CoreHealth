import React from 'react';
import { View, Text, Switch, StyleSheet } from 'react-native';

export interface PlanStep { order: number; title: string; details: string; toggleKey: string }
export interface PlanModel {
  steps: PlanStep[];
  checkins: { frequency: 'daily'|'twice_daily'; questions: string[] };
  safety: { urgentCareCriteria: string[] };
}

interface Props {
  plan: PlanModel;
  toggleState: Record<string, boolean>;
  onToggle: (toggleKey: string, completed: boolean) => void;
}

export const SymptomPlan: React.FC<Props> = ({ plan, toggleState, onToggle }) => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Recovery Plan</Text>
      {plan.steps.sort((a, b) => a.order - b.order).map(step => (
        <View key={step.toggleKey} style={styles.stepRow}>
          <View style={{ flex: 1 }}>
            <Text style={styles.stepTitle}>{step.title}</Text>
            <Text style={styles.stepDetails}>{step.details}</Text>
          </View>
          <Switch
            value={!!toggleState[step.toggleKey]}
            onValueChange={(v) => {
              onToggle(step.toggleKey, v);
            }}
          />
        </View>
      ))}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Daily Check-ins ({plan.checkins.frequency})</Text>
        {plan.checkins.questions.map((q, i) => (
          <Text key={i} style={styles.question}>• {q}</Text>
        ))}
      </View>
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>When to seek urgent care</Text>
        {plan.safety.urgentCareCriteria.map((c, i) => (
          <Text key={i} style={styles.urgent}>• {c}</Text>
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#111827',
    margin: 16,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#1F2937',
  },
  title: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 12,
  },
  stepRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#1F2937',
  },
  stepTitle: {
    color: '#E5E7EB',
    fontWeight: '700',
    marginBottom: 2,
  },
  stepDetails: {
    color: '#9CA3AF',
    fontSize: 12,
  },
  section: {
    marginTop: 12,
  },
  sectionTitle: {
    color: '#D1D5DB',
    fontWeight: '700',
    marginBottom: 6,
  },
  question: {
    color: '#D1D5DB',
    fontSize: 13,
  },
  urgent: {
    color: '#F87171',
    fontSize: 13,
  },
});


