import { useCallback, useMemo } from 'react';
import * as Speech from 'expo-speech';
import { useAuth } from '../providers/AuthProvider';

export const DEFAULT_ACCESSIBILITY = {
  textSize: 'normal',
  readAloud: true,
  slowSpeech: false,
};

export const TEXT_SIZE_OPTIONS = [
  { id: 'normal', label: 'सामान्य', multiplier: 1 },
  { id: 'large', label: 'बड़ा', multiplier: 1.2 },
  { id: 'extra_large', label: 'बहुत बड़ा', multiplier: 1.4 },
];

const getTextMultiplier = (textSize) => (
  TEXT_SIZE_OPTIONS.find((option) => option.id === textSize)?.multiplier || 1
);

export function useAccessibility() {
  const { profile, updateUserProfile } = useAuth();

  const settings = useMemo(
    () => ({ ...DEFAULT_ACCESSIBILITY, ...(profile?.accessibility || {}) }),
    [profile?.accessibility],
  );

  const scaleText = useCallback(
    (fontSize) => Math.round(fontSize * getTextMultiplier(settings.textSize)),
    [settings.textSize],
  );

  const updateAccessibility = useCallback(async (updates) => {
    const nextSettings = { ...settings, ...updates };
    await updateUserProfile({ accessibility: nextSettings });
    return nextSettings;
  }, [settings, updateUserProfile]);

  const speak = useCallback((message, options = {}) => {
    Speech.stop();
    Speech.speak(message, {
      language: profile?.language || 'hi-IN',
      rate: settings.slowSpeech ? 0.65 : 0.82,
      pitch: 1,
      ...options,
    });
  }, [profile?.language, settings.slowSpeech]);

  return {
    settings,
    scaleText,
    updateAccessibility,
    speak,
    stopSpeaking: Speech.stop,
  };
}
