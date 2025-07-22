import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Play, Plus, Check, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useWatchlist } from "@/contexts/WatchlistContext";
import { useToast } from "@/hooks/use-toast";
import { getImageUrl } from "@/services/tmdb";

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
  const navigate = useNavigate();
  const { addToWatchlist, isInWatchlist } = useWatchlist();
  const { toast } = useToast();

  const limitedItems = items.slice(0, 5);

  useEffect(() => {
    if (limitedItems.length === 0 || !isAutoPlaying) return;

    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % limitedItems.length);
    }, 6000);

    return () => clearInterval(interval);
  }, [limitedItems.length, isAutoPlaying]);

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

  const currentItem = limitedItems[currentIndex];

  return (
    <div className="relative w-full h-[80vh] lg:h-[90vh] overflow-hidden">
      {/* Background Images with smooth transition */}
      {limitedItems.map((item, index) => (
        <div
          key={item.id}
          className={`absolute inset-0 bg-cover bg-center bg-no-repeat transition-opacity duration-1000 ${
            index === currentIndex ? 'opacity-100' : 'opacity-0'
          }`}
          style={{
            backgroundImage: `url(${getImageUrl(item.backdrop_path, 'original')})`
          }}
        />
      ))}
      
      {/* Enhanced Gradient Overlay */}
      <div className="absolute inset-0 bg-gradient-to-r from-black/90 via-black/60 to-black/20" />
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
      
      {/* Navigation Arrows */}
      <button
        onClick={prevSlide}
        className="absolute left-4 top-1/2 -translate-y-1/2 z-30 bg-black/50 hover:bg-black/70 text-white p-3 rounded-full transition-all duration-300 hover:scale-110"
        aria-label="Previous slide"
      >
        <ChevronLeft className="w-6 h-6" />
      </button>
      
      <button
        onClick={nextSlide}
        className="absolute right-4 top-1/2 -translate-y-1/2 z-30 bg-black/50 hover:bg-black/70 text-white p-3 rounded-full transition-all duration-300 hover:scale-110"
        aria-label="Next slide"
      >
        <ChevronRight className="w-6 h-6" />
      </button>
      
      {/* Main Content */}
      <div className="relative z-20 h-full flex items-center">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="max-w-3xl space-y-6">
            {/* Title with animation */}
            <h1 className="text-4xl sm:text-5xl lg:text-7xl font-bold text-white leading-tight animate-fade-in">
              {currentItem.title || currentItem.name}
            </h1>
            
            {/* Release Year */}
            {(currentItem.release_date || currentItem.first_air_date) && (
              <div className="text-lg text-gray-300 font-medium">
                {new Date(currentItem.release_date || currentItem.first_air_date || '').getFullYear()}
              </div>
            )}
            
            {/* Overview */}
            <p className="text-base sm:text-lg lg:text-xl text-gray-100 line-clamp-3 leading-relaxed max-w-2xl">
              {currentItem.overview}
            </p>
            
            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-3 pt-4">
              <Button
                size="lg"
                className="bg-white text-black hover:bg-gray-200 font-bold px-8 py-4 text-base sm:text-lg rounded-lg transition-all duration-300 hover:scale-105 shadow-xl"
                onClick={() => handleWatchNow(currentItem)}
              >
                <Play className="mr-3 h-6 w-6 fill-black" />
                Watch Now
              </Button>
              
              <Button
                variant="outline"
                size="lg"
                className="border-2 border-white/60 text-white bg-white/10 hover:bg-white/20 backdrop-blur-sm font-bold px-8 py-4 text-base sm:text-lg rounded-lg transition-all duration-300 hover:scale-105 shadow-xl"
                onClick={() => handleAddToWatchlist(currentItem)}
              >
                {isInWatchlist(currentItem.id) ? (
                  <Check className="mr-3 h-6 w-6" />
                ) : (
                  <Plus className="mr-3 h-6 w-6" />
                )}
                {isInWatchlist(currentItem.id) ? "In Watchlist" : "Add to Watchlist"}
              </Button>
            </div>
          </div>
        </div>
      </div>
      
      {/* Slide Indicators - Smaller and more elegant */}
      <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 flex space-x-3 z-30">
        {limitedItems.map((_, index) => (
          <button
            key={index}
            className={`transition-all duration-300 rounded-full ${
              index === currentIndex
                ? "bg-white w-8 h-2"
                : "bg-white/40 hover:bg-white/60 w-2 h-2"
            }`}
            onClick={() => goToSlide(index)}
            aria-label={`Go to slide ${index + 1}`}
          />
        ))}
      </div>
      
      {/* Progress Bar */}
      <div className="absolute bottom-0 left-0 w-full h-1 bg-white/20 z-20">
        <div 
          className="h-full bg-red-600 transition-all duration-300"
          style={{ 
            width: `${((currentIndex + 1) / limitedItems.length) * 100}%` 
          }}
        />
      </div>
    </div>
  );
};