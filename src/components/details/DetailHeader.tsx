import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plus, Check, Play, Languages, ExternalLink } from "lucide-react";
import { useWatchlist } from "@/contexts/WatchlistContext";
import { useContinueWatching } from "@/contexts/ContinueWatchingContext";
import { useLanguagePreference } from "@/contexts/LanguagePreferenceContext";
import { useToast } from "@/hooks/use-toast";
import { StreamingButtons } from "@/components/StreamingButtons";
import { CastSection } from "@/components/details/CastSection";
import { LanguageSection } from "@/components/details/LanguageSection";
import { cn } from "@/lib/utils";
import { useEffect, useState } from "react";
import { getOMDbDetails, OMDbMovie } from "@/services/omdb";
import { OMDbModal } from "@/components/OMDbModal";

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
  seasons?: { season_number: number; name: string; episode_count: number }[];
  spokenLanguages?: { iso_639_1: string; name: string; english_name: string; }[];
  originalLanguage?: string;
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
  seasons,
  spokenLanguages,
  originalLanguage,
}: DetailHeaderProps) => {
  const { addToWatchlist, removeFromWatchlist, isInWatchlist } = useWatchlist();
  const { updateProgress } = useContinueWatching();
  const { preferredLanguage, checkLanguageAvailability } = useLanguagePreference();
  const { toast } = useToast();
  const [isOMDbModalOpen, setIsOMDbModalOpen] = useState(false);
  const [omdbData, setOmdbData] = useState<OMDbMovie | null>(null);
  const [isLoadingOMDb, setIsLoadingOMDb] = useState(false);

  // Simulate watching progress on page view
  useEffect(() => {
    const timer = setTimeout(() => {
      updateProgress({
        id,
        title,
        posterPath,
        mediaType,
        progress: Math.floor(Math.random() * 30) + 1, // 1-30% for demo
        lastWatched: new Date().toISOString(),
        runtime
      });
    }, 3000); // Update after 3 seconds on page

    return () => clearTimeout(timer);
  }, [id]);

  // Check language availability
  const availableLanguageCodes = spokenLanguages?.map(lang => lang.iso_639_1) || [];
  const languageInfo = checkLanguageAvailability(availableLanguageCodes);

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

  const handleWatchHere = async () => {
    setIsLoadingOMDb(true);
    setIsOMDbModalOpen(true);
    
    const year = releaseDate ? new Date(releaseDate).getFullYear().toString() : undefined;
    const data = await getOMDbDetails(title, year);
    
    setOmdbData(data);
    setIsLoadingOMDb(false);
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
          
          {/* Language Availability Badge */}
          {preferredLanguage && (
            <Badge 
              variant={languageInfo.isPreferredAvailable ? "default" : "secondary"}
              className={cn(
                "flex items-center gap-2 w-fit",
                languageInfo.isPreferredAvailable 
                  ? "bg-green-600 hover:bg-green-700" 
                  : "bg-gray-700 hover:bg-gray-600"
              )}
            >
              <Languages className="h-3 w-3" />
              {languageInfo.displayMessage}
            </Badge>
          )}
          <div className="space-y-2">
            <p>{releaseDate && `Release Date: ${releaseDate}`}</p>
            <p>Rating: ★ {voteAverage?.toFixed(1)}</p>
            {mediaType === 'movie' && runtime && (
              <p>Runtime: {formatRuntime(runtime)}</p>
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
                onClick={handleWatchHere}
                className="bg-netflix-red hover:bg-netflix-red/90"
              >
                <ExternalLink className="mr-2 h-4 w-4" />
                Watch Here
              </Button>
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
            <StreamingButtons 
              mediaType={mediaType} 
              id={id} 
              isInTheaters={isInTheaters} 
              seasons={seasons}
            />
          </div>
        </div>
      </div>
      <LanguageSection 
        spokenLanguages={spokenLanguages} 
        originalLanguage={originalLanguage}
      />
      <CastSection cast={cast} />
      
      <OMDbModal 
        isOpen={isOMDbModalOpen}
        onClose={() => setIsOMDbModalOpen(false)}
        data={omdbData}
        isLoading={isLoadingOMDb}
      />
    </div>
  );
};
