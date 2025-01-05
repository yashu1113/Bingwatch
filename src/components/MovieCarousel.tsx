import { useEffect } from "react";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { MediaCard } from "./MediaCard";
import { useIsMobile } from "@/hooks/use-mobile";
import useEmblaCarousel from 'embla-carousel-react';
import { Skeleton } from "./ui/skeleton";

interface MovieCarouselProps {
  items: Array<{
    id: number;
    title?: string;
    name?: string;
    poster_path: string;
    media_type?: 'movie' | 'tv';
    release_date?: string;
    first_air_date?: string;
    vote_average?: number;
    CustomActions?: React.ComponentType;
  }>;
  autoPlay?: boolean;
  isLoading?: boolean;
  showCustomActions?: boolean;
}

export const MovieCarousel = ({ items, autoPlay = false, isLoading = false, showCustomActions = false }: MovieCarouselProps) => {
  const isMobile = useIsMobile();
  const [emblaRef, emblaApi] = useEmblaCarousel({
    align: "start",
    loop: true,
    dragFree: isMobile,
  });

  useEffect(() => {
    if (autoPlay && emblaApi) {
      const intervalId = setInterval(() => {
        if (document.hidden) return;
        emblaApi.scrollNext();
      }, 5000);

      return () => clearInterval(intervalId);
    }
  }, [emblaApi, autoPlay]);

  if (isLoading) {
    return (
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="space-y-4">
            <Skeleton className="aspect-[2/3] w-full rounded-lg" />
            <div className="space-y-2">
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-4 w-1/2" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (!items?.length) {
    return (
      <div className="text-center py-8 text-gray-400">
        No items available at the moment
      </div>
    );
  }

  return (
    <Carousel
      opts={{
        align: "start",
        loop: true,
        dragFree: isMobile,
      }}
      className="w-full"
    >
      <CarouselContent className="-ml-2 md:-ml-4">
        {items.map((item) => (
          <CarouselItem key={item.id} className="pl-2 md:pl-4 basis-1/2 md:basis-1/3 lg:basis-1/4 xl:basis-1/5">
            <MediaCard
              id={item.id}
              title={item.title || item.name || ''}
              posterPath={item.poster_path}
              mediaType={item.media_type || 'movie'}
              releaseDate={item.release_date || item.first_air_date}
              voteAverage={item.vote_average}
              CustomActions={showCustomActions ? item.CustomActions : undefined}
            />
          </CarouselItem>
        ))}
      </CarouselContent>
      <CarouselPrevious className="hidden md:flex" />
      <CarouselNext className="hidden md:flex" />
    </Carousel>
  );
};