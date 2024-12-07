import { useState, useEffect } from 'react';

interface WatchlistItem {
  id: number;
  title: string;
  posterPath: string;
  mediaType: 'movie' | 'tv';
  rating: number;
}

export function useWatchlist() {
  const [watchlist, setWatchlist] = useState<WatchlistItem[]>(() => {
    const saved = localStorage.getItem('watchlist');
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => {
    localStorage.setItem('watchlist', JSON.stringify(watchlist));
  }, [watchlist]);

  const addToWatchlist = (item: WatchlistItem) => {
    setWatchlist((prev) => {
      if (prev.some((i) => i.id === item.id)) return prev;
      return [...prev, item];
    });
  };

  const removeFromWatchlist = (id: number) => {
    setWatchlist((prev) => prev.filter((item) => item.id !== id));
  };

  const isInWatchlist = (id: number) => {
    return watchlist.some((item) => item.id === id);
  };

  return { watchlist, addToWatchlist, removeFromWatchlist, isInWatchlist };
}