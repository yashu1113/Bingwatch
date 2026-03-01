import React, { Suspense, useState } from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Autoplay } from 'swiper/modules';
// @ts-ignore
import 'swiper/css';
// @ts-ignore
import 'swiper/css/navigation';
import { useQuery } from '@tanstack/react-query';
import { getTrending } from '@/services/tmdb';
import { MediaCard } from './MediaCard';
import { LoadingGrid } from './LoadingGrid';
import { Button } from './ui/button';
import { Play, Calendar, Star } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useWatchlist } from '@/contexts/WatchlistContext';
import { useToast } from '@/hooks/use-toast';

export const TrendingSlider = () => {
  const { data: trendingData, isLoading, error } = useQuery({
    queryKey: ['trending', 'all', 'week'],
    queryFn: () => getTrending('all', 'week'),
    staleTime: 1000 * 60 * 5,
    retry: 3,
    retryDelay: 1000,
  });

  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const { addToWatchlist, isInWatchlist, removeFromWatchlist } = useWatchlist();
  const { toast } = useToast();

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
                className="relative group transition-transform duration-300 hover:scale-105 hover:z-10"
                onMouseEnter={() => setHoveredIndex(index)}
                onMouseLeave={() => setHoveredIndex(null)}
              >
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
                <div className={`${hoveredIndex === index ? 'opacity-0' : 'opacity-100'}`}>
                  <MediaCard
                    id={item.id}
                    title={item.title || item.name || ''}
                    posterPath={item.poster_path}
                    mediaType={item.media_type || 'movie'}
                    releaseDate={item.release_date || item.first_air_date}
                    voteAverage={item.vote_average}
                  />
                </div>
                {hoveredIndex === index && (
                  <div className="absolute inset-0 rounded-lg bg-black/95 flex flex-col items-center justify-center text-center p-4 z-20 animate-fade-in shadow-2xl gap-3">
                    <img 
                      src={`https://image.tmdb.org/t/p/w500${item.poster_path}`}
                      alt={item.title || item.name}
                      className="w-2/3 mx-auto aspect-[2/3] object-cover rounded-lg mb-4 shadow-lg"
                    />
                    <h3 className="text-lg font-bold text-white line-clamp-2 mb-1">{item.title || item.name}</h3>
                    <div className="flex items-center justify-center gap-3 text-white/90 text-sm mb-1">
                      <div className="flex items-center gap-1">
                        <Calendar className="h-4 w-4 mr-1" />
                        <span>
                          {(item.release_date || item.first_air_date) ? 
                            new Date(item.release_date || item.first_air_date).getFullYear() : 'N/A'}
                        </span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Star className="h-4 w-4 text-yellow-400" />
                        <span>{item.vote_average?.toFixed(1) || 'N/A'}</span>
                      </div>
                    </div>
                    <Button
                      asChild
                      className="w-full max-w-xs mt-2 bg-netflix-red hover:bg-netflix-red/90 text-white font-bold"
                    >
                      <Link to={`/${item.media_type || 'movie'}/${item.id}`}>
                        <Play className="h-4 w-4 mr-2 inline" /> Watch Now
                      </Link>
                    </Button>
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
