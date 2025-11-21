import { useState, useEffect } from 'react';

export interface ConfettiSettings {
  particleCount: number;
  spread: number;
  startVelocity: number;
  scalar: number;
  colors: string[];
  shapes: ('square' | 'circle' | 'star')[];
  emojis: string[];
  useEmojis: boolean;
  customImages: string[]; // Base64 strings
  useCustomImages: boolean;
}

const DEFAULT_SETTINGS: ConfettiSettings = {
  particleCount: 100,
  spread: 70,
  startVelocity: 45,
  scalar: 1.0,
  colors: ['#26ccff', '#a25afd', '#ff5e7e', '#88ff5a', '#fcff42', '#ffa62d', '#ff36ff'],
  shapes: ['square', 'circle'],
  emojis: ['🎉', '🥳', '🚀'],
  useEmojis: false,
  customImages: [],
  useCustomImages: false,
};

const STORAGE_KEY = 'desktop-celebrator-settings';

export const useSettings = () => {
  const [settings, setSettings] = useState<ConfettiSettings>(() => {
    try {
      const item = localStorage.getItem(STORAGE_KEY);
      return item ? { ...DEFAULT_SETTINGS, ...JSON.parse(item) } : DEFAULT_SETTINGS;
    } catch (error) {
      console.error('Error reading settings from localStorage:', error);
      return DEFAULT_SETTINGS;
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
      // Dispatch a custom event so other windows/components can react immediately if needed
      window.dispatchEvent(new Event('storage'));
    } catch (error) {
      console.error('Error saving settings to localStorage:', error);
    }
  }, [settings]);

  // Listen for changes from other windows/tabs
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === STORAGE_KEY && e.newValue) {
        setSettings({ ...DEFAULT_SETTINGS, ...JSON.parse(e.newValue) });
      }
    };

    window.addEventListener('storage', handleStorageChange);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);

  const updateSettings = (newSettings: Partial<ConfettiSettings>) => {
    setSettings(prev => ({ ...prev, ...newSettings }));
  };

  const resetSettings = () => {
    setSettings(DEFAULT_SETTINGS);
  };

  return { settings, updateSettings, resetSettings };
};
