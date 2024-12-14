import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { getGenres } from '@/services/tmdb';
import { GenreCard } from './GenreCard';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";

export const GenreCarousel = () => {
  const { data: genres, isLoading } = useQuery({
    queryKey: ['genres'],
    queryFn: getGenres,
  });

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
            className="pl-2 md:pl-4 basis-1/2 md:basis-1/3 lg:basis-1/4 xl:basis-1/5"
          >
            <GenreCard id={genre.id} name={genre.name} />
          </CarouselItem>
        ))}
      </CarouselContent>
      <CarouselPrevious className="hidden md:flex" />
      <CarouselNext className="hidden md:flex" />
    </Carousel>
  );
};