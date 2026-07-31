import { useState, useRef, useEffect } from "react";

export function useTypewriter(cities: string[]) {
  const [typedCityIndex, setTypedCityIndex] = useState(0);
  const [typedCityText, setTypedCityText] = useState("");
  const typingTimeoutRef = useRef<any>(null);

  useEffect(() => {
    if (cities.length === 0) return;
    const fullText = cities[typedCityIndex] || "Tokyo, Japan";
    let charIndex = 0;
    setTypedCityText("");
    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    const typeNext = () => {
      charIndex += 1;
      setTypedCityText(fullText.slice(0, charIndex));
      if (charIndex < fullText.length) {
        typingTimeoutRef.current = setTimeout(typeNext, 80);
      } else {
        typingTimeoutRef.current = setTimeout(() => {
          setTypedCityIndex((prev) => (prev + 1) % cities.length);
        }, 1200);
      }
    };
    typingTimeoutRef.current = setTimeout(typeNext, 300);
    return () => {
      if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    };
  }, [typedCityIndex, cities.length]);

  return typedCityText;
}
