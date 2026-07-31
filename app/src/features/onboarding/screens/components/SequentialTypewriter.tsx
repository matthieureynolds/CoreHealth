import React, { useState, useCallback } from "react";
import { View, StyleSheet } from "react-native";
import TypewriterText from "./TypewriterText";

interface SequentialTypewriterProps {
  lines: string[];
  onAllComplete: () => void;
}

const SequentialTypewriter: React.FC<SequentialTypewriterProps> = ({
  lines,
  onAllComplete,
}) => {
  const [currentLineIndex, setCurrentLineIndex] = useState(0);
  const [completedLines, setCompletedLines] = useState<number[]>([]);

  const handleLineComplete = useCallback(() => {
    setCompletedLines((prev) => [...prev, currentLineIndex]);
    if (currentLineIndex < lines.length - 1) {
      setTimeout(() => {
        setCurrentLineIndex((prev) => prev + 1);
      }, 300);
    } else {
      setTimeout(() => {
        onAllComplete();
      }, 1000);
    }
  }, [currentLineIndex, lines.length, onAllComplete]);

  return (
    <View style={styles.typewriterContainer}>
      {lines.map((line, index) => (
        <View key={index} style={styles.typewriterLine}>
          {index <= currentLineIndex && (
            <TypewriterText
              text={line}
              speed={60}
              onComplete={
                index === currentLineIndex ? handleLineComplete : undefined
              }
              style={styles.typewriterText}
            />
          )}
        </View>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  typewriterContainer: {
    alignItems: "center",
    marginBottom: 60,
  },
  typewriterLine: {
    height: 60,
    justifyContent: "center",
    alignItems: "center",
  },
  typewriterText: {
    fontSize: 32,
    fontWeight: "600",
    color: "#000",
    textAlign: "center",
    paddingHorizontal: 20,
  },
});

export default SequentialTypewriter;
