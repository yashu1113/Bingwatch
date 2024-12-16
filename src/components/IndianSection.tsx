import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { getIndianContent } from '@/services/tmdb';
import { MediaGrid } from '@/components/MediaGrid';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export const IndianSection = () => {
  const [mediaType, setMediaType] = useState<'movie' | 'tv'>('movie');
  const [page, setPage] = useState(1);

  const { data, isLoading, isFetching } = useQuery({
    queryKey: ['indian-content', mediaType, page],
    queryFn: () => getIndianContent(mediaType, page),
    placeholderData: (previousData) => previousData,
  });

  const handleLoadMore = () => {
    if (data?.total_pages && page < data.total_pages) {
      setPage(prev => prev + 1);
    }
  };

  return (
    <section className="space-y-6 px-4 sm:px-8 md:px-12 mt-8 md:mt-12">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <h2 className="text-2xl sm:text-3xl font-bold">Indian Entertainment</h2>
        <Tabs 
          defaultValue="movie" 
          onValueChange={(value) => setMediaType(value as 'movie' | 'tv')}
          className="w-full md:w-auto"
        >
          <TabsList className="grid w-full grid-cols-2 md:w-auto md:flex md:space-x-4">
            <TabsTrigger 
              value="movie" 
              className="text-sm sm:text-base font-medium px-4 py-2"
            >
              Movies
            </TabsTrigger>
            <TabsTrigger 
              value="tv" 
              className="text-sm sm:text-base font-medium px-4 py-2"
            >
              TV Shows
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {Array.from({ length: 10 }).map((_, i) => (
            <div
              key={i}
              className="aspect-[2/3] animate-pulse rounded-lg bg-gray-800"
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
                className="w-full sm:w-auto px-8 py-2 bg-netflix-red text-white rounded-md font-medium 
                          transition-none hover:bg-netflix-red focus:ring-2 focus:ring-netflix-red/50 
                          disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isFetching ? 'Loading...' : 'Load More'}
              </Button>
            </div>
          )}
        </>
      )}
    </section>
  );
};