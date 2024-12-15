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
    <section className="space-y-6 px-4 sm:px-8 md:px-12">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl sm:text-3xl font-bold">Indian Entertainment</h2>
        <Tabs defaultValue="movie" onValueChange={(value) => setMediaType(value as 'movie' | 'tv')}>
          <TabsList className="space-x-2 sm:space-x-4">
            <TabsTrigger value="movie" className="text-sm sm:text-base">Movies</TabsTrigger>
            <TabsTrigger value="tv" className="text-sm sm:text-base">TV Shows</TabsTrigger>
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
                variant="outline"
                className="w-full sm:w-auto"
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
