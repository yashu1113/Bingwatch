import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Play, Plus, Check, ChevronLeft, ChevronRight, Volume2, VolumeX } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useWatchlist } from "@/contexts/WatchlistContext";
import { useToast } from "@/hooks/use-toast";
import { getImageUrl, getVideos } from "@/services/tmdb";
import { motion, AnimatePresence, useAnimation } from "framer-motion";
import { usePlayerSettings } from "@/contexts/PlayerSettingsContext";

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
  const [isMuted, setIsMuted] = useState(true);
  const playerRefs = useRef<Record<number, any>>({});
  const navigate = useNavigate();
  const { addToWatchlist, isInWatchlist } = useWatchlist();
  const { toast } = useToast();
  const { settings } = usePlayerSettings();
  const contentControls = useAnimation();

  // Animation variants based on user settings
  const getSlideVariants = () => {
    const duration = settings.animationIntensity === 'minimal' ? 0.3 :
                     settings.animationIntensity === 'reduced' ? 0.5 : 0.8;

    if (settings.animationIntensity === 'minimal') {
      return {
        initial: { opacity: 0 },
        animate: { opacity: 1 },
        exit: { opacity: 0 },
      };
    }

    return {
      initial: { opacity: 0, scale: 1.1, x: 50 },
      animate: {
        opacity: 1,
        scale: 1,
        x: 0,
        transition: {
          duration,
          ease: 'easeInOut',
        }
      },
      exit: {
        opacity: 0,
        scale: 0.9,
        x: -50,
        transition: {
          duration: duration * 0.7,
          ease: 'easeInOut',
        }
      },
    };
  };

  const slideVariants = getSlideVariants();

  const limitedItems = items.slice(0, 5);

  // Fetch video data for each item
  useEffect(() => {
    const fetchVideos = async () => {
      const videoPromises = limitedItems.map(async (item) => {
        try {
          const mediaType = item.media_type || "movie";
          const videos = await getVideos(mediaType, item.id);
          const trailer = videos.results?.find((video: any) => 
            video.type === "Trailer" && video.site === "YouTube"
          );
          return { id: item.id, trailer };
        } catch (error) {
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

  useEffect(() => {
    if (limitedItems.length === 0 || !isAutoPlaying) return;

    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % limitedItems.length);
    }, 6000);

    return () => clearInterval(interval);
  }, [limitedItems.length, isAutoPlaying]);

  const currentItem = limitedItems[currentIndex];

  const handleWatchNow = (item: HeroSliderProps["items"][0]) => {
    const mediaType = item.media_type || "movie";
    const route = mediaType === "movie" ? `/movie/${item.id}` : `/tv/${item.id}`;
    navigate(route);
  };

  const handleAddToWatchlist = (item: HeroSliderProps["items"][0]) => {
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

  const nextSlide = () => {
    setCurrentIndex((prev) => (prev + 1) % limitedItems.length);
    setIsAutoPlaying(false);
    setTimeout(() => setIsAutoPlaying(true), 10000);
    // Restart content animation
    contentControls.start('animate');
  };

  const prevSlide = () => {
    setCurrentIndex((prev) => (prev - 1 + limitedItems.length) % limitedItems.length);
    setIsAutoPlaying(false);
    setTimeout(() => setIsAutoPlaying(true), 10000);
    // Restart content animation
    contentControls.start('animate');
  };

  const goToSlide = (index: number) => {
    setCurrentIndex(index);
    setIsAutoPlaying(false);
    setTimeout(() => setIsAutoPlaying(true), 10000);
    // Restart content animation
    contentControls.start('animate');
  };

  // Animate content when slide changes
  useEffect(() => {
    contentControls.start('animate');
  }, [currentIndex, contentControls]);

  if (!limitedItems.length) {
    return (
      <div className="relative w-full h-[80vh] lg:h-[90vh] bg-gray-900 animate-pulse" />
    );
  }

  const toggleMute = () => {
    const newMutedState = !isMuted;
    setIsMuted(newMutedState);
    
    // Update the iframe src to toggle mute parameter
    const currentVideoElement = playerRefs.current[currentItem.id];
    if (currentVideoElement) {
      const hasTrailer = videoData[currentItem.id];
      if (hasTrailer) {
        const muteParam = newMutedState ? 1 : 0;
        currentVideoElement.src = `https://www.youtube.com/embed/${hasTrailer.key}?autoplay=1&mute=${muteParam}&loop=1&playlist=${hasTrailer.key}&controls=0&showinfo=0&rel=0&iv_load_policy=3&modestbranding=1&playsinline=1`;
      }
    }
  };

  return (
    <div className="relative w-full h-[80vh] lg:h-[90vh] overflow-hidden">
      {/* Background Media with smooth transition */}
      <div className="absolute inset-0 bg-background" />
      {limitedItems.map((item, index) => {
        const hasTrailer = videoData[item.id];
        const muteParam = isMuted ? 1 : 0;
        return (
          <div key={item.id} className={`absolute inset-0 w-full h-full transition-opacity duration-1000 ${index === currentIndex ? 'opacity-100' : 'opacity-0'}`}>
            {hasTrailer ? (
              <iframe
                ref={(el) => {
                  if (el && index === currentIndex) {
                    playerRefs.current[item.id] = el;
                  }
                }}
                src={`https://www.youtube.com/embed/${hasTrailer.key}?autoplay=1&mute=${muteParam}&loop=1&playlist=${hasTrailer.key}&controls=0&showinfo=0&rel=0&iv_load_policy=3&modestbranding=1&playsinline=1`}
                className="w-full h-full object-cover"
                style={{ pointerEvents: 'none' }}
                allow="autoplay; encrypted-media"
                loading={index === currentIndex ? 'eager' : 'lazy'}
              />
            ) : (
              <img
                src={getImageUrl(item.backdrop_path, 'original')}
                alt={`${item.title || item.name} backdrop`}
                className="w-full h-full object-contain object-center"
                loading={index === currentIndex ? 'eager' : 'lazy'}
                decoding="async"
                fetchPriority={index === currentIndex ? 'high' : 'low'}
              />
            )}
          </div>
        );
      })}
      
      {/* Enhanced Gradient Overlay */}
      <div className="absolute inset-0 bg-gradient-to-r from-background/90 via-background/60 to-background/20" />
      <div className="absolute inset-0 bg-gradient-to-t from-background/80 via-transparent to-transparent" />
      
      {/* Mute/Unmute Button */}
      {videoData[currentItem.id] && (
        <button
          onClick={toggleMute}
          className="absolute top-4 right-4 z-30 bg-background/60 hover:bg-background/80 text-foreground p-3 rounded-full transition-all duration-300 hover:scale-110"
          aria-label={isMuted ? "Unmute" : "Mute"}
        >
          {isMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
        </button>
      )}
      
      {/* Navigation Arrows */}
      <button
        onClick={prevSlide}
        className="absolute left-4 top-1/2 -translate-y-1/2 z-30 bg-background/60 hover:bg-background/80 text-foreground p-3 rounded-full transition-all duration-300 hover:scale-110"
        aria-label="Previous slide"
      >
        <ChevronLeft className="w-6 h-6" />
      </button>
      
      <button
        onClick={nextSlide}
        className="absolute right-4 top-1/2 -translate-y-1/2 z-30 bg-background/60 hover:bg-background/80 text-foreground p-3 rounded-full transition-all duration-300 hover:scale-110"
        aria-label="Next slide"
      >
        <ChevronRight className="w-6 h-6" />
      </button>
      
      {/* Main Content */}
      <div className="relative z-20 h-full flex items-end pb-24 md:pb-32">
        <div className="container mx-auto px-4 lg:px-8">
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
                className="bg-white text-black hover:bg-white/90 px-8 py-6 text-base font-bold rounded shadow-xl transition-transform hover:scale-105"
                onClick={() => handleWatchNow(currentItem)}
              >
                <Play className="mr-2 h-5 w-5 fill-black" />
                Play Now
              </Button>
              
              <Button
                className="bg-netflix-red hover:bg-netflix-red/90 text-white px-8 py-6 text-base font-bold rounded shadow-xl transition-transform hover:scale-105"
                onClick={() => navigate(`/${currentItem.media_type || 'movie'}/${currentItem.id}`)}
              >
                <svg className="mr-2 h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                </svg>
                More Info
              </Button>

              <Button
                className="bg-transparent border-2 border-white/60 hover:border-white text-white px-6 py-6 text-base rounded-full transition-transform hover:scale-105"
                onClick={() => handleAddToWatchlist(currentItem)}
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
            className={`transition-all duration-300 rounded-full ${
              index === currentIndex
                ? "bg-foreground w-6 h-[6px]"
                : "bg-foreground/50 hover:bg-foreground/70 w-2 h-2"
            }`}
            onClick={() => goToSlide(index)}
            aria-label={`Go to slide ${index + 1}`}
          />
        ))}
      </div>
      
      {/* Progress Bar */}
      <div className="absolute bottom-0 left-0 w-full h-1 bg-foreground/20 z-20">
        <div 
          className="h-full bg-primary transition-all duration-300"
          style={{ 
            width: `${((currentIndex + 1) / limitedItems.length) * 100}%` 
          }}
        />
      </div>
    </div>
  );
};