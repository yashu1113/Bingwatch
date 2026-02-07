import { useState, useEffect, useRef } from 'react';
import { useQuery } from '@tanstack/react-query';
import { getIndianContent } from '@/services/tmdb';
import { MediaGrid } from '@/components/MediaGrid';
import { Button } from '@/components/ui/button';

export const IndianSection = () => {
  const [mediaType, setMediaType] = useState<'movie' | 'tv'>('movie');
  const [page, setPage] = useState(1);
  const sectionRef = useRef<HTMLElement>(null);

  // Prefetch both types for instant switching
  const { data: movieData, isLoading: movieLoading } = useQuery({
    queryKey: ['indian-content', 'movie', page],
    queryFn: () => getIndianContent('movie', page),
    placeholderData: (previousData) => previousData,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  const { data: tvData, isLoading: tvLoading } = useQuery({
    queryKey: ['indian-content', 'tv', page],
    queryFn: () => getIndianContent('tv', page),
    placeholderData: (previousData) => previousData,
    staleTime: 5 * 60 * 1000,
  });

  const data = mediaType === 'movie' ? movieData : tvData;
  const isLoading = mediaType === 'movie' ? movieLoading : tvLoading;
  const [isFetching, setIsFetching] = useState(false);

  // Reset page when media type changes
  useEffect(() => {
    setPage(1);
  }, [mediaType]);

  const handleLoadMore = async () => {
    if (data?.total_pages && page < data.total_pages) {
      setIsFetching(true);
      setPage(prev => prev + 1);
      // Small delay for smooth UX
      setTimeout(() => setIsFetching(false), 500);
    }
  };

  const handleTabChange = (type: 'movie' | 'tv') => {
    if (type !== mediaType) {
      setMediaType(type);
    }
  };

  return (
    <section ref={sectionRef} className="relative space-y-6 mt-8 md:mt-12 pb-8">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div className="flex items-center gap-3">
          <h2 className="text-2xl md:text-3xl font-bold text-white">
            Indian Entertainment
          </h2>
          <div className="h-1 w-16 bg-netflix-red rounded-full" />
        </div>
        
        {/* Custom Tab Buttons - No page reload */}
        <div className="flex bg-gray-900/50 rounded-lg p-1 w-full md:w-auto">
          <button
            onClick={() => handleTabChange('movie')}
            className={`flex-1 md:flex-none px-6 py-2.5 rounded-md text-sm font-semibold transition-all duration-200
              ${mediaType === 'movie' 
                ? 'bg-netflix-red text-white shadow-lg' 
                : 'text-white/70 hover:text-white hover:bg-white/5'
              }`}
          >
            Movies
          </button>
          <button
            onClick={() => handleTabChange('tv')}
            className={`flex-1 md:flex-none px-6 py-2.5 rounded-md text-sm font-semibold transition-all duration-200
              ${mediaType === 'tv' 
                ? 'bg-netflix-red text-white shadow-lg' 
                : 'text-white/70 hover:text-white hover:bg-white/5'
              }`}
          >
            Web Series
          </button>
        </div>
      </div>

      {/* Content with smooth transition */}
      <div className="transition-opacity duration-200">
        {isLoading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 md:gap-6">
            {Array.from({ length: 10 }).map((_, i) => (
              <div
                key={i}
                className="aspect-[2/3] animate-pulse rounded-lg bg-gray-800/50"
              />
            ))}
          </div>
        ) : (
          <>
            <MediaGrid items={data?.results?.map(item => ({ ...item, media_type: mediaType })) || []} />
            {data?.total_pages && page < data.total_pages && (
              <div className="flex justify-center mt-8">
                <Button
                  onClick={handleLoadMore}
                  disabled={isFetching}
                  variant="outline"
                  className="px-8 py-2 text-base font-semibold rounded-full bg-netflix-red hover:bg-netflix-red/90 text-white border-none"
                >
                  {isFetching ? 'Loading...' : 'Load More'}
                </Button>
              </div>
            )}
          </>
        )}
      </div>
    </section>
  );
};
