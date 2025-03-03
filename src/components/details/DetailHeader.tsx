
import { Button } from "@/components/ui/button";
import { Play, Plus, Check, Download, Share2 } from "lucide-react";
import { useWatchlist } from "@/contexts/WatchlistContext";
import { useToast } from "@/hooks/use-toast";
import { StreamingButtons } from "@/components/StreamingButtons";
import { CastSection } from "@/components/details/CastSection";
import { cn } from "@/lib/utils";

interface DetailHeaderProps {
  id: number;
  title: string;
  overview: string;
  posterPath: string;
  genres?: { id: number; name: string; }[];
  releaseDate?: string;
  voteAverage?: number;
  runtime?: number;
  trailer?: { key: string; };
  mediaType: 'movie' | 'tv';
  isInTheaters?: boolean;
  cast?: { id: number; name: string; character: string; profile_path: string | null; }[];
}

const formatRuntime = (minutes?: number): string => {
  if (!minutes) return 'N/A';
  
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;
  
  if (hours === 0) return `${remainingMinutes}m`;
  if (remainingMinutes === 0) return `${hours}h`;
  return `${hours}h ${remainingMinutes}m`;
};

export const DetailHeader = ({
  id,
  title,
  overview,
  posterPath,
  genres,
  releaseDate,
  voteAverage,
  runtime,
  trailer,
  mediaType,
  isInTheaters,
  cast,
}: DetailHeaderProps) => {
  const { addToWatchlist, removeFromWatchlist, isInWatchlist } = useWatchlist();
  const { toast } = useToast();

  const handleWatchlistClick = () => {
    const inWatchlist = isInWatchlist(id);
    if (inWatchlist) {
      removeFromWatchlist(id);
      toast({
        title: "Removed from Watchlist",
        description: `${title} has been removed from your watchlist`,
      });
    } else {
      addToWatchlist({
        id,
        title,
        posterPath,
        mediaType
      });
      toast({
        title: "Added to Watchlist",
        description: `${title} has been added to your watchlist`,
      });
    }
  };

  const releaseYear = releaseDate ? new Date(releaseDate).getFullYear() : '';
  const formattedRuntime = mediaType === 'movie' && runtime ? formatRuntime(runtime) : '';
  const rating = voteAverage ? `${voteAverage.toFixed(1)}` : '';

  return (
    <div className="space-y-8">
      <div className="relative">
        {/* Gradient overlay background for larger screens */}
        <div className="hidden md:block absolute inset-0 bg-gradient-to-r from-black via-black/90 to-transparent z-0"></div>
        
        {/* Main content container */}
        <div className="relative z-10 md:min-h-[500px] flex flex-col md:flex-row items-start">
          {/* Left content with info */}
          <div className="w-full md:w-1/2 lg:w-7/12 md:pl-6 lg:pl-12 flex flex-col justify-center py-6 md:py-12 space-y-4">
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white">{title}</h1>
            
            <div className="flex items-center gap-3 text-sm md:text-base text-gray-300">
              {rating && <span className="flex items-center">IMDb {rating}</span>}
              {formattedRuntime && <span className="flex items-center">{formattedRuntime}</span>}
              {releaseYear && <span>{releaseYear}</span>}
              {mediaType === 'movie' && isInTheaters && (
                <span className="px-1.5 py-0.5 bg-gray-700 text-white rounded text-xs">In Theaters</span>
              )}
              {mediaType === 'tv' && (
                <span className="px-1.5 py-0.5 bg-gray-700 text-white rounded text-xs">TV Series</span>
              )}
            </div>
            
            <p className="text-base md:text-lg text-gray-300 max-w-3xl line-clamp-4 md:line-clamp-none">
              {overview}
            </p>
            
            <div className="flex flex-wrap gap-2 pt-2">
              {genres?.map((genre) => (
                <span
                  key={genre.id}
                  className="rounded-full bg-gray-800/70 border border-gray-700 px-3 py-1 text-sm"
                >
                  {genre.name}
                </span>
              ))}
            </div>

            <div className="flex flex-wrap gap-3 pt-4">
              {trailer && (
                <Button
                  onClick={() => window.open(`https://www.youtube.com/watch?v=${trailer.key}`, '_blank')}
                  className="bg-white hover:bg-white/90 text-black font-medium px-6"
                >
                  <Play className="mr-2 h-5 w-5 fill-black" />
                  Play
                </Button>
              )}
              <Button
                onClick={handleWatchlistClick}
                variant="outline"
                className="border-gray-600 bg-gray-800/60 hover:bg-gray-700 text-white"
              >
                {isInWatchlist(id) ? (
                  <>
                    <Check className="mr-2 h-5 w-5" />
                    In Watchlist
                  </>
                ) : (
                  <>
                    <Plus className="mr-2 h-5 w-5" />
                    Add to Watchlist
                  </>
                )}
              </Button>
              
              <Button
                variant="outline"
                className="border-gray-600 bg-gray-800/60 hover:bg-gray-700 text-white px-3"
              >
                <Download className="h-5 w-5" />
              </Button>
              
              <Button
                variant="outline"
                className="border-gray-600 bg-gray-800/60 hover:bg-gray-700 text-white px-3"
              >
                <Share2 className="h-5 w-5" />
              </Button>
            </div>
            
            <div className="pt-4">
              <StreamingButtons mediaType={mediaType} id={id} isInTheaters={isInTheaters} />
            </div>
          </div>
          
          {/* Right side - Poster displayed on mobile, background image on desktop */}
          <div className="w-full md:hidden">
            <img
              src={`https://image.tmdb.org/t/p/w500${posterPath}`}
              alt={title}
              className="rounded-lg shadow-lg w-full"
            />
          </div>
        </div>
        
        {/* Background image for desktop view */}
        <div className="hidden md:block absolute top-0 right-0 bottom-0 w-1/2 z-0">
          <img
            src={`https://image.tmdb.org/t/p/original${posterPath}`}
            alt=""
            className="object-cover h-full w-full opacity-90"
          />
        </div>
      </div>
      
      <CastSection cast={cast} />
    </div>
  );
};
