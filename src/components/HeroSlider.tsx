import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Play, Plus } from "lucide-react";
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
  }>;
}

export const HeroSlider = ({ items }: HeroSliderProps) => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { addToWatchlist, isInWatchlist } = useWatchlist();
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true });
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [isHovered, setIsHovered] = useState(false);

  useEffect(() => {
    if (!emblaApi) return;

    const onSelect = () => {
      setSelectedIndex(emblaApi.selectedScrollSnap());
    };

    emblaApi.on("select", onSelect);

    return () => {
      emblaApi.off("select", onSelect);
    };
  }, [emblaApi]);

  useEffect(() => {
    if (!emblaApi) return;

    const autoScroll = () => {
      if (!isHovered) emblaApi.scrollNext();
    };

    const intervalId = setInterval(autoScroll, 4000);
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
      className="relative w-full h-[60vh] sm:h-[70vh] lg:h-[85vh] overflow-hidden"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Carousel */}
      <div ref={emblaRef} className="w-full h-full overflow-hidden">
        <div className="flex h-full w-full">
          {limitedItems.map((item) => (
            <div
              key={item.id}
              className="relative flex-none w-full h-full overflow-hidden"
            >
              {/* Background Image */}
              <img
                src={getImageUrl(item.backdrop_path, "original")}
                alt={item.title || item.name}
                className="h-full w-full object-cover"
                loading="lazy"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
              {/* Content */}
              <div className="absolute bottom-8 left-4 right-4 sm:left-8 sm:right-8 text-white">
                <h2 className="text-xl sm:text-3xl lg:text-4xl font-bold line-clamp-2">
                  {item.title || item.name}
                </h2>
                <p className="text-sm sm:text-base lg:text-lg mt-2 line-clamp-3">
                  {item.overview}
                </p>
                <div className="flex gap-4 mt-4">
                  <Button
                    size="sm"
                    className="bg-netflix-red hover:bg-netflix-red/90 text-sm sm:text-base"
                    onClick={() =>
                      navigate(`/${item.media_type || "movie"}/${item.id}`)
                    }
                  >
                    <Play className="w-4 h-4 sm:w-5 sm:h-5" />
                    Watch Now
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="border-white text-white text-sm sm:text-base hover:bg-white/10"
                    onClick={() => handleAddToWatchlist(item)}
                  >
                    <Plus className="w-4 h-4 sm:w-5 sm:h-5" />
                    Add to Watchlist
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Navigation Dots */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 z-10">
        {limitedItems.map((_, index) => (
          <button
            key={index}
            className={`w-3 h-3 rounded-full transition-all duration-300 ${
              index === selectedIndex
                ? "bg-white scale-125"
                : "bg-white/50 hover:bg-white/75"
            }`}
            onClick={() => emblaApi?.scrollTo(index)}
            aria-label={`Go to slide ${index + 1}`}
          />
        ))}
      </div>
    </div>
  );
};
