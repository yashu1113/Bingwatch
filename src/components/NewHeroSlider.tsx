import { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { Play, Plus, Check, ChevronLeft, ChevronRight, Volume2, VolumeX, Info, Pause } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useWatchlist } from "@/contexts/WatchlistContext";
import { useToast } from "@/hooks/use-toast";
import { getImageUrl, getVideos } from "@/services/tmdb";
import { useIntersectionObserver } from "@/hooks/use-intersection-observer";

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
  const [videoData, setVideoData] = useState<Record<number, any>>({});
  const [isMuted, setIsMuted] = useState(false);
  const [isHovering, setIsHovering] = useState(false);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [loadedVideos, setLoadedVideos] = useState<Set<number>>(new Set());
  
  const playerRefs = useRef<Record<number, HTMLIFrameElement | null>>({});
  const playerReadyRef = useRef<Record<number, boolean>>({});
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

  // Fetch YouTube trailers for each item
  useEffect(() => {
    const fetchVideos = async () => {
      const videoPromises = limitedItems.map(async (item) => {
        try {
          const mediaType = item.media_type || "movie";
          const videos = await getVideos(mediaType, item.id);
          // Find the best trailer (official trailer first, then any trailer)
          const officialTrailer = videos.results?.find((video: any) => 
            video.type === "Trailer" && 
            video.site === "YouTube" && 
            video.name?.toLowerCase().includes("official")
          );
          const anyTrailer = videos.results?.find((video: any) => 
            video.type === "Trailer" && video.site === "YouTube"
          );
          return { id: item.id, trailer: officialTrailer || anyTrailer };
        } catch (error) {
          console.error(`Error fetching trailer for ${item.title || item.name}:`, error);
          return { id: item.id, trailer: null };
        }
      });

      const results = await Promise.all(videoPromises);
      const videoMap = results.reduce((acc, { id, trailer }) => {
        acc[id] = trailer;
        return acc;
      }, {} as Record<number, any>);
      
      setVideoData(videoMap);
    };

    if (limitedItems.length > 0) {
      fetchVideos();
    }
  }, [limitedItems]);

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

  // Navigation handlers
  const handleWatchNow = (item: HeroSliderProps["items"][0]) => {
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
      } else if (e.key === 'm' || e.key === 'M') {
        e.preventDefault();
        toggleMute();
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

  const toggleMute = () => {
    const newMutedState = !isMuted;
    setIsMuted(newMutedState);
    
    // Control all loaded players for smooth transition
    Object.entries(playerRefs.current).forEach(([id, player]) => {
      if (player && player.contentWindow && playerReadyRef.current[Number(id)]) {
        const command = newMutedState ? 'mute' : 'unMute';
        player.contentWindow.postMessage(
          JSON.stringify({ event: 'command', func: command, args: [] }),
          '*'
        );
      }
    });
  };

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
      {/* Background Media with smooth transition */}
      <div className="absolute inset-0 bg-netflix-black" />
      {limitedItems.map((item, index) => {
        const hasTrailer = videoData[item.id];
        const isActive = index === currentIndex;
        return (
          <div 
            key={item.id} 
            className={`absolute inset-0 w-full h-full transition-all duration-1000 ${
              isActive ? 'opacity-100 z-10' : 'opacity-0 z-0'
            }`}
          >
            {hasTrailer ? (
              <div className="w-full h-full relative">
                <iframe
                  ref={(el) => {
                    if (el) {
                      playerRefs.current[item.id] = el;
                      // Initialize player when it becomes active
                      if (isActive && !loadedVideos.has(item.id)) {
                        el.onload = () => {
                          setTimeout(() => {
                            playerReadyRef.current[item.id] = true;
                            setLoadedVideos(prev => new Set([...prev, item.id]));
                            
                            if (el.contentWindow && isIntersecting) {
                              // Auto-play with current mute state
                              el.contentWindow.postMessage(
                                JSON.stringify({ 
                                  event: 'command', 
                                  func: isMuted ? 'mute' : 'unMute', 
                                  args: [] 
                                }),
                                '*'
                              );
                              // Set full volume
                              el.contentWindow.postMessage(
                                JSON.stringify({ 
                                  event: 'command', 
                                  func: 'setVolume', 
                                  args: [100] 
                                }),
                                '*'
                              );
                              // Play the video
                              el.contentWindow.postMessage(
                                JSON.stringify({ 
                                  event: 'command', 
                                  func: 'playVideo', 
                                  args: [] 
                                }),
                                '*'
                              );
                            }
                          }, 1000);
                        };
                      }
                    }
                  }}
                  src={`https://www.youtube.com/embed/${hasTrailer.key}?autoplay=1&mute=${isMuted ? 1 : 0}&loop=1&playlist=${hasTrailer.key}&controls=0&showinfo=0&rel=0&iv_load_policy=3&modestbranding=1&playsinline=1&enablejsapi=1&origin=${window.location.origin}`}
                  className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[177.77vh] h-[56.25vw] min-h-full min-w-full"
                  style={{ pointerEvents: 'none' }}
                  allow="autoplay; encrypted-media"
                  title={`${item.title || item.name} trailer`}
                  loading={isActive ? 'eager' : 'lazy'}
                />
              </div>
            ) : (
              <img
                src={getImageUrl(item.backdrop_path, 'original')}
                alt={`${item.title || item.name} backdrop`}
                className="w-full h-full object-cover"
                loading={isActive ? 'eager' : 'lazy'}
                onError={(e) => {
                  e.currentTarget.src = 'https://placehold.co/1920x1080?text=No+Image';
                }}
              />
            )}
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
        
        {/* Mute/Unmute Button */}
        {videoData[currentItem.id] && (
          <button
            onClick={toggleMute}
            className="bg-black/50 hover:bg-black/70 text-white p-2.5 rounded-full border-2 border-white/40 hover:border-white/70 transition-all duration-200 hover:scale-110"
            aria-label={isMuted ? "Unmute trailer" : "Mute trailer"}
          >
            {isMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
          </button>
        )}
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