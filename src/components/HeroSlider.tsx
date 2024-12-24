import { useEffect, useState, useCallback, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Play, Plus, Volume2, VolumeX } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useWatchlist } from "@/contexts/WatchlistContext";
import { getImageUrl } from "@/services/tmdb";
import useEmblaCarousel from "embla-carousel-react";
import { Skeleton } from "./ui/skeleton";
import { useLocalStorage } from "@/hooks/use-local-storage";

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
  const navigate = useNavigate();
  const { toast } = useToast();
  const { addToWatchlist, isInWatchlist } = useWatchlist();
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true });
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [imagesLoaded, setImagesLoaded] = useState<boolean[]>([]);

  useEffect(() => {
    setImagesLoaded(new Array(items.length).fill(false));
  }, [items.length]);

  const handleImageLoad = useCallback((index: number) => {
    setImagesLoaded((prev) => {
      const newState = [...prev];
      newState[index] = true;
      return newState;
    });
  }, []);

  useEffect(() => {
    if (!emblaApi) return;

    const onSelect = () => {
      setSelectedIndex(emblaApi.selectedScrollSnap());
    };

    emblaApi.on("select", onSelect);

    return () => {
      if (emblaApi) {
        emblaApi.off("select", onSelect);
      }
    };
  }, [emblaApi]);

  const handleAddToWatchlist = useCallback(
    (item: HeroSliderProps["items"][0]) => {
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
    },
    [addToWatchlist, isInWatchlist, toast]
  );

  const limitedItems = items.slice(0, 5);

  if (!items.length) {
    return (
      <div className="relative w-full h-[50vh] md:h-[70vh] lg:h-screen">
        <Skeleton className="w-full h-full" />
      </div>
    );
  }

  const currentItem = limitedItems[selectedIndex];

  return (
    <div className="relative w-full h-[50vh] md:h-[70vh] lg:h-screen overflow-hidden">
      <div ref={emblaRef} className="w-full h-full overflow-hidden">
        <div className="flex h-full w-full">
          {limitedItems.map((item, index) => (
            <div
              key={item.id}
              className="relative flex-none w-full h-full overflow-hidden"
            >
              {!imagesLoaded[index] && (
                <Skeleton className="absolute inset-0 w-full h-full" />
              )}
              <img
                src={getImageUrl(item.backdrop_path, "original")}
                alt={item.title || item.name}
                className={`h-full w-full object-contain transition-opacity duration-300 ${
                  imagesLoaded[index] ? "opacity-100" : "opacity-0"
                }`}
                loading="lazy"
                onLoad={() => handleImageLoad(index)}
              />
              <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/50 to-transparent" />
              <div className="absolute bottom-0 left-0 right-0 p-4 md:p-6 lg:p-8">
                <div className="container mx-auto">
                  <div className="max-w-2xl space-y-2 md:space-y-4">
                    <h2 className="text-xl md:text-3xl lg:text-4xl font-bold text-white line-clamp-2">
                      {item.title || item.name}
                    </h2>
                    <p className="line-clamp-2 text-xs md:text-sm lg:text-base text-gray-200">
                      {item.overview}
                    </p>
                    <div className="flex flex-wrap gap-2 md:gap-4">
                      <Button
                        size="sm"
                        className="gap-1 md:gap-2 bg-netflix-red hover:bg-netflix-red/90 text-xs md:text-base"
                        onClick={() =>
                          navigate(`/${item.media_type || "movie"}/${item.id}`)
                        }
                      >
                        <Play className="h-4 w-4" />
                        Watch Now
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="gap-2 border-white text-white bg-transparent border-2 rounded-lg text-xs md:text-sm lg:text-base h-9 md:h-10 font-semibold flex items-center justify-center hover:bg-white/20"
                        onClick={() => handleAddToWatchlist(item)}
                      >
                        <Plus className="h-4 w-4 md:h-5 md:w-5" />
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
    </div>
  );
};
