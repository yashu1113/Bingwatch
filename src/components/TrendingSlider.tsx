
import React, { Suspense, useState } from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Autoplay } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/navigation';
import { useQuery } from '@tanstack/react-query';
import { getTrending } from '@/services/tmdb';
import { MediaCard } from './MediaCard';
import { LoadingGrid } from './LoadingGrid';
import { Button } from './ui/button';
import { Plus, Play } from 'lucide-react';

export const TrendingSlider = () => {
  const { data: trendingData, isLoading, error } = useQuery({
    queryKey: ['trending', 'all', 'week'],
    queryFn: () => getTrending('all', 'week'),
    staleTime: 1000 * 60 * 5,
    retry: 3,
    retryDelay: 1000,
  });

  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

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
            disableOnInteraction: true,
            pauseOnMouseEnter: true,
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
              <div 
                className="relative"
                onMouseEnter={() => setHoveredIndex(index)}
                onMouseLeave={() => setHoveredIndex(null)}
              >
                <MediaCard
                  id={item.id}
                  title={item.title || item.name || ''}
                  posterPath={item.poster_path}
                  mediaType={item.media_type || 'movie'}
                  releaseDate={item.release_date || item.first_air_date}
                  voteAverage={item.vote_average}
                />
                <div className="absolute bottom-1 left-1 z-10">
                  <span 
                    className="text-6xl md:text-7xl font-bold text-white opacity-90 text-shadow-lg"
                    style={{
                      WebkitTextStroke: '2px rgba(255,255,255,0.2)',
                    }}
                  >
                    {index + 1}
                  </span>
                </div>
                
                {hoveredIndex === index && (
                  <div className="absolute inset-0 bg-black/70 flex flex-col justify-between p-4 z-20">
                    <div className="text-white">
                      <h3 className="text-lg font-bold">{item.title || item.name}</h3>
                    </div>
                    
                    <div className="space-y-4">
                      <div className="flex gap-2">
                        <Button className="flex-1 bg-white text-black hover:bg-white/90">
                          <Play className="h-4 w-4 mr-2" /> Watch Now
                        </Button>
                        <Button variant="outline" size="icon" className="bg-gray-800/80 border-gray-700">
                          <Plus className="h-5 w-5" />
                        </Button>
                      </div>
                      
                      <div className="text-white/80 text-sm space-y-1">
                        <div className="flex items-center space-x-2">
                          <span>{new Date(item.release_date || item.first_air_date || '').getFullYear()}</span>
                          <span>•</span>
                          <span className="border px-1 text-xs">U/A 13+</span>
                          <span>•</span>
                          <span>2h 6m</span>
                        </div>
                        <div>
                          <span>8 Languages</span>
                        </div>
                        <p className="line-clamp-2 mt-2 text-white/70">
                          {item.overview || "No description available."}
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </SwiperSlide>
          ))}
        </Swiper>
      </Suspense>
    </div>
  );
};
