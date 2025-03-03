
import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { getGenres } from '@/services/tmdb';
import { GenreCard } from './GenreCard';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { useIsMobile } from '@/hooks/use-mobile';

export const GenreCarousel = () => {
  const { data: genres, isLoading } = useQuery({
    queryKey: ['genres', 'movie'],
    queryFn: () => getGenres('movie'),
  });

  const isMobile = useIsMobile();

  if (isLoading) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
        {Array.from({ length: 5 }).map((_, i) => (
          <div
            key={i}
            className="h-24 animate-pulse rounded-lg bg-gray-800"
          />
        ))}
      </div>
    );
  }

  return (
    <div className="relative">
      <Carousel
        opts={{
          align: "start",
          loop: true,
        }}
        className="w-full"
      >
        <CarouselContent className="-ml-2 md:-ml-4">
          {genres?.genres.map((genre) => (
            <CarouselItem
              key={genre.id}
              className={isMobile ? "pl-2 basis-1/3" : "pl-4 basis-1/2 md:basis-1/3 lg:basis-1/4 xl:basis-1/5"}
            >
              <GenreCard id={genre.id} name={genre.name} />
            </CarouselItem>
          ))}
        </CarouselContent>
        <CarouselPrevious className={isMobile ? "hidden" : "hidden md:flex absolute left-0 top-1/2 -translate-y-1/2 bg-black/40 hover:bg-black/60 border-0 text-white"}>
          <ArrowLeft className="h-4 w-4" />
        </CarouselPrevious>
        <CarouselNext className={isMobile ? "hidden" : "hidden md:flex absolute right-0 top-1/2 -translate-y-1/2 bg-black/40 hover:bg-black/60 border-0 text-white"}>
          <ArrowRight className="h-4 w-4" />
        </CarouselNext>
      </Carousel>
    </div>
  );
};
