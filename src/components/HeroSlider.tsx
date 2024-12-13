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
    dragFree: true,
  });

  useEffect(() => {
    if (emblaApi) {
      const intervalId = setInterval(() => {
        emblaApi.scrollNext();
      }, 5000);

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

  const limitedItems = items.slice(0, 5);

  return (
    <div className="relative w-full">
      <Carousel
        opts={{
          loop: true,
          duration: 20,
          dragFree: true,
        }}
        className="w-full"
        ref={emblaRef}
      >
        <CarouselContent>
          {limitedItems.map((item) => (
            <CarouselItem key={item.id} className="relative">
              <div className="relative w-full min-h-screen">
                {/* Image Container with responsive sizing */}
                <div className="absolute inset-0 w-full">
                  <img
                    src={getImageUrl(item.backdrop_path, 'original')}
                    alt={item.title || item.name}
                    className="w-full h-full object-cover"
                    style={{
                      aspectRatio: '16/9',
                      height: 'calc(100vh - var(--header-height, 0px))'
                    }}
                  />
                  {/* Gradient Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-r from-black/90 via-black/60 to-transparent" />
                </div>

                {/* Content Container */}
                <div className="absolute inset-0 flex items-center">
                  <div className="container mx-auto px-4 md:px-8 lg:px-12">
                    <div className="max-w-2xl space-y-3 md:space-y-4 lg:space-y-6">
                      {/* Title */}
                      <h2 className="text-2xl md:text-4xl lg:text-6xl font-bold text-white line-clamp-2">
                        {item.title || item.name}
                      </h2>

                      {/* Overview */}
                      <p className="hidden sm:block text-sm md:text-base lg:text-lg text-gray-200 line-clamp-3 max-w-xl">
                        {item.overview}
                      </p>

                      {/* Buttons */}
                      <div className="flex flex-wrap gap-2 md:gap-4 pt-2">
                        <Button
                          size="sm"
                          className="gap-2 bg-netflix-red hover:bg-netflix-red/90 text-sm md:text-base lg:text-lg h-8 md:h-12"
                          onClick={() => navigate(`/${item.media_type || 'movie'}/${item.id}`)}
                        >
                          <Play className="h-4 w-4 md:h-5 md:w-5" />
                          Watch Now
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="gap-2 border-white text-white hover:bg-white/10 text-sm md:text-base lg:text-lg h-8 md:h-12"
                          onClick={() => handleAddToWatchlist(item)}
                        >
                          <Plus className="h-4 w-4 md:h-5 md:w-5" />
                          Add to Watchlist
                        </Button>
                      </div>

                      {/* Trailer Button */}
                      {item.videos?.results?.some(video => video.type === "Trailer") && (
                        <div className="mt-2 md:mt-4">
                          <Button
                            variant="outline"
                            size="sm"
                            className="gap-2 border-white text-white hover:bg-white/10 text-sm md:text-base lg:text-lg h-8 md:h-12"
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