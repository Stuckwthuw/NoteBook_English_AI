import { type AppSettings, DEFAULT_SETTINGS } from './types';

const SETTINGS_KEY = 'lexicon-settings';

export function getSettings(): AppSettings {
  if (typeof window === 'undefined') return DEFAULT_SETTINGS;
  
  try {
    const raw = localStorage.getItem(SETTINGS_KEY);
    if (!raw) return DEFAULT_SETTINGS;
    return { ...DEFAULT_SETTINGS, ...JSON.parse(raw) };
  } catch {
    return DEFAULT_SETTINGS;
  }
}

export function saveSettings(settings: Partial<AppSettings>): AppSettings {
  const current = getSettings();
  const updated = { ...current, ...settings };
  localStorage.setItem(SETTINGS_KEY, JSON.stringify(updated));
  return updated;
}

export function getTheme(): 'light' | 'dark' {
  const settings = getSettings();
  if (settings.theme === 'system') {
    if (typeof window === 'undefined') return 'light';
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  }
  return settings.theme;
}
