import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Play, Plus, ChevronLeft, ChevronRight } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useWatchlist } from "@/contexts/WatchlistContext";
import { getImageUrl } from "@/services/tmdb";
import useEmblaCarousel from "embla-carousel-react";

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
  }> ;
}

export const HeroSlider = ({ items }: HeroSliderProps) => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { addToWatchlist, isInWatchlist } = useWatchlist();
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true });
  const [isHovered, setIsHovered] = useState(false);

  // Auto-slide logic
  useEffect(() => {
    if (!emblaApi) return;

    const autoScroll = () => {
      if (!isHovered) emblaApi.scrollNext();
    };

    const intervalId = setInterval(autoScroll, 3000);
    return () => clearInterval(intervalId);
  }, [emblaApi, isHovered]);

  const handleAddToWatchlist = (item: HeroSliderProps["items"][0]) => {
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
  };

  const limitedItems = items.slice(0, 5);

  return (
    <div
      className="relative w-full h-screen" // Fullscreen
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div ref={emblaRef} className="w-full h-full overflow-hidden">
        <div className="flex w-full h-full">
          {limitedItems.map((item) => (
            <div
              key={item.id}
              className="relative flex-none w-full h-full"
            >
              <img
                src={getImageUrl(item.backdrop_path, "original")}
                alt={item.title || item.name}
                className="h-full w-full object-cover"
                loading="lazy"
              />
              <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/50 to-transparent" />
              <div className="absolute bottom-0 left-0 right-0 p-6 md:p-8 lg:p-12">
                <div className="container mx-auto">
                  <div className="max-w-2xl space-y-2 md:space-y-4">
                    <h2 className="text-3xl md:text-4xl lg:text-6xl font-bold text-white line-clamp-2">
                      {item.title || item.name}
                    </h2>
                    <p className="line-clamp-3 text-xs md:text-sm lg:text-base text-gray-200">
                      {item.overview}
                    </p>
                    <div className="flex flex-wrap gap-4 pt-4">
                      <Button
                        size="lg"
                        className="gap-2 bg-netflix-red hover:bg-netflix-red/90 text-sm md:text-base"
                        onClick={() =>
                          navigate(`/${item.media_type || "movie"}/${item.id}`)
                        }
                      >
                        <Play className="h-6 w-6" />
                        Watch Now
                      </Button>
                      <Button
                        variant="outline"
                        size="lg"
                        className="gap-2 border-white text-white hover:bg-white/10 text-sm md:text-base"
                        onClick={() => handleAddToWatchlist(item)}
                      >
                        <Plus className="h-6 w-6" />
                        Add to Watchlist
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Navigation Buttons */}
      <button
        className="absolute left-4 top-1/2 -translate-y-1/2 bg-black/50 text-white rounded-full p-3 hover:bg-black"
        onClick={() => emblaApi?.scrollPrev()}
        aria-label="Previous Slide"
      >
        <ChevronLeft className="h-8 w-8" />
      </button>
      <button
        className="absolute right-4 top-1/2 -translate-y-1/2 bg-black/50 text-white rounded-full p-3 hover:bg-black"
        onClick={() => emblaApi?.scrollNext()}
        aria-label="Next Slide"
      >
        <ChevronRight className="h-8 w-8" />
      </button>
    </div>
  );
};
