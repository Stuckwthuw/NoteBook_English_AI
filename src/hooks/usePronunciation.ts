'use client';

import { useState, useCallback, useEffect } from 'react';

export function usePronunciation() {
  const [speaking, setSpeaking] = useState(false);
  const [accent, setAccent] = useState<'US' | 'UK'>('US');
  const [available, setAvailable] = useState(true);

  useEffect(() => {
    if (typeof window !== 'undefined' && !('speechSynthesis' in window)) {
      setAvailable(false);
    }
  }, []);

  const speak = useCallback(
    (text: string, accentOverride?: 'US' | 'UK') => {
      if (!available) return;

      window.speechSynthesis.cancel();

      const utterance = new SpeechSynthesisUtterance(text);
      const selectedAccent = accentOverride || accent;

      utterance.lang = selectedAccent === 'US' ? 'en-US' : 'en-GB';
      utterance.rate = 0.85;
      utterance.pitch = 1;

      // Try to find the best voice
      const voices = window.speechSynthesis.getVoices();
      const preferredVoice = voices.find(
        (v) =>
          v.lang === utterance.lang &&
          (v.name.includes('Google') || v.name.includes('Microsoft') || v.name.includes('Natural'))
      );
      if (preferredVoice) {
        utterance.voice = preferredVoice;
      } else {
        const fallback = voices.find((v) => v.lang.startsWith(selectedAccent === 'US' ? 'en-US' : 'en-GB'));
        if (fallback) utterance.voice = fallback;
      }

      utterance.onstart = () => setSpeaking(true);
      utterance.onend = () => setSpeaking(false);
      utterance.onerror = () => setSpeaking(false);

      window.speechSynthesis.speak(utterance);
    },
    [accent, available]
  );

  const stop = useCallback(() => {
    window.speechSynthesis.cancel();
    setSpeaking(false);
  }, []);

  return { speak, stop, speaking, accent, setAccent, available };
}
