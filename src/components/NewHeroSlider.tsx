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
  const [hoveredItemId, setHoveredItemId] = useState<number | null>(null);
  const [isPlayingTrailer, setIsPlayingTrailer] = useState(false);
  const hoverTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const navigate = useNavigate();
  const { addToWatchlist, isInWatchlist } = useWatchlist();
  const { toast } = useToast();

  const limitedItems = items.slice(0, 5);

  // Fetch video data for each item
  useEffect(() => {
    const fetchVideos = async () => {
      console.log("Fetching videos for items:", limitedItems.length);
      const videoPromises = limitedItems.map(async (item) => {
        try {
          const mediaType = item.media_type || "movie";
          const videos = await getVideos(mediaType, item.id);
          const trailer = videos.results?.find((video: any) => 
            video.type === "Trailer" && video.site === "YouTube"
          );
          console.log(`Trailer for ${item.title || item.name}:`, trailer ? trailer.key : "No trailer found");
          return { id: item.id, trailer };
        } catch (error) {
          console.error(`Error fetching videos for item ${item.id}:`, error);
          return { id: item.id, trailer: null };
        }
      });

      const results = await Promise.all(videoPromises);
      const videoMap = results.reduce((acc, { id, trailer }) => {
        acc[id] = trailer;
        return acc;
      }, {} as Record<number, any>);
      
      setVideoData(videoMap);
      console.log("Video data fetched:", videoMap);
    };

    if (limitedItems.length > 0) {
      fetchVideos();
    }
  }, [limitedItems]);

  // Auto-play functionality
  useEffect(() => {
    if (limitedItems.length === 0 || !isAutoPlaying || isPlayingTrailer) return;

    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % limitedItems.length);
    }, 6000);

    return () => clearInterval(interval);
  }, [limitedItems.length, isAutoPlaying, isPlayingTrailer]);

  // Reset states when slide changes
  useEffect(() => {
    setHoveredItemId(null);
    setIsPlayingTrailer(false);
    if (hoverTimeoutRef.current) {
      clearTimeout(hoverTimeoutRef.current);
      hoverTimeoutRef.current = null;
    }
  }, [currentIndex]);

  const currentItem = limitedItems[currentIndex];

  const handleMouseEnter = (itemId: number) => {
    console.log("Mouse entered item:", itemId);
    setHoveredItemId(itemId);
    
    // Clear any existing timeout
    if (hoverTimeoutRef.current) {
      clearTimeout(hoverTimeoutRef.current);
    }
    
    // Set timeout for 3 seconds
    hoverTimeoutRef.current = setTimeout(() => {
      const hasTrailer = videoData[itemId];
      console.log("3 seconds elapsed, has trailer:", !!hasTrailer);
      if (hasTrailer && itemId === currentItem.id) {
        setIsPlayingTrailer(true);
        setIsAutoPlaying(false);
        console.log("Starting trailer playback for item:", itemId);
      }
    }, 3000);
  };

  const handleMouseLeave = (itemId: number) => {
    console.log("Mouse left item:", itemId);
    setHoveredItemId(null);
    setIsPlayingTrailer(false);
    
    // Clear timeout
    if (hoverTimeoutRef.current) {
      clearTimeout(hoverTimeoutRef.current);
      hoverTimeoutRef.current = null;
    }
    
    // Resume auto-playing after a delay
    setTimeout(() => {
      setIsAutoPlaying(true);
    }, 1000);
  };

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

  const toggleMute = () => {
    setIsMuted(!isMuted);
    console.log("Toggled mute:", !isMuted);
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

  const hasTrailer = videoData[currentItem.id];
  const shouldShowTrailer = isPlayingTrailer && hasTrailer && hoveredItemId === currentItem.id;

  return (
    <div 
      className="relative w-full h-[80vh] lg:h-[90vh] overflow-hidden"
      onMouseEnter={() => handleMouseEnter(currentItem.id)}
      onMouseLeave={() => handleMouseLeave(currentItem.id)}
    >
      {/* Background Media */}
      <div className="absolute inset-0 bg-background" />
      
      {shouldShowTrailer ? (
        // YouTube Trailer
        <div className="absolute inset-0 w-full h-full">
          <iframe
            src={`https://www.youtube.com/embed/${hasTrailer.key}?autoplay=1&mute=${isMuted ? 1 : 0}&controls=0&showinfo=0&rel=0&iv_load_policy=3&modestbranding=1&playsinline=1&enablejsapi=1&origin=${window.location.origin}`}
            className="w-full h-full object-cover"
            style={{ pointerEvents: 'none' }}
            allow="autoplay; encrypted-media; fullscreen; picture-in-picture"
            title={`${currentItem.title || currentItem.name} Trailer`}
          />
        </div>
      ) : (
        // Backdrop Image (Poster)
        <div className="absolute inset-0 w-full h-full">
          <img
            src={getImageUrl(currentItem.backdrop_path, 'original')}
            alt={`${currentItem.title || currentItem.name} backdrop`}
            className="w-full h-full object-cover object-center"
            loading="eager"
            decoding="async"
            fetchPriority="high"
          />
        </div>
      )}
      
      {/* Enhanced Gradient Overlay */}
      <div className="absolute inset-0 bg-gradient-to-r from-background/90 via-background/60 to-background/20" />
      <div className="absolute inset-0 bg-gradient-to-t from-background/80 via-transparent to-transparent" />
      
      {/* Mute/Unmute Button - Always visible */}
      <button
        onClick={toggleMute}
        className="absolute top-4 right-4 z-30 bg-background/60 hover:bg-background/80 text-foreground p-3 rounded-full transition-all duration-300 hover:scale-110"
        aria-label={isMuted ? "Unmute" : "Mute"}
      >
        {isMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
      </button>
      
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
            <p className="text-base sm:text-lg lg:text-xl text-foreground/90 line-clamp-4 sm:line-clamp-3 lg:line-clamp-4 leading-relaxed max-w-3xl">
              {currentItem.overview}
            </p>
            
            {/* Action Buttons */}
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
      
      {/* Debug Info (remove in production) */}
      {process.env.NODE_ENV === 'development' && (
        <div className="absolute top-20 left-4 z-50 bg-black/80 text-white p-2 rounded text-xs">
          <div>Current: {currentItem.title || currentItem.name}</div>
          <div>Hovered ID: {hoveredItemId}</div>
          <div>Playing Trailer: {isPlayingTrailer.toString()}</div>
          <div>Has Trailer: {!!hasTrailer}</div>
          <div>Should Show: {shouldShowTrailer.toString()}</div>
          <div>Muted: {isMuted.toString()}</div>
        </div>
      )}
    </div>
  );
};