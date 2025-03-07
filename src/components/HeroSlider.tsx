import { useEffect, useState, useCallback, useRef } from "react";
import { useToast } from "@/hooks/use-toast";
import { useWatchlist } from "@/contexts/WatchlistContext";
import { getImageUrl } from "@/services/tmdb";
import useEmblaCarousel from "embla-carousel-react";
import { Skeleton } from "./ui/skeleton";
import { useLocalStorage } from "@/hooks/use-local-storage";
import { useNetworkQuality } from "@/hooks/use-network-quality";
import { useIsMobile } from "@/hooks/use-mobile";
import { HeroControls } from "./hero/HeroControls";
import { HeroSlideContent } from "./hero/HeroSlideContent";

interface HeroSliderProps {
  items: Array<{
    id: number;
    title?: string;
    name?: string;
    overview: string;
    backdrop_path: string;
    media_type?: "movie" | "tv";
    release_date?: string;
    first_air_date?: string;
    videos?: {
      results: Array<{
        key: string;
        type: string;
      }>;
    };
  }>;
}

export const HeroSlider = ({ items }: HeroSliderProps) => {
  const { toast } = useToast();
  const { addToWatchlist, isInWatchlist } = useWatchlist();
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true });
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  const [imagesLoaded, setImagesLoaded] = useState<boolean[]>([]);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(true);
  const [autoplayTrailers, setAutoplayTrailers] = useLocalStorage("autoplayTrailers", true);
  const [imageLoadErrors, setImageLoadErrors] = useState<boolean[]>([]);
  const hoverTimerRef = useRef<NodeJS.Timeout>();
  const videoRef = useRef<HTMLIFrameElement>(null);
  const networkQuality = useNetworkQuality();
  const isMobile = useIsMobile();

  useEffect(() => {
    setImagesLoaded(new Array(items.length).fill(false));
    setImageLoadErrors(new Array(items.length).fill(false));
  }, [items.length]);

  const handleImageLoad = useCallback((index: number) => {
    setImagesLoaded(prev => {
      const newState = [...prev];
      newState[index] = true;
      return newState;
    });
  }, []);

  const handleImageError = useCallback((index: number) => {
    console.error(`Failed to load image at index ${index}`);
    setImageLoadErrors(prev => {
      const newState = [...prev];
      newState[index] = true;
      return newState;
    });
    toast({
      title: "Image Load Error",
      description: "Failed to load some images. Please check your connection.",
      variant: "destructive",
    });
  }, [toast]);

  useEffect(() => {
    if (!emblaApi) return;

    const onSelect = () => {
      setSelectedIndex(emblaApi.selectedScrollSnap());
      setIsPlaying(false);
    };

    emblaApi.on("select", onSelect);
    
    return () => {
      if (emblaApi) {
        emblaApi.off("select", onSelect);
      }
    };
  }, [emblaApi]);

  useEffect(() => {
    if (!emblaApi || isHovered) return;

    const intervalId = setInterval(() => {
      if (document.hidden) return;
      emblaApi.scrollNext();
    }, 5000);

    return () => clearInterval(intervalId);
  }, [emblaApi, isHovered]);

  const handleAddToWatchlist = useCallback((item: HeroSliderProps["items"][0]) => {
    const mediaItem = {
      id: item.id,
      title: item.title || item.name || "",
      mediaType: item.media_type || "movie",
      posterPath: item.backdrop_path,
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
      description: "Successfully added to your watchlist",
    });
  }, [addToWatchlist, isInWatchlist, toast]);

  const getVideoQuality = useCallback(() => {
    switch (networkQuality) {
      case 'low':
        return 'small';
      case 'medium':
        return 'medium';
      default:
        return 'large';
    }
  }, [networkQuality]);

  const shouldAutoplayOnNetwork = useCallback(() => {
    if (networkQuality === 'low' || isMobile) return false;
    return autoplayTrailers;
  }, [networkQuality, autoplayTrailers, isMobile]);

  const handleSlideHover = useCallback((item: HeroSliderProps["items"][0]) => {
    if (!shouldAutoplayOnNetwork()) {
      if (networkQuality === 'low') {
        toast({
          title: "Video playback limited",
          description: "Trailer autoplay is disabled due to network conditions",
        });
      }
      return;
    }
    
    clearTimeout(hoverTimerRef.current);
    
    hoverTimerRef.current = setTimeout(() => {
      const trailer = item.videos?.results.find(
        video => video.type.toLowerCase() === "trailer"
      );
      
      if (trailer) {
        setIsPlaying(true);
        toast({
          title: `Now Playing: ${item.title || item.name} Trailer`,
        });
      }
    }, 3000);
  }, [shouldAutoplayOnNetwork, networkQuality, toast]);

  const handleSlideLeave = useCallback(() => {
    clearTimeout(hoverTimerRef.current);
    setIsPlaying(false);
  }, []);

  const toggleMute = useCallback(() => {
    setIsMuted(prev => !prev);
  }, []);

  const limitedItems = items.slice(0, 5);

  if (!items.length) {
    return (
      <div className="relative w-full h-[50vh] md:h-[70vh] lg:h-screen">
        <Skeleton className="w-full h-full" />
      </div>
    );
  }

  const currentItem = limitedItems[selectedIndex];
  const trailer = currentItem.videos?.results.find(
    video => video.type.toLowerCase() === "trailer"
  );

  return (
    <div
      className="relative w-full h-[50vh] md:h-[70vh] lg:h-screen overflow-hidden"
      onMouseEnter={() => !isMobile && setIsHovered(true)}
      onMouseLeave={() => {
        if (!isMobile) {
          setIsHovered(false);
          handleSlideLeave();
        }
      }}
    >
      <div ref={emblaRef} className="w-full h-full overflow-hidden">
        <div className="flex h-full w-full">
          {limitedItems.map((item, index) => (
            <div
              key={item.id}
              className="relative flex-none w-full h-full"
              onMouseEnter={() => !isMobile && handleSlideHover(item)}
              onMouseLeave={() => !isMobile && handleSlideLeave()}
            >
              {!imagesLoaded[index] && !imageLoadErrors[index] && (
                <Skeleton className="absolute inset-0 w-full h-full" />
              )}
              {imageLoadErrors[index] ? (
                <div className="absolute inset-0 flex items-center justify-center bg-gray-800">
                  <p className="text-white text-center">Failed to load image</p>
                </div>
              ) : isPlaying && trailer ? (
                <div className="absolute inset-0 w-full h-full bg-black">
                  <iframe
                    ref={videoRef}
                    className="w-full h-full"
                    src={`https://www.youtube.com/embed/${trailer.key}?autoplay=1&mute=${isMuted ? 1 : 0}&controls=0&modestbranding=1&vq=${getVideoQuality()}`}
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  />
                </div>
              ) : (
                <img
                  src={getImageUrl(item.backdrop_path, networkQuality === 'low' ? 'w780' : 'original')}
                  alt={item.title || item.name}
                  className={`h-full w-full object-cover transition-opacity duration-300 ${
                    imagesLoaded[index] ? 'opacity-100' : 'opacity-0'
                  }`}
                  loading="lazy"
                  onLoad={() => handleImageLoad(index)}
                  onError={() => handleImageError(index)}
                />
              )}
              <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/50 to-transparent" />
              <HeroSlideContent
                title={item.title || item.name || ""}
                overview={item.overview}
                mediaType={item.media_type || "movie"}
                id={item.id}
                onAddToWatchlist={() => handleAddToWatchlist(item)}
              />
            </div>
          ))}
        </div>
      </div>

      {/* Slider Controls */}
      <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1 z-20 sm:bottom-4 md:bottom-3">
        {limitedItems.map((_, index) => (
          <button
            key={index}
            className={`w-1 h-1 rounded-full transition-all duration-300 ${
              index === selectedIndex
                ? "bg-white scale-125"
                : "bg-white/50 hover:bg-white/75"
            }`}
            onClick={() => emblaApi?.scrollTo(index)}
            aria-label={`Go to slide ${index + 1}`}
          />
        ))}
      </div>

      {/* Autoplay Controls */}
      {!isMobile && (
        <HeroControls
          autoplayTrailers={autoplayTrailers}
          setAutoplayTrailers={setAutoplayTrailers}
        />
      )}
    </div>
  );
};
