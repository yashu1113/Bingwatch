import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Play, Plus, Check, ChevronLeft, ChevronRight, Volume2, VolumeX } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useWatchlist } from "@/contexts/WatchlistContext";
import { useToast } from "@/hooks/use-toast";
import { getImageUrl, getVideos } from "@/services/tmdb";

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
  };

  const prevSlide = () => {
    setCurrentIndex((prev) => (prev - 1 + limitedItems.length) % limitedItems.length);
    setIsAutoPlaying(false);
    setTimeout(() => setIsAutoPlaying(true), 10000);
  };

  const goToSlide = (index: number) => {
    setCurrentIndex(index);
    setIsAutoPlaying(false);
    setTimeout(() => setIsAutoPlaying(true), 10000);
  };

  if (!limitedItems.length) {
    return (
      <div className="relative w-full h-[80vh] lg:h-[90vh] bg-gray-900 animate-pulse" />
    );
  }

  const toggleMute = () => {
    setIsMuted(!isMuted);
    // Update the iframe src to toggle mute parameter
    const currentVideoElement = playerRefs.current[currentItem.id];
    if (currentVideoElement) {
      const hasTrailer = videoData[currentItem.id];
      if (hasTrailer) {
        const muteParam = isMuted ? 0 : 1;
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
                  console.log('Setting iframe ref for item:', item.id, 'element:', el);
                  if (el && index === currentIndex) {
                    playerRefs.current[item.id] = el;
                    console.log('playerRefs updated for item:', item.id);
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
      <div className="relative z-20 h-full flex items-end pb-20 md:pb-28">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="max-w-3xl space-y-6">
            {/* Title with animation */}
            <h1 className="text-4xl sm:text-5xl lg:text-7xl font-bold text-foreground leading-tight animate-fade-in">
              {currentItem.title || currentItem.name}
            </h1>
            
            {/* Release Year */}
            {(currentItem.release_date || currentItem.first_air_date) && (
              <div className="text-lg text-foreground/70 font-medium">
                {new Date(currentItem.release_date || currentItem.first_air_date || '').getFullYear()}
              </div>
            )}
            
            {/* Overview */}
            <p className="text-base sm:text-lg lg:text-xl text-foreground/90 line-clamp-3 leading-relaxed max-w-2xl">
              {currentItem.overview}
            </p>
            
            {/* Action Buttons - Removed spacing */}
            <div className="flex flex-col sm:flex-row gap-0 pt-3">
              <Button
                className="px-6 py-3 text-sm sm:text-base rounded-l-xl sm:rounded-r-none rounded-r-xl shadow-lg hover-scale"
                onClick={() => handleWatchNow(currentItem)}
              >
                <Play className="mr-2 h-5 w-5" />
                Watch Now
              </Button>
              
              <Button
                variant="outline"
                className="border border-border bg-background/30 text-foreground hover:bg-background/40 backdrop-blur-sm px-6 py-3 text-sm sm:text-base rounded-r-xl sm:rounded-l-none rounded-l-xl sm:border-l-0 shadow-lg hover-scale"
                onClick={() => handleAddToWatchlist(currentItem)}
              >
                {isInWatchlist(currentItem.id) ? (
                  <Check className="mr-2 h-5 w-5" />
                ) : (
                  <Plus className="mr-2 h-5 w-5" />
                )}
                {isInWatchlist(currentItem.id) ? "In Watchlist" : "Add to Watchlist"}
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