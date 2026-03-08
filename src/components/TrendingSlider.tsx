import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { getTrending } from '@/services/tmdb';
import { MediaCard } from './MediaCard';
import { LoadingGrid } from './LoadingGrid';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from '@/components/ui/carousel';
import { useIsMobile } from '@/hooks/use-mobile';

export const TrendingSlider = () => {
  const isMobile = useIsMobile();
  const { data: trendingData, isLoading, error } = useQuery({
    queryKey: ['trending', 'all', 'week'],
    queryFn: () => getTrending('all', 'week'),
    staleTime: 1000 * 60 * 5,
    retry: 3,
    retryDelay: 1000,
  });

  if (isLoading) {
    return <LoadingGrid count={5} />;
  }

  if (error) {
    return (
      <div className="text-center text-muted-foreground py-8">
        Unable to load trending content. Please try again later.
      </div>
    );
  }

  return (
    <Carousel
      opts={{
        align: 'start',
        loop: true,
        dragFree: isMobile,
      }}
      className="w-full"
    >
      <CarouselContent className="-ml-2 md:-ml-4">
        {trendingData?.results.slice(0, 10).map((item) => (
          <CarouselItem key={item.id} className="pl-2 md:pl-4 basis-1/2 md:basis-1/3 lg:basis-1/4 xl:basis-1/5">
            <MediaCard
              id={item.id}
              title={item.title || item.name || ''}
              posterPath={item.poster_path}
              mediaType={item.media_type || 'movie'}
              releaseDate={item.release_date || item.first_air_date}
              voteAverage={item.vote_average}
            />
          </CarouselItem>
        ))}
      </CarouselContent>
      <CarouselPrevious className="hidden md:flex absolute left-0 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/50 border-0 text-white font-bold text-lg w-12 h-12 shadow-lg" />
      <CarouselNext className="hidden md:flex absolute right-0 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/50 border-0 text-white font-bold text-lg w-12 h-12 shadow-lg" />
    </Carousel>
  );
};
