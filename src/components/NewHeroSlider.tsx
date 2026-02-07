import { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { Play, Plus, Check, ChevronLeft, ChevronRight, Info, Pause, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useWatchlist } from "@/contexts/WatchlistContext";
import { useToast } from "@/hooks/use-toast";
import { getImageUrl } from "@/services/tmdb";
import { useIntersectionObserver } from "@/hooks/use-intersection-observer";
import { VideoPlayer } from "@/components/VideoPlayer";

interface HeroSliderProps {
  items: Array<{
    id: number;
    title?: string;
    name?: string;
    overview: string;
    backdrop_path: string;
    poster_path?: string;
    media_type?: "movie" | "tv";
    release_date?: string;
    first_air_date?: string;
    vote_average?: number;
  }>;
}

export const NewHeroSlider = ({ items }: HeroSliderProps) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);
  const [isHovering, setIsHovering] = useState(false);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [imageLoaded, setImageLoaded] = useState<Set<number>>(new Set());
  const [showVideoPlayer, setShowVideoPlayer] = useState(false);
  
  const autoplayTimerRef = useRef<NodeJS.Timeout | null>(null);
  const sliderRef = useRef<HTMLDivElement>(null);
  const progressRef = useRef<HTMLDivElement>(null);
  
  const navigate = useNavigate();
  const { addToWatchlist, isInWatchlist } = useWatchlist();
  const { toast } = useToast();
  
  // Intersection observer to pause when out of view
  const { isIntersecting } = useIntersectionObserver(sliderRef, {
    threshold: 0.5,
  });

  const limitedItems = items.slice(0, 5);
  const currentItem = limitedItems[currentIndex];
  const mediaType = currentItem?.media_type || "movie";

  // Smart autoplay with hover detection
  const stopAutoplay = useCallback(() => {
    if (autoplayTimerRef.current) {
      clearTimeout(autoplayTimerRef.current);
      autoplayTimerRef.current = null;
    }
  }, []);

  const startAutoplay = useCallback(() => {
    if (!isAutoPlaying || isHovering || !isIntersecting || isTransitioning) return;
    
    stopAutoplay();
    autoplayTimerRef.current = setTimeout(() => {
      setIsTransitioning(true);
      setCurrentIndex((prev) => (prev + 1) % limitedItems.length);
      setTimeout(() => setIsTransitioning(false), 800);
    }, 6000);
  }, [isAutoPlaying, isHovering, isIntersecting, isTransitioning, limitedItems.length, stopAutoplay]);

  // Autoplay management
  useEffect(() => {
    if (isIntersecting && !isHovering && !isTransitioning) {
      startAutoplay();
    } else {
      stopAutoplay();
    }
    return () => stopAutoplay();
  }, [isIntersecting, isHovering, isTransitioning, startAutoplay, stopAutoplay]);

  // Navigation handlers - capture item at click time to prevent stale closure
  const handleWatchNow = useCallback((item: typeof limitedItems[0]) => {
    setCurrentItemForPlayer(item);
    setShowVideoPlayer(true);
  }, []);

  const [currentItemForPlayer, setCurrentItemForPlayer] = useState<typeof limitedItems[0] | null>(null);

  const handleMoreInfo = useCallback((item: typeof limitedItems[0]) => {
    const route = item.media_type === "tv" ? `/tv/${item.id}` : `/movie/${item.id}`;
    navigate(route);
  }, [navigate]);

  const nextSlide = useCallback(() => {
    if (isTransitioning) return;
    stopAutoplay();
    setIsTransitioning(true);
    setCurrentIndex((prev) => (prev + 1) % limitedItems.length);
    setTimeout(() => {
      setIsTransitioning(false);
      if (!isHovering) setTimeout(startAutoplay, 2000);
    }, 800);
  }, [limitedItems.length, isTransitioning, isHovering, stopAutoplay, startAutoplay]);

  const prevSlide = useCallback(() => {
    if (isTransitioning) return;
    stopAutoplay();
    setIsTransitioning(true);
    setCurrentIndex((prev) => (prev - 1 + limitedItems.length) % limitedItems.length);
    setTimeout(() => {
      setIsTransitioning(false);
      if (!isHovering) setTimeout(startAutoplay, 2000);
    }, 800);
  }, [limitedItems.length, isTransitioning, isHovering, stopAutoplay, startAutoplay]);

  const goToSlide = useCallback((index: number) => {
    if (isTransitioning || index === currentIndex) return;
    stopAutoplay();
    setIsTransitioning(true);
    setCurrentIndex(index);
    setTimeout(() => {
      setIsTransitioning(false);
      if (!isHovering) setTimeout(startAutoplay, 2000);
    }, 800);
  }, [currentIndex, isTransitioning, isHovering, stopAutoplay, startAutoplay]);

  const handleAddToWatchlist = useCallback((item: typeof currentItem, e: React.MouseEvent) => {
    e.stopPropagation();
    const mediaItem = {
      id: item.id,
      title: item.title || item.name || "",
      mediaType: item.media_type || "movie" as const,
      posterPath: item.poster_path || item.backdrop_path,
      releaseDate: item.release_date || item.first_air_date,
    };

    if (isInWatchlist(item.id)) {
      toast({ title: "Already in Watchlist", description: "This title is already in your watchlist" });
      return;
    }

    addToWatchlist(mediaItem);
    toast({ title: "Added to Watchlist", description: `${mediaItem.title} added to your watchlist` });
  }, [addToWatchlist, isInWatchlist, toast]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isIntersecting || showVideoPlayer) return;
      
      switch (e.key) {
        case 'ArrowLeft':
          e.preventDefault();
          prevSlide();
          break;
        case 'ArrowRight':
          e.preventDefault();
          nextSlide();
          break;
        case 'Enter':
        case ' ':
          e.preventDefault();
          if (currentItem) {
            handleWatchNow(currentItem);
          }
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isIntersecting, prevSlide, nextSlide, handleWatchNow, showVideoPlayer]);

  if (!limitedItems.length) {
    return (
      <div className="relative w-full h-screen bg-netflix-black -mt-16">
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-12 h-12 border-4 border-netflix-red border-t-transparent rounded-full animate-spin" />
        </div>
      </div>
    );
  }

  const toggleAutoplay = () => {
    setIsAutoPlaying(prev => !prev);
    if (!isAutoPlaying) startAutoplay();
    else stopAutoplay();
  };

  return (
    <>
      <div 
        ref={sliderRef}
        className="relative w-full h-screen overflow-hidden -mt-16"
        onMouseEnter={() => setIsHovering(true)}
        onMouseLeave={() => setIsHovering(false)}
        role="region"
        aria-label="Hero content slider"
      >
        {/* Background Images */}
        <div className="absolute inset-0 bg-netflix-black" />
        {limitedItems.map((item, index) => {
          const isActive = index === currentIndex;
          const isLoaded = imageLoaded.has(item.id);
          
          return (
            <div 
              key={item.id} 
              className={`absolute inset-0 w-full h-full transition-all duration-700 ease-out ${
                isActive ? 'opacity-100 scale-100 z-10' : 'opacity-0 scale-105 z-0'
              }`}
            >
              {!isLoaded && isActive && (
                <div className="absolute inset-0 bg-gradient-to-br from-gray-800 to-gray-900 animate-pulse" />
              )}
              
              <img
                src={getImageUrl(item.backdrop_path, 'original')}
                alt=""
                className={`w-full h-full object-cover transition-opacity duration-500 ${
                  isLoaded ? 'opacity-100' : 'opacity-0'
                }`}
                loading={isActive ? 'eager' : 'lazy'}
                onLoad={() => setImageLoaded(prev => new Set([...prev, item.id]))}
                onError={(e) => {
                  e.currentTarget.src = '/placeholder.svg';
                  setImageLoaded(prev => new Set([...prev, item.id]));
                }}
              />
            </div>
          );
        })}
        
        {/* Enhanced Gradient Overlays */}
        <div className="absolute inset-0 bg-gradient-to-r from-netflix-black via-netflix-black/60 to-transparent z-20" />
        <div className="absolute inset-0 bg-gradient-to-t from-netflix-black via-transparent to-netflix-black/30 z-20" />
        <div className="absolute bottom-0 left-0 right-0 h-40 bg-gradient-to-t from-netflix-black to-transparent z-20" />
        
        {/* Autoplay Control */}
        <div className="absolute top-24 right-8 z-40 flex items-center gap-3">
          <button
            onClick={toggleAutoplay}
            className="bg-black/60 hover:bg-black/80 text-white p-3 rounded-full 
                       border-2 border-white/30 hover:border-white/60 
                       transition-all duration-300 hover:scale-110 active:scale-95
                       backdrop-blur-sm group"
            aria-label={isAutoPlaying ? "Pause autoplay" : "Resume autoplay"}
          >
            {isAutoPlaying ? (
              <Pause className="w-5 h-5 group-hover:text-netflix-red transition-colors" />
            ) : (
              <Play className="w-5 h-5 group-hover:text-netflix-red transition-colors" />
            )}
          </button>
        </div>
        
        {/* Navigation Arrows */}
        <button
          onClick={prevSlide}
          disabled={isTransitioning}
          className={`absolute left-4 md:left-8 top-1/2 -translate-y-1/2 z-40 
                     bg-black/50 hover:bg-black/70 text-white p-4 rounded-full 
                     border border-white/20 hover:border-white/50
                     backdrop-blur-sm
                     transition-all duration-300 group
                     ${isHovering ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-4'}
                     hover:scale-110 active:scale-95
                     disabled:opacity-50 disabled:cursor-not-allowed`}
          aria-label="Previous slide"
        >
          <ChevronLeft className="w-6 h-6 md:w-7 md:h-7 group-hover:text-netflix-red transition-colors" />
        </button>
        
        <button
          onClick={nextSlide}
          disabled={isTransitioning}
          className={`absolute right-4 md:right-8 top-1/2 -translate-y-1/2 z-40 
                     bg-black/50 hover:bg-black/70 text-white p-4 rounded-full 
                     border border-white/20 hover:border-white/50
                     backdrop-blur-sm
                     transition-all duration-300 group
                     ${isHovering ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-4'}
                     hover:scale-110 active:scale-95
                     disabled:opacity-50 disabled:cursor-not-allowed`}
          aria-label="Next slide"
        >
          <ChevronRight className="w-6 h-6 md:w-7 md:h-7 group-hover:text-netflix-red transition-colors" />
        </button>
        
        {/* Main Content */}
        <div className="relative z-30 h-full flex items-center md:items-end pb-8 md:pb-36 pt-24">
          <div className="container mx-auto px-6 lg:px-12 max-w-7xl">
            <div className="max-w-2xl space-y-5">
              {/* Title */}
              <h1 
                className="text-4xl sm:text-5xl lg:text-7xl font-bold text-white leading-tight 
                           drop-shadow-2xl animate-fade-up"
                style={{ textShadow: '0 4px 12px rgba(0,0,0,0.5)' }}
              >
                {currentItem.title || currentItem.name}
              </h1>
              
              {/* Meta Info */}
              <div className="flex flex-wrap items-center gap-3 text-sm md:text-base">
                {currentItem.vote_average && currentItem.vote_average > 0 && (
                  <div className="flex items-center gap-1 px-3 py-1 bg-yellow-500/20 rounded-full backdrop-blur-sm">
                    <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                    <span className="text-yellow-400 font-bold">{currentItem.vote_average.toFixed(1)}</span>
                  </div>
                )}
                {(currentItem.release_date || currentItem.first_air_date) && (
                  <span className="px-3 py-1 bg-white/10 rounded-full text-white/90 font-medium backdrop-blur-sm">
                    {new Date(currentItem.release_date || currentItem.first_air_date || '').getFullYear()}
                  </span>
                )}
                <span className="px-3 py-1 bg-netflix-red/80 rounded-full text-white text-xs font-bold uppercase">
                  {mediaType === 'tv' ? 'Series' : 'Movie'}
                </span>
              </div>
              
              {/* Overview */}
              <p className="text-base sm:text-lg text-white/90 line-clamp-3 leading-relaxed max-w-xl drop-shadow-lg">
                {currentItem.overview}
              </p>
              
              {/* Action Buttons */}
              <div className="flex flex-wrap items-center gap-3 pt-2">
                <Button
                  className="bg-white text-black hover:bg-white/90 px-8 py-6 text-base font-bold 
                             rounded-md shadow-xl transition-all duration-200 
                             hover:scale-105 active:scale-95 group"
                  onClick={() => handleWatchNow(currentItem)}
                  aria-label={`Play ${currentItem.title || currentItem.name}`}
                >
                  <Play className="mr-2 h-5 w-5 fill-black group-hover:scale-110 transition-transform" />
                  Play Now
                </Button>
                
                <Button
                  className="bg-gray-500/70 hover:bg-gray-500/90 text-white px-8 py-6 text-base font-semibold 
                             rounded-md shadow-xl backdrop-blur-sm 
                             transition-all duration-200 hover:scale-105 active:scale-95"
                  onClick={() => handleMoreInfo(currentItem)}
                  aria-label={`More info about ${currentItem.title || currentItem.name}`}
                >
                  <Info className="mr-2 h-5 w-5" />
                  More Info
                </Button>

                <Button
                  className="bg-transparent border-2 border-white/50 hover:border-white hover:bg-white/10 
                             text-white h-14 w-14 p-0 rounded-full 
                             transition-all duration-200 hover:scale-110 active:scale-95"
                  onClick={(e) => handleAddToWatchlist(currentItem, e)}
                  aria-label={isInWatchlist(currentItem.id) ? "In watchlist" : "Add to watchlist"}
                >
                  {isInWatchlist(currentItem.id) ? (
                    <Check className="h-6 w-6 text-green-400" />
                  ) : (
                    <Plus className="h-6 w-6" />
                  )}
                </Button>
              </div>
            </div>
          </div>
        </div>
        
        {/* Slide Indicators */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex items-center gap-2 z-40">
          {limitedItems.map((_, index) => (
            <button
              key={index}
              disabled={isTransitioning}
              className={`relative overflow-hidden transition-all duration-300 rounded-full
                         focus:outline-none focus:ring-2 focus:ring-netflix-red/50
                         disabled:cursor-not-allowed ${
                index === currentIndex
                  ? "bg-netflix-red w-10 h-2"
                  : "bg-white/40 hover:bg-white/60 w-2 h-2 hover:scale-125"
              }`}
              onClick={() => goToSlide(index)}
              aria-label={`Go to slide ${index + 1}`}
              aria-current={index === currentIndex ? 'true' : 'false'}
            >
              {index === currentIndex && isAutoPlaying && (
                <div 
                  ref={progressRef}
                  className="absolute inset-0 bg-white/30 origin-left"
                  style={{
                    animation: 'slideProgress 6s linear infinite',
                  }}
                />
              )}
            </button>
          ))}
        </div>
        
        {/* Progress Bar */}
        <div className="absolute bottom-0 left-0 w-full h-1 bg-white/10 z-40">
          <div 
            className="h-full bg-gradient-to-r from-netflix-red to-red-400 transition-all duration-700 ease-out"
            style={{ width: `${((currentIndex + 1) / limitedItems.length) * 100}%` }}
          />
        </div>
      </div>

      {/* Video Player Modal */}
      {showVideoPlayer && currentItemForPlayer && (
        <VideoPlayer
          isOpen={showVideoPlayer}
          onClose={() => {
            setShowVideoPlayer(false);
            setCurrentItemForPlayer(null);
          }}
          mediaType={currentItemForPlayer.media_type || "movie"}
          tmdbId={currentItemForPlayer.id}
          title={currentItemForPlayer.title || currentItemForPlayer.name}
        />
      )}

      <style>{`
        @keyframes slideProgress {
          from { transform: scaleX(0); }
          to { transform: scaleX(1); }
        }
      `}</style>
    </>
  );
};
