import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';

interface Props {
  healthScore?: { overall?: number } | null;
  biomarkerCount?: number;
  onSelect: (question: string) => void;
}

const QuickQuestions: React.FC<Props> = ({ healthScore, biomarkerCount, onSelect }) => {
  const baseQuestions = [
    'How is my overall health?',
    'What should I focus on improving?',
    'Any concerning trends in my data?',
  ];

  const personalizedQuestions: string[] = [];
  if (healthScore?.overall && healthScore.overall < 80) {
    personalizedQuestions.push('How can I improve my health score?');
  }
  if (biomarkerCount && biomarkerCount > 0) {
    personalizedQuestions.push('Explain my latest biomarker results');
  }

  const allQuestions = [...baseQuestions, ...personalizedQuestions].slice(0, 5);

  return (
    <View style={styles.quickQuestionsContainer}>
      <Text style={styles.quickQuestionsTitle}>Suggested Questions:</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        {allQuestions.map((question, index) => (
          <TouchableOpacity
            key={index}
            style={styles.quickQuestionButton}
            onPress={() => onSelect(question)}
          >
            <Text style={styles.quickQuestionText}>{question}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  quickQuestionsContainer: {
    padding: 16,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#E5E5EA',
  },
  quickQuestionsTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1C1C1E',
    marginBottom: 12,
  },
  quickQuestionButton: {
    backgroundColor: '#F0F8FF',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 16,
    marginRight: 8,
    borderWidth: 1,
    borderColor: '#3AABF020',
  },
  quickQuestionText: {
    fontSize: 12,
    color: '#3AABF0',
    fontWeight: '500',
  },
});

export default QuickQuestions;
