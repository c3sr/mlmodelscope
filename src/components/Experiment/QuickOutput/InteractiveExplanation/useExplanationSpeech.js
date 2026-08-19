import { useCallback, useEffect, useRef, useState } from "react";

export default function useExplanationSpeech() {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const utteranceRef = useRef(null);
  const isSupported = typeof window !== "undefined" &&
    typeof window.speechSynthesis !== "undefined" &&
    typeof window.speechSynthesis.speak === "function" &&
    typeof window.speechSynthesis.cancel === "function" &&
    typeof window.SpeechSynthesisUtterance === "function";

  const stop = useCallback(() => {
    if (!isSupported) return;
    utteranceRef.current = null;
    window.speechSynthesis.cancel();
    setIsSpeaking(false);
  }, [isSupported]);

  const speak = useCallback((text) => {
    if (!isSupported || !text?.trim()) return;

    stop();
    const utterance = new window.SpeechSynthesisUtterance(text);
    utteranceRef.current = utterance;
    utterance.onend = () => {
      if (utteranceRef.current === utterance) {
        utteranceRef.current = null;
        setIsSpeaking(false);
      }
    };
    utterance.onerror = utterance.onend;

    try {
      setIsSpeaking(true);
      window.speechSynthesis.speak(utterance);
    } catch {
      utteranceRef.current = null;
      setIsSpeaking(false);
    }
  }, [isSupported, stop]);

  useEffect(() => () => {
    if (isSupported) window.speechSynthesis.cancel();
    utteranceRef.current = null;
  }, [isSupported]);

  return { isSupported, isSpeaking, speak, stop };
}
