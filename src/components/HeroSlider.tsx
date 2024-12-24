import { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Play, Plus } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useWatchlist } from "@/contexts/WatchlistContext";
import { getImageUrl } from "@/services/tmdb";
import useEmblaCarousel from "embla-carousel-react";
import { Skeleton } from "./ui/skeleton";

interface HeroSliderProps {
  items: Array<{
    id: number;
    title?: string;
    name?: string;
    overview: string;
    backdrop_path: string;
    media_type?: "movie" | "tv";
  }>;
}

export const HeroSlider = ({ items }: HeroSliderProps) => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { addToWatchlist, isInWatchlist } = useWatchlist();
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true, align: "center" });
  const [selectedIndex, setSelectedIndex] = useState(0);

  useEffect(() => {
    if (!emblaApi) return;

    const onSelect = () => setSelectedIndex(emblaApi.selectedScrollSnap());
    emblaApi.on("select", onSelect);

    return () => {
      if (emblaApi) emblaApi.off("select", onSelect);
    };
  }, [emblaApi]);

  const handleAddToWatchlist = useCallback(
    (item: HeroSliderProps["items"][0]) => {
      if (isInWatchlist(item.id)) {
        toast({
          title: "Already in Watchlist",
          description: "This title is already in your watchlist.",
        });
        return;
      }
      addToWatchlist(item);
      toast({
        title: "Added to Watchlist",
        description: "Successfully added to your watchlist.",
      });
    },
    [addToWatchlist, isInWatchlist, toast]
  );

  if (!items.length) {
    return (
      <div className="relative w-full h-[50vh] md:h-[70vh] lg:h-screen">
        <Skeleton className="w-full h-full" />
      </div>
    );
  }

  return (
    <div className="relative w-full h-[50vh] md:h-[70vh] lg:h-screen overflow-hidden">
      <div ref={emblaRef} className="w-full h-full overflow-hidden">
        <div className="flex h-full">
          {items.map((item, index) => (
            <div
              key={item.id}
              className="relative flex-none w-full h-full"
            >
              <img
                src={getImageUrl(item.backdrop_path, "original")}
                alt={item.title || item.name}
                className="h-full w-full object-contain"
                loading="lazy"
              />
              <div className="absolute inset-0 bg-gradient-to-b from-black/50 to-black/90" />
              <div className="absolute bottom-10 left-10">
                <h1 className="text-white text-3xl font-bold">
                  {item.title || item.name}
                </h1>
                <p className="text-white text-sm mt-2 line-clamp-2">
                  {item.overview}
                </p>
                <div className="flex gap-4 mt-4">
                  <Button
                    className="bg-netflix-red hover:bg-netflix-red/90 text-white"
                    onClick={() => navigate(`/${item.media_type}/${item.id}`)}
                  >
                    <Play className="mr-2" /> Watch Now
                  </Button>
                  <Button
                    variant="outline"
                    className="text-white border-white"
                    onClick={() => handleAddToWatchlist(item)}
                  >
                    <Plus className="mr-2" /> Add to Watchlist
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
      {/* Navigation Buttons */}
      <div className="absolute inset-0 flex justify-between items-center">
        <button
          className="p-2 bg-black/50 hover:bg-black text-white rounded-full"
          onClick={() => emblaApi?.scrollPrev()}
        >
          ‹
        </button>
        <button
          className="p-2 bg-black/50 hover:bg-black text-white rounded-full"
          onClick={() => emblaApi?.scrollNext()}
        >
          ›
        </button>
      </div>
    </div>
  );
};
