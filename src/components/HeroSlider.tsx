import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Play, Plus } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useWatchlist } from "@/contexts/WatchlistContext";
import { getImageUrl } from "@/services/tmdb";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
} from "@/components/ui/carousel";
import useEmblaCarousel from 'embla-carousel-react';

interface HeroSliderProps {
  items: Array<{
    id: number;
    title?: string;
    name?: string;
    overview: string;
    backdrop_path: string;
    media_type?: 'movie' | 'tv';
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
  const [emblaRef, emblaApi] = useEmblaCarousel({
    loop: true,
    duration: 20,
  });

  // Auto-slide every 3 seconds
  useEffect(() => {
    if (emblaApi) {
      const intervalId = setInterval(() => {
        emblaApi.scrollNext();
      }, 3000); // Changed from 5000 to 3000 milliseconds

      return () => clearInterval(intervalId);
    }
  }, [emblaApi]);

  const handleAddToWatchlist = (item: HeroSliderProps['items'][0]) => {
    const mediaItem = {
      id: item.id,
      title: item.title || item.name || '',
      mediaType: item.media_type || 'movie',
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

  // Limit to 5 items
  const limitedItems = items.slice(0, 5);

  return (
    <div className="relative w-full">
      <Carousel
        opts={{
          loop: true,
          duration: 20,
        }}
        className="w-full"
        ref={emblaRef}
      >
        <CarouselContent>
          {limitedItems.map((item) => (
            <CarouselItem key={item.id}>
              <div className="relative aspect-video w-full overflow-hidden">
                <img
                  src={getImageUrl(item.backdrop_path, 'original')}
                  alt={item.title || item.name}
                  className="h-full w-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/50 to-transparent" />
                <div className="absolute bottom-0 left-0 right-0 p-4 md:p-8 lg:p-12">
                  <div className="container mx-auto">
                    <div className="max-w-2xl space-y-4">
                      <h2 className="text-2xl font-bold text-white md:text-4xl lg:text-5xl">
                        {item.title || item.name}
                      </h2>
                      <p className="line-clamp-2 text-sm text-gray-200 md:text-base lg:text-lg">
                        {item.overview}
                      </p>
                      <div className="flex flex-wrap gap-4">
                        <Button
                          size="lg"
                          className="gap-2 bg-netflix-red hover:bg-netflix-red/90"
                          onClick={() => navigate(`/${item.media_type || 'movie'}/${item.id}`)}
                        >
                          <Play className="h-5 w-5" />
                          Watch Now
                        </Button>
                        <Button
                          variant="outline"
                          size="lg"
                          className="gap-2 border-white text-white hover:bg-white/10"
                          onClick={() => handleAddToWatchlist(item)}
                        >
                          <Plus className="h-5 w-5" />
                          Add to Watchlist
                        </Button>
                      </div>
                      {item.videos?.results?.some(video => video.type === "Trailer") && (
                        <div className="mt-4">
                          <Button
                            variant="outline"
                            size="lg"
                            className="gap-2 border-white text-white hover:bg-white/10"
                            onClick={() => {
                              const trailer = item.videos.results.find(v => v.type === "Trailer");
                              if (trailer) {
                                window.open(`https://www.youtube.com/watch?v=${trailer.key}`, '_blank');
                              }
                            }}
                          >
                            Watch Trailer
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </CarouselItem>
          ))}
        </CarouselContent>
      </Carousel>
    </div>
  );
};