import React, { Suspense } from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Autoplay } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/navigation';
import { useQuery } from '@tanstack/react-query';
import { getTrending } from '@/services/tmdb';
import { MediaCard } from './MediaCard';
import { LoadingGrid } from './LoadingGrid';

export const TrendingSlider = () => {
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
      <div className="text-center text-gray-400 py-8">
        Unable to load trending content. Please try again later.
      </div>
    );
  }

  return (
    <div className="relative w-full">
      <Suspense fallback={<LoadingGrid count={5} />}>
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
          {trendingData?.results.slice(0, 10).map((item, index) => (
            <SwiperSlide key={item.id}>
              <div className="relative">
                <div className="absolute top-0 left-0 z-10 w-12 h-12 flex items-center justify-center">
                  <span className="text-4xl font-bold text-white drop-shadow-lg" style={{
                    textShadow: '2px 2px 4px rgba(0,0,0,0.8)',
                    WebkitTextStroke: '1px rgba(0,0,0,0.3)',
                  }}>
                    {index + 1}
                  </span>
                </div>
                <MediaCard
                  id={item.id}
                  title={item.title || item.name || ''}
                  posterPath={item.poster_path}
                  mediaType={item.media_type || 'movie'}
                  releaseDate={item.release_date || item.first_air_date}
                  voteAverage={item.vote_average}
                />
              </div>
            </SwiperSlide>
          ))}
        </Swiper>
      </Suspense>
    </div>
  );
};