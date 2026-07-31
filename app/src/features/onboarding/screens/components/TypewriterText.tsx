import React, { useState, useEffect } from "react";
import { Text } from "react-native";

interface TypewriterTextProps {
  text: string;
  speed?: number;
  onComplete?: () => void;
  style?: object;
}

const TypewriterText: React.FC<TypewriterTextProps> = ({
  text,
  speed = 60,
  onComplete,
  style,
}) => {
  const [displayedText, setDisplayedText] = useState("");
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    if (currentIndex < text.length) {
      const timer = setTimeout(() => {
        setDisplayedText((prev) => prev + text[currentIndex]);
        setCurrentIndex((prev) => prev + 1);
      }, speed);
      return () => clearTimeout(timer);
    } else if (onComplete) {
      onComplete();
    }
  }, [currentIndex, text, speed, onComplete]);

  useEffect(() => {
    const cursorTimer = setInterval(() => {}, speed * 0.5);
    return () => clearInterval(cursorTimer);
  }, [speed]);

  return <Text style={style}>{displayedText}</Text>;
};

export default TypewriterText;
