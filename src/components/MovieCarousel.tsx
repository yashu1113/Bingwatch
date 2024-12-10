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
  }>;
  autoPlay?: boolean;
}

export const MovieCarousel = ({ items, autoPlay = false }: MovieCarouselProps) => {
  const isMobile = useIsMobile();
  const [emblaRef, emblaApi] = useEmblaCarousel({
    align: "start",
    loop: true,
    dragFree: isMobile,
  });

  useEffect(() => {
    if (autoPlay && emblaApi) {
      const intervalId = setInterval(() => {
        emblaApi.scrollNext();
      }, 5000); // Change slide every 5 seconds

      return () => clearInterval(intervalId);
    }
  }, [emblaApi, autoPlay]);

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
            />
          </CarouselItem>
        ))}
      </CarouselContent>
      <CarouselPrevious className="hidden md:flex" />
      <CarouselNext className="hidden md:flex" />
    </Carousel>
  );
};