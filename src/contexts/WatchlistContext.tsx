import React, { createContext, useContext, useState, useEffect } from 'react';
import { toast } from "@/hooks/use-toast";

interface WatchlistItem {
  id: number;
  title: string;
  posterPath: string;
  mediaType: 'movie' | 'tv';
}

interface WatchlistContextType {
  watchlist: WatchlistItem[];
  addToWatchlist: (item: WatchlistItem) => void;
  removeFromWatchlist: (id: number) => void;
  isInWatchlist: (id: number) => boolean;
}

const WatchlistContext = createContext<WatchlistContextType | undefined>(undefined);

export function WatchlistProvider({ children }: { children: React.ReactNode }) {
  const [watchlist, setWatchlist] = useState<WatchlistItem[]>(() => {
    const saved = localStorage.getItem('watchlist');
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => {
    localStorage.setItem('watchlist', JSON.stringify(watchlist));
  }, [watchlist]);

  const addToWatchlist = (item: WatchlistItem) => {
    setWatchlist((prev) => {
      if (prev.some((i) => i.id === item.id)) {
        toast({
          title: "Already in Watchlist",
          description: `${item.title} is already in your watchlist`,
          variant: "default",
        });
        return prev;
      }
      toast({
        title: "Added to Watchlist",
        description: `${item.title} has been added to your watchlist`,
        variant: "default",
      });
      return [...prev, item];
    });
  };

  const removeFromWatchlist = (id: number) => {
    setWatchlist((prev) => {
      const item = prev.find((i) => i.id === id);
      if (item) {
        toast({
          title: "Removed from Watchlist",
          description: `${item.title} has been removed from your watchlist`,
          variant: "default",
        });
      }
      return prev.filter((item) => item.id !== id);
    });
  };

  const isInWatchlist = (id: number) => {
    return watchlist.some((item) => item.id === id);
  };

  return (
    <WatchlistContext.Provider
      value={{ watchlist, addToWatchlist, removeFromWatchlist, isInWatchlist }}
    >
      {children}
    </WatchlistContext.Provider>
  );
}

export function useWatchlist() {
  const context = useContext(WatchlistContext);
  if (context === undefined) {
    throw new Error('useWatchlist must be used within a WatchlistProvider');
  }
  return context;
}