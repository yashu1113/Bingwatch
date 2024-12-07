import { useState, useEffect, useCallback } from 'react';
import { getTrending } from '../services/api';
import { MediaGrid } from './MediaGrid';
import { useInfiniteScroll } from '../hooks/useInfiniteScroll';
import { findDuplicateIds } from '../lib/utils';

interface TrendingSectionProps {
  mediaType: 'movie' | 'tv';
  title: string;
}

export function TrendingSection({ mediaType, title }: TrendingSectionProps) {
  const [items, setItems] = useState<any[]>([]);
  const [page, setPage] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(true);

  const fetchItems = useCallback(async () => {
    try {
      const data = await getTrending(mediaType);
      
      // Filter out any duplicate items before adding to state
      const newItems = data.results.filter(
        (newItem: any) => !items.some(existingItem => existingItem.id === newItem.id)
      );
      
      setItems(prev => {
        const updatedItems = [...prev, ...newItems];
        
        // Check for duplicates in development
        if (process.env.NODE_ENV === 'development') {
          const duplicates = findDuplicateIds(updatedItems);
          if (duplicates.length > 0) {
            console.warn('Duplicate IDs found:', duplicates);
          }
        }
        
        return updatedItems;
      });
      
      setHasMore(data.page < data.total_pages);
      setPage(p => p + 1);
    } catch (err) {
      setError('Failed to fetch trending content');
    } finally {
      setIsLoading(false);
    }
  }, [mediaType, page, items]);

  useEffect(() => {
    fetchItems();
  }, []);

  const { isFetching } = useInfiniteScroll(() => {
    if (hasMore) {
      fetchItems();
    }
  });

  if (error) {
    return (
      <div className="text-center text-red-400 py-8">
        <p>{error}</p>
      </div>
    );
  }

  return (
    <section className="space-y-4">
      <h2 className="text-2xl font-bold">{title}</h2>
      <MediaGrid items={items} />
      {(isLoading || isFetching) && (
        <div className="flex justify-center py-4">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-white"></div>
        </div>
      )}
    </section>
  );
}