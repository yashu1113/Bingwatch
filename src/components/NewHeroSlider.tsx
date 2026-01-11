import { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { Play, Plus, Check, ChevronLeft, ChevronRight, Info, Pause } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useWatchlist } from "@/contexts/WatchlistContext";
import { useToast } from "@/hooks/use-toast";
import { getImageUrl } from "@/services/tmdb";
import { useIntersectionObserver } from "@/hooks/use-intersection-observer";

// Vidking embed URL generator
const getVidkingUrl = (mediaType: "movie" | "tv", id: number, season?: number, episode?: number) => {
  if (mediaType === "tv" && season && episode) {
    return `https://www.vidking.net/embed/tv/${id}/${season}/${episode}?autoPlay=true&nextEpisode=true`;
  }
  return `https://www.vidking.net/embed/movie/${id}?autoPlay=true&nextEpisode=true`;
};

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
  }>;
}

export const NewHeroSlider = ({ items }: HeroSliderProps) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);
  const [isHovering, setIsHovering] = useState(false);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [imageLoaded, setImageLoaded] = useState<Set<number>>(new Set());
  
  const autoplayTimerRef = useRef<NodeJS.Timeout | null>(null);
  const sliderRef = useRef<HTMLDivElement>(null);
  
  const navigate = useNavigate();
  const { addToWatchlist, isInWatchlist } = useWatchlist();
  const { toast } = useToast();
  
  // Intersection observer to pause when out of view
  const { isIntersecting } = useIntersectionObserver(sliderRef, {
    threshold: 0.5,
  });

  const limitedItems = items.slice(0, 5);

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
      setTimeout(() => setIsTransitioning(false), 1000);
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

  const currentItem = limitedItems[currentIndex];

  // Navigation handlers - Open vidking embed in new window or navigate to details
  const handleWatchNow = (item: HeroSliderProps["items"][0]) => {
    const mediaType = item.media_type || "movie";
    const vidkingUrl = getVidkingUrl(mediaType, item.id);
    window.open(vidkingUrl, '_blank');
  };

  const handleMoreInfo = (item: HeroSliderProps["items"][0]) => {
    const mediaType = item.media_type || "movie";
    const route = mediaType === "movie" ? `/movie/${item.id}` : `/tv/${item.id}`;
    navigate(route);
  };

  const nextSlide = useCallback(() => {
    if (isTransitioning) return;
    stopAutoplay();
    setIsTransitioning(true);
    setCurrentIndex((prev) => (prev + 1) % limitedItems.length);
    setTimeout(() => {
      setIsTransitioning(false);
      if (!isHovering) {
        setTimeout(startAutoplay, 2000);
      }
    }, 1000);
  }, [limitedItems.length, isTransitioning, isHovering, stopAutoplay, startAutoplay]);

  const prevSlide = useCallback(() => {
    if (isTransitioning) return;
    stopAutoplay();
    setIsTransitioning(true);
    setCurrentIndex((prev) => (prev - 1 + limitedItems.length) % limitedItems.length);
    setTimeout(() => {
      setIsTransitioning(false);
      if (!isHovering) {
        setTimeout(startAutoplay, 2000);
      }
    }, 1000);
  }, [limitedItems.length, isTransitioning, isHovering, stopAutoplay, startAutoplay]);

  const goToSlide = useCallback((index: number) => {
    if (isTransitioning || index === currentIndex) return;
    stopAutoplay();
    setIsTransitioning(true);
    setCurrentIndex(index);
    setTimeout(() => {
      setIsTransitioning(false);
      if (!isHovering) {
        setTimeout(startAutoplay, 2000);
      }
    }, 1000);
  }, [currentIndex, isTransitioning, isHovering, stopAutoplay, startAutoplay]);

  const handleAddToWatchlist = (item: HeroSliderProps["items"][0], e: React.MouseEvent) => {
    e.stopPropagation();
    const mediaItem = {
      id: item.id,
      title: item.title || item.name || "",
      mediaType: item.media_type || "movie" as const,
      posterPath: item.poster_path || item.backdrop_path,
      releaseDate: item.release_date || item.first_air_date,
    };

    if (isInWatchlist(item.id)) {
      toast({
        title: "Already in Watchlist",
        description: "This title is already in your watchlist",
      });
      return;
    }

    addToWatchlist(mediaItem);
    toast({
      title: "Added to Watchlist",
      description: `${mediaItem.title} added to your watchlist`,
    });
  };

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isIntersecting) return;
      
      if (e.key === 'ArrowLeft') {
        e.preventDefault();
        prevSlide();
      } else if (e.key === 'ArrowRight') {
        e.preventDefault();
        nextSlide();
      } else if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        handleWatchNow(currentItem);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isIntersecting, prevSlide, nextSlide, currentItem]);

  if (!limitedItems.length) {
    return (
      <div className="relative w-full h-screen bg-netflix-black animate-pulse -mt-16" />
    );
  }

  const toggleAutoplay = () => {
    setIsAutoPlaying(prev => !prev);
    if (!isAutoPlaying) {
      startAutoplay();
    } else {
      stopAutoplay();
    }
  };

  return (
    <div 
      ref={sliderRef}
      className="relative w-full h-screen overflow-hidden -mt-16"
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => setIsHovering(false)}
      role="region"
      aria-label="Hero content slider"
    >
      {/* Background Poster Images with smooth transition */}
      <div className="absolute inset-0 bg-netflix-black" />
      {limitedItems.map((item, index) => {
        const isActive = index === currentIndex;
        const isLoaded = imageLoaded.has(item.id);
        
        return (
          <div 
            key={item.id} 
            className={`absolute inset-0 w-full h-full transition-all duration-1000 ${
              isActive ? 'opacity-100 z-10' : 'opacity-0 z-0'
            }`}
          >
            {/* Loading skeleton */}
            {!isLoaded && isActive && (
              <div className="absolute inset-0 bg-gray-800 animate-pulse" />
            )}
            
            {/* Poster Image */}
            <img
              src={getImageUrl(item.backdrop_path, 'original')}
              alt={`${item.title || item.name} backdrop`}
              className={`w-full h-full object-cover transition-opacity duration-500 ${
                isLoaded ? 'opacity-100' : 'opacity-0'
              }`}
              loading={isActive ? 'eager' : 'lazy'}
              onLoad={() => {
                setImageLoaded(prev => new Set([...prev, item.id]));
              }}
              onError={(e) => {
                e.currentTarget.src = 'https://placehold.co/1920x1080?text=No+Image';
                setImageLoaded(prev => new Set([...prev, item.id]));
              }}
            />
          </div>
        );
      })}
      
      {/* Enhanced Gradient Overlay */}
      <div className="absolute inset-0 bg-gradient-to-r from-netflix-black via-netflix-black/70 to-transparent" />
      <div className="absolute inset-0 bg-gradient-to-t from-netflix-black via-transparent to-netflix-black/40" />
      
      {/* Control Buttons - Top Right */}
      <div className="absolute top-24 right-8 z-30 flex items-center gap-3">
        {/* Autoplay Toggle */}
        <button
          onClick={toggleAutoplay}
          className="bg-black/50 hover:bg-black/70 text-white p-2.5 rounded-full border-2 border-white/40 hover:border-white/70 transition-all duration-200 hover:scale-110"
          aria-label={isAutoPlaying ? "Pause autoplay" : "Resume autoplay"}
        >
          {isAutoPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
        </button>
      </div>
      
      {/* Navigation Arrows - Visible on hover */}
      <button
        onClick={prevSlide}
        disabled={isTransitioning}
        className={`absolute left-4 top-1/2 -translate-y-1/2 z-30 bg-black/50 hover:bg-black/70 text-white p-4 rounded-full transition-all duration-300 ${
          isHovering ? 'opacity-100 scale-100' : 'opacity-0 scale-90'
        } hover:scale-110 disabled:opacity-50 disabled:cursor-not-allowed`}
        aria-label="Previous slide"
      >
        <ChevronLeft className="w-7 h-7" />
      </button>
      
      <button
        onClick={nextSlide}
        disabled={isTransitioning}
        className={`absolute right-4 top-1/2 -translate-y-1/2 z-30 bg-black/50 hover:bg-black/70 text-white p-4 rounded-full transition-all duration-300 ${
          isHovering ? 'opacity-100 scale-100' : 'opacity-0 scale-90'
        } hover:scale-110 disabled:opacity-50 disabled:cursor-not-allowed`}
        aria-label="Next slide"
      >
        <ChevronRight className="w-7 h-7" />
      </button>
      
      {/* Main Content */}
      <div className="relative z-20 h-full flex items-center md:items-end pb-8 md:pb-32 pt-24">
        <div className="container mx-auto px-6 lg:px-12 max-w-7xl">
          <div className="max-w-2xl space-y-4">
            {/* Title with animation */}
            <h1 className="text-5xl sm:text-6xl lg:text-8xl font-bold text-white leading-tight drop-shadow-2xl">
              {currentItem.title || currentItem.name}
            </h1>
            
            {/* Meta Info */}
            <div className="flex items-center gap-3 text-base">
              {(currentItem.release_date || currentItem.first_air_date) && (
                <span className="px-3 py-1 bg-gray-800/80 rounded text-white font-medium">
                  {new Date(currentItem.release_date || currentItem.first_air_date || '').getFullYear()}
                </span>
              )}
              <div className="flex items-center gap-1">
                <span className="text-yellow-500">●</span>
                <span className="text-yellow-500">●</span>
                <span className="text-yellow-500">●</span>
                <span className="text-gray-400">●</span>
                <span className="text-gray-400">●</span>
              </div>
              <span className="text-white/80 font-medium">8.0</span>
              <span className="text-white/60">{currentItem.media_type === 'tv' ? 'Series' : 'Movie'}</span>
            </div>
            
            {/* Overview */}
            <p className="text-base sm:text-lg text-white/90 line-clamp-3 leading-relaxed max-w-2xl drop-shadow-lg">
              {currentItem.overview}
            </p>
            
            {/* Action Buttons */}
            <div className="flex flex-wrap gap-3 pt-2">
              <Button
                className="bg-white text-black hover:bg-white/90 px-8 py-6 text-base font-bold rounded shadow-xl transition-all duration-200 hover:scale-105 active:scale-95"
                onClick={() => handleWatchNow(currentItem)}
                aria-label={`Play ${currentItem.title || currentItem.name}`}
              >
                <Play className="mr-2 h-5 w-5 fill-black" />
                Play Now
              </Button>
              
              <Button
                className="bg-gray-600/80 hover:bg-gray-600 text-white px-8 py-6 text-base font-bold rounded shadow-xl transition-all duration-200 hover:scale-105 active:scale-95"
                onClick={() => navigate(`/${currentItem.media_type || 'movie'}/${currentItem.id}`)}
                aria-label={`More info about ${currentItem.title || currentItem.name}`}
              >
                <Info className="mr-2 h-5 w-5" />
                More Info
              </Button>

              <Button
                className="bg-transparent border-2 border-white/60 hover:border-white hover:bg-white/10 text-white px-6 py-6 text-base rounded-full transition-all duration-200 hover:scale-105 active:scale-95"
                onClick={(e) => handleAddToWatchlist(currentItem, e)}
                aria-label={isInWatchlist(currentItem.id) ? "Remove from watchlist" : "Add to watchlist"}
              >
                {isInWatchlist(currentItem.id) ? (
                  <Check className="h-5 w-5" />
                ) : (
                  <Plus className="h-5 w-5" />
                )}
              </Button>
            </div>
          </div>
        </div>
      </div>
      
      {/* Slide Indicators */}
      <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 flex space-x-3 z-30">
        {limitedItems.map((_, index) => (
          <button
            key={index}
            disabled={isTransitioning}
            className={`transition-all duration-300 rounded-full focus:outline-none focus:ring-2 focus:ring-white/50 ${
              index === currentIndex
                ? "bg-white w-8 h-[6px]"
                : "bg-white/50 hover:bg-white/70 w-2 h-2"
            } disabled:cursor-not-allowed`}
            onClick={() => goToSlide(index)}
            aria-label={`Go to slide ${index + 1}`}
            aria-current={index === currentIndex ? 'true' : 'false'}
          />
        ))}
      </div>
      
      {/* Progress Bar */}
      <div className="absolute bottom-0 left-0 w-full h-1 bg-white/20 z-20" role="progressbar" aria-valuenow={currentIndex + 1} aria-valuemin={1} aria-valuemax={limitedItems.length}>
        <div 
          className="h-full bg-netflix-red transition-all duration-1000 ease-out"
          style={{ 
            width: `${((currentIndex + 1) / limitedItems.length) * 100}%` 
          }}
        />
      </div>
    </div>
  );
};