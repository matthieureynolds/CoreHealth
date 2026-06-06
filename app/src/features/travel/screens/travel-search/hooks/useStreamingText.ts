import { useState, useEffect, useRef } from 'react';

/**
 * Streams text word-by-word with a natural cadence.
 * Returns the partially-revealed string while streaming, then the full text once done.
 */
export function useStreamingText(
  text: string,
  trigger: boolean,
  options?: { delayMin?: number; delayMax?: number; startDelay?: number }
) {
  const { delayMin = 20, delayMax = 55, startDelay = 300 } = options ?? {};
  const [displayed, setDisplayed] = useState('');
  const [isStreaming, setIsStreaming] = useState(false);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const prevTriggerRef = useRef(false);

  useEffect(() => {
    // Only start streaming on rising edge of trigger
    if (trigger && !prevTriggerRef.current && text) {
      setDisplayed('');
      setIsStreaming(true);

      const words = text.split(' ');
      let i = 0;
      let current = '';

      const streamNext = () => {
        if (i < words.length) {
          current += (i ? ' ' : '') + words[i];
          setDisplayed(current);
          i++;
          timeoutRef.current = setTimeout(streamNext, delayMin + Math.random() * (delayMax - delayMin));
        } else {
          setIsStreaming(false);
        }
      };

      timeoutRef.current = setTimeout(streamNext, startDelay);
    }

    // Reset when trigger goes false
    if (!trigger) {
      setDisplayed('');
      setIsStreaming(false);
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    }

    prevTriggerRef.current = trigger;

    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, [trigger, text]);

  return { displayed, isStreaming };
}
