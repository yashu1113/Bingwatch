import React from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Autoplay } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/navigation';
import { useQuery } from '@tanstack/react-query';
import { getTrending } from '@/services/tmdb';
import { MediaCard } from './MediaCard';

export const TrendingSlider = () => {
  const { data: trendingData, isLoading } = useQuery({
    queryKey: ['trending', 'all', 'week'],
    queryFn: () => getTrending('all', 'week'),
  });

  if (isLoading) {
    return (
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
        {Array.from({ length: 5 }).map((_, i) => (
          <div
            key={i}
            className="aspect-[2/3] animate-pulse rounded-lg bg-gray-800"
          />
        ))}
      </div>
    );
  }

  return (
    <div className="relative w-full">
      <Swiper
        modules={[Navigation, Autoplay]}
        navigation
        autoplay={{
          delay: 3000,
          disableOnInteraction: false,
        }}
        breakpoints={{
          320: { slidesPerView: 2, spaceBetween: 10 },
          640: { slidesPerView: 3, spaceBetween: 15 },
          768: { slidesPerView: 4, spaceBetween: 15 },
          1024: { slidesPerView: 5, spaceBetween: 20 },
        }}
        className="w-full"
      >
        {trendingData?.results.slice(0, 10).map((item) => (
          <SwiperSlide key={item.id}>
            <MediaCard
              id={item.id}
              title={item.title || item.name || ''}
              posterPath={item.poster_path}
              mediaType={item.media_type || 'movie'}
              releaseDate={item.release_date || item.first_air_date}
              voteAverage={item.vote_average}
            />
          </SwiperSlide>
        ))}
      </Swiper>
    </div>
  );
};