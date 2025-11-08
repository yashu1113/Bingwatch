import { createContext, useContext, ReactNode } from 'react';
import { useLocalStorage } from '@/hooks/use-local-storage';

export interface WatchProgress {
  id: number;
  title: string;
  posterPath: string;
  mediaType: 'movie' | 'tv';
  progress: number; // 0-100
  lastWatched: string;
  runtime?: number;
  currentTime?: number;
}

interface ContinueWatchingContextType {
  watchProgress: WatchProgress[];
  updateProgress: (item: WatchProgress) => void;
  removeProgress: (id: number) => void;
  getProgress: (id: number) => WatchProgress | undefined;
}

const ContinueWatchingContext = createContext<ContinueWatchingContextType | undefined>(undefined);

export const useContinueWatching = () => {
  const context = useContext(ContinueWatchingContext);
  if (!context) {
    throw new Error('useContinueWatching must be used within ContinueWatchingProvider');
  }
  return context;
};

export const ContinueWatchingProvider = ({ children }: { children: ReactNode }) => {
  const [watchProgress, setWatchProgress] = useLocalStorage<WatchProgress[]>('continue-watching', []);

  const updateProgress = (item: WatchProgress) => {
    setWatchProgress(prev => {
      const existing = prev.findIndex(p => p.id === item.id);
      if (existing >= 0) {
        const updated = [...prev];
        updated[existing] = { ...item, lastWatched: new Date().toISOString() };
        return updated.sort((a, b) => new Date(b.lastWatched).getTime() - new Date(a.lastWatched).getTime());
      }
      return [{ ...item, lastWatched: new Date().toISOString() }, ...prev].slice(0, 20);
    });
  };

  const removeProgress = (id: number) => {
    setWatchProgress(prev => prev.filter(p => p.id !== id));
  };

  const getProgress = (id: number) => {
    return watchProgress.find(p => p.id === id);
  };

  return (
    <ContinueWatchingContext.Provider value={{ watchProgress, updateProgress, removeProgress, getProgress }}>
      {children}
    </ContinueWatchingContext.Provider>
  );
};
