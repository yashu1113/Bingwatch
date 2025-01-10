import { Button } from "@/components/ui/button";
import { Plus, Check, Play, Star } from "lucide-react";
import { useWatchlist } from "@/contexts/WatchlistContext";
import { useToast } from "@/hooks/use-toast";
import { StreamingButtons } from "@/components/StreamingButtons";
import { CastSection } from "@/components/details/CastSection";
import { cn } from "@/lib/utils";
import { useState } from "react";

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
  const [userRating, setUserRating] = useState<number | null>(null);
  const [isHovering, setIsHovering] = useState<number | null>(null);

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

  const handleRate = (rating: number) => {
    setUserRating(rating);
    toast({
      title: "Rating Submitted",
      description: `You rated ${title} ${rating} stars`,
    });
  };

  return (
    <div className="space-y-8">
      <div className="grid gap-6 md:gap-8 md:grid-cols-[300px,1fr]">
        <div className="relative">
          <img
            src={`https://image.tmdb.org/t/p/w500${posterPath}`}
            alt={title}
            className="rounded-lg shadow-lg w-full"
          />
        </div>
        <div className="flex flex-col space-y-4">
          <h1 className="text-2xl md:text-4xl font-bold">{title}</h1>
          <p className="text-base md:text-lg text-gray-400">{overview}</p>
          <div className="flex flex-wrap gap-2">
            {genres?.map((genre) => (
              <span
                key={genre.id}
                className="rounded-full bg-gray-800 px-3 py-1 text-sm"
              >
                {genre.name}
              </span>
            ))}
          </div>
          <div className="space-y-2">
            <p>{releaseDate && `Release Date: ${releaseDate}`}</p>
            <div className="flex items-center gap-2">
              <span>Rating:</span>
              <div className="flex gap-1">
                {[1, 2, 3, 4, 5].map((rating) => (
                  <button
                    key={rating}
                    onClick={() => handleRate(rating)}
                    onMouseEnter={() => setIsHovering(rating)}
                    onMouseLeave={() => setIsHovering(null)}
                    className="p-1 transition-transform hover:scale-110"
                  >
                    <Star 
                      className={cn(
                        "h-5 w-5 transition-colors",
                        (isHovering && rating <= isHovering) || (userRating && rating <= userRating)
                          ? "text-yellow-400 fill-yellow-400"
                          : "text-gray-400"
                      )}
                    />
                  </button>
                ))}
              </div>
              <span className="text-sm">
                ({userRating || voteAverage?.toFixed(1)})
              </span>
            </div>
            {runtime && <p>Runtime: {runtime} minutes</p>}
            {isInTheaters && (
              <span className="inline-flex items-center px-3 py-1 bg-[#F4A261] text-white rounded-lg text-sm font-medium">
                Now Playing in Theaters
              </span>
            )}
          </div>
          <div className="flex flex-col space-y-4 mt-auto">
            <div className="flex flex-wrap gap-3">
              {trailer && (
                <Button
                  onClick={() => window.open(`https://www.youtube.com/watch?v=${trailer.key}`, '_blank')}
                  className="bg-netflix-red hover:bg-netflix-red/90"
                >
                  <Play className="mr-2 h-4 w-4" />
                  Watch Trailer
                </Button>
              )}
              <Button
                onClick={handleWatchlistClick}
                className={cn(
                  "transition-colors",
                  isInWatchlist(id)
                    ? "bg-[#00B894] hover:bg-[#00B894]/90"
                    : "bg-[#3A86FF] hover:bg-[#3A86FF]/90"
                )}
              >
                {isInWatchlist(id) ? (
                  <>
                    <Check className="mr-2 h-4 w-4" />
                    In Watchlist
                  </>
                ) : (
                  <>
                    <Plus className="mr-2 h-4 w-4" />
                    Add to Watchlist
                  </>
                )}
              </Button>
            </div>
            <StreamingButtons mediaType={mediaType} id={id} isInTheaters={isInTheaters} />
          </div>
        </div>
      </div>
      <CastSection cast={cast} />
    </div>
  );
};