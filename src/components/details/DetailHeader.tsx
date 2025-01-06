import { Button } from "@/components/ui/button";
import { Plus, Check, Play } from "lucide-react";
import { useWatchlist } from "@/contexts/WatchlistContext";
import { useToast } from "@/hooks/use-toast";
import { StreamingButtons } from "@/components/StreamingButtons";
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

  return (
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
          <p>Rating: ★ {voteAverage?.toFixed(1)}</p>
          {runtime && <p>Runtime: {runtime} minutes</p>}
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
  );
};