import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface PlayerSettings {
  autoplayNextEpisode: boolean;
  showSkipIntro: boolean;
  defaultQuality: 'auto' | '1080p' | '720p' | '480p';
  subtitleSize: 'small' | 'medium' | 'large';
  subtitleColor: string;
  subtitleBackground: boolean;
  videoPreviewHover: boolean;
  animationIntensity: 'full' | 'reduced' | 'minimal';
}

interface PlayerSettingsContextType {
  settings: PlayerSettings;
  updateSetting: <K extends keyof PlayerSettings>(key: K, value: PlayerSettings[K]) => void;
  resetToDefaults: () => void;
}

const defaultSettings: PlayerSettings = {
  autoplayNextEpisode: true,
  showSkipIntro: true,
  defaultQuality: 'auto',
  subtitleSize: 'medium',
  subtitleColor: '#ffffff',
  subtitleBackground: true,
  videoPreviewHover: true,
  animationIntensity: 'full',
};

const PlayerSettingsContext = createContext<PlayerSettingsContextType | undefined>(undefined);

export const usePlayerSettings = () => {
  const context = useContext(PlayerSettingsContext);
  if (!context) {
    throw new Error('usePlayerSettings must be used within a PlayerSettingsProvider');
  }
  return context;
};

interface PlayerSettingsProviderProps {
  children: ReactNode;
}

export const PlayerSettingsProvider: React.FC<PlayerSettingsProviderProps> = ({ children }) => {
  const [settings, setSettings] = useState<PlayerSettings>(defaultSettings);

  // Load settings from localStorage on mount
  useEffect(() => {
    const savedSettings = localStorage.getItem('bingwatch-player-settings');
    if (savedSettings) {
      try {
        const parsed = JSON.parse(savedSettings);
        setSettings({ ...defaultSettings, ...parsed });
      } catch (error) {
        console.warn('Failed to parse player settings from localStorage:', error);
      }
    }
  }, []);

  // Save settings to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('bingwatch-player-settings', JSON.stringify(settings));
  }, [settings]);

  const updateSetting = <K extends keyof PlayerSettings>(key: K, value: PlayerSettings[K]) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  const resetToDefaults = () => {
    setSettings(defaultSettings);
  };

  return (
    <PlayerSettingsContext.Provider value={{ settings, updateSetting, resetToDefaults }}>
      {children}
    </PlayerSettingsContext.Provider>
  );
};