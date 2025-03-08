
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
import { Plus, Check, Play, Star, Calendar, Clock } from 'lucide-react';
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

  const handleWatchlistToggle = (e: React.MouseEvent, item: any) => {
    e.preventDefault();
    e.stopPropagation();
    
    const isInList = isInWatchlist(item.id);
    
    if (isInList) {
      removeFromWatchlist(item.id);
      toast({
        title: "Removed from Watchlist",
        description: `${item.title || item.name} has been removed from your watchlist`,
      });
    } else {
      addToWatchlist({
        id: item.id,
        title: item.title || item.name,
        posterPath: item.poster_path,
        mediaType: item.media_type || 'movie',
      });
      toast({
        title: "Added to Watchlist",
        description: `${item.title || item.name} has been added to your watchlist`,
      });
    }
  };

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
                {/* Regular MediaCard without its hover effect - we'll override it */}
                <div className={`${hoveredIndex === index ? 'invisible' : 'visible'}`}>
                  <MediaCard
                    id={item.id}
                    title={item.title || item.name || ''}
                    posterPath={item.poster_path}
                    mediaType={item.media_type || 'movie'}
                    releaseDate={item.release_date || item.first_air_date}
                    voteAverage={item.vote_average}
                  />
                </div>
                
                {/* Number indicator */}
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
                
                {/* Custom hover overlay with enhanced design */}
                {hoveredIndex === index && (
                  <div className="absolute inset-0 bg-gradient-to-t from-black via-black/85 to-black/75 rounded-lg overflow-hidden shadow-2xl flex flex-col justify-between p-4 z-20 animate-fade-in">
                    <div className="space-y-2">
                      <h3 className="text-lg font-bold text-white line-clamp-2">{item.title || item.name}</h3>
                      
                      <div className="flex items-center gap-2 flex-wrap text-white/80 text-xs">
                        <div className="flex items-center">
                          <Calendar className="h-3 w-3 mr-1" />
                          <span>{new Date(item.release_date || item.first_air_date || '').getFullYear()}</span>
                        </div>
                        
                        <div className="flex items-center">
                          <Star className="h-3 w-3 mr-1 text-yellow-400" />
                          <span>{item.vote_average?.toFixed(1) || 'N/A'}</span>
                        </div>
                        
                        {item.media_type === 'movie' && (
                          <div className="flex items-center">
                            <Clock className="h-3 w-3 mr-1" />
                            <span>2h 6m</span>
                          </div>
                        )}
                        
                        <span className="border border-white/20 px-1 py-0.5 text-xs rounded">
                          {item.media_type === 'movie' ? 'Movie' : 'TV Show'}
                        </span>
                      </div>
                    </div>
                    
                    <div className="space-y-3 mt-2">
                      <p className="line-clamp-3 text-xs text-white/70">
                        {item.overview || "No description available."}
                      </p>
                      
                      <div className="flex gap-2">
                        <Button 
                          asChild
                          size="sm"
                          className="flex-1 bg-netflix-red hover:bg-netflix-red/90 text-white font-medium"
                        >
                          <Link to={`/${item.media_type || 'movie'}/${item.id}`}>
                            <Play className="h-3.5 w-3.5 mr-1" /> Watch Now
                          </Link>
                        </Button>
                        
                        <Button 
                          variant="outline" 
                          size="icon" 
                          className="bg-gray-800/80 border-gray-700 hover:bg-gray-700/80"
                          onClick={(e) => handleWatchlistToggle(e, item)}
                        >
                          {isInWatchlist(item.id) ? (
                            <Check className="h-4 w-4 text-green-400" />
                          ) : (
                            <Plus className="h-4 w-4 text-white" />
                          )}
                        </Button>
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
