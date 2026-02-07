import { Button } from "@/components/ui/button";
import { useQuery } from "@tanstack/react-query";
import { getWatchProviders } from "@/services/tmdb";
import { Loader2, Play } from "lucide-react";
import { memo, useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { VideoPlayer } from "@/components/VideoPlayer";
import { EpisodeSelector } from "@/components/EpisodeSelector";

interface StreamingButtonsProps {
  mediaType: 'movie' | 'tv';
  id: number;
  isInTheaters?: boolean;
  seasons?: { season_number: number; name: string; episode_count: number }[];
}

const getProviderColor = (providerName: string): string => {
  const name = providerName.toLowerCase();
  if (name.includes('netflix')) return 'streaming-netflix';
  if (name.includes('prime')) return 'streaming-prime';
  if (name.includes('hotstar') || name.includes('jio')) return 'streaming-jiostar';
  if (name.includes('zee')) return 'streaming-zee';
  if (name.includes('mxplayer')) return 'streaming-mxplayer';
  if (name.includes('sonyliv')) return 'streaming-sonyliv';
  if (name.includes('voot')) return 'streaming-voot';
  if (name.includes('aha')) return 'streaming-aha';
  return 'bg-gray-600 hover:bg-gray-700 border-gray-700';
};

const StreamingButtonsComponent = ({ mediaType, id, isInTheaters, seasons }: StreamingButtonsProps) => {
  const [isPlayerOpen, setIsPlayerOpen] = useState(false);
  const [selectedSeason, setSelectedSeason] = useState(seasons && seasons.length > 0 ? seasons[0].season_number : 1);
  const [selectedEpisode, setSelectedEpisode] = useState(1);
  const { toast } = useToast();

  const { data: providers, isLoading } = useQuery({
    queryKey: ['watch-providers', mediaType, id],
    queryFn: () => getWatchProviders(mediaType, id),
    staleTime: 1000 * 60 * 30,
    gcTime: 1000 * 60 * 60,
    refetchOnWindowFocus: false,
    refetchInterval: 1000 * 60 * 60 * 6,
  });

  const handleWatchNow = () => {
    setIsPlayerOpen(true);
  };

  const handleClosePlayer = () => {
    setIsPlayerOpen(false);
  };

  const handleStreamingClick = (url: string) => {
    const formattedUrl = url.startsWith('http') ? url : `https://${url}`;
    window.open(formattedUrl, '_blank', 'noopener,noreferrer');
  };

  const handleDownloadClick = async () => {
    if (mediaType === "movie") {
      try {
        const downloadUrl = `https://dl.letsembed.cc/?id=${id}`;
        const newWindow = window.open(downloadUrl, "_blank", "noopener,noreferrer");
        
        if (!newWindow) {
          toast({
            title: "Pop-up Blocked",
            description: "Please allow pop-ups for this site to enable downloads.",
            variant: "destructive"
          });
          
          const userConfirmed = confirm("Pop-up was blocked. Click OK to navigate to download page directly.");
          if (userConfirmed) {
            window.location.href = downloadUrl;
          }
        } else {
          toast({
            title: "Download Started",
            description: "Opening download page in new tab...",
          });
        }
      } catch (error) {
        console.error("Download error:", error);
        toast({
          title: "Download Error", 
          description: "Unable to access download service. Please try again later.",
          variant: "destructive"
        });
      }
    } else {
      toast({
        title: "Download Not Available",
        description: "Downloads are currently only available for movies.",
        variant: "destructive"
      });
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center gap-2 text-gray-400">
        <Loader2 className="h-4 w-4 animate-spin" />
        Loading streaming platforms...
      </div>
    );
  }

  const streamingProviders = providers?.results?.IN?.flatrate || [];
  const rentalProviders = providers?.results?.IN?.rent || [];
  const providerUrl = providers?.results?.IN?.link;

  const hasStreamingOptions = streamingProviders.length > 0 || rentalProviders.length > 0;

  const renderProviderButton = (provider: any, type: 'stream' | 'rent') => {
    const providerClass = getProviderColor(provider.provider_name);
    if (!providerUrl) return null;
    
    const displayName = provider.provider_name.toLowerCase().includes('hotstar') || 
                      provider.provider_name.toLowerCase().includes('jio') 
                      ? 'JioStar' 
                      : provider.provider_name;
    
    return (
      <Button
        key={provider.provider_id}
        variant="outline"
        className={`flex items-center gap-2 px-3 py-1.5 text-sm border rounded-lg
          ${providerClass} focus:ring-2 focus:ring-offset-2 focus:ring-offset-netflix-black
          transition-all duration-200 hover:scale-105`}
        onClick={() => handleStreamingClick(providerUrl)}
        aria-label={`${type === 'stream' ? 'Watch' : 'Rent'} on ${displayName}`}
      >
        <img
          src={`https://image.tmdb.org/t/p/original${provider.logo_path}`}
          alt={displayName}
          className="h-5 w-5 rounded"
          loading="lazy"
          width="20"
          height="20"
        />
        {displayName}
      </Button>
    );
  };

  return (
    <div className="space-y-4">
      {/* Video Player Modal */}
      <VideoPlayer
        isOpen={isPlayerOpen}
        onClose={handleClosePlayer}
        mediaType={mediaType}
        tmdbId={id}
        season={selectedSeason}
        episode={selectedEpisode}
        title={`${mediaType === 'tv' ? 'TV Show' : 'Movie'} - ID: ${id}`}
      />

      {/* TV Show Episode Selector */}
      {mediaType === 'tv' && seasons && seasons.length > 0 ? (
        <EpisodeSelector
          seasons={seasons}
          selectedSeason={selectedSeason}
          selectedEpisode={selectedEpisode}
          onSeasonChange={setSelectedSeason}
          onEpisodeChange={setSelectedEpisode}
          onPlay={handleWatchNow}
        />
      ) : (
        <div className="flex flex-wrap gap-2 items-center">
          {/* Main Watch Now Button for Movies */}
          <Button
            variant="outline"
            className="bg-netflix-red hover:bg-netflix-red/90 text-white border-netflix-red 
              focus:ring-2 focus:ring-offset-2 focus:ring-offset-netflix-black
              transition-all duration-200 hover:scale-105"
            onClick={handleWatchNow}
            aria-label="Watch Now"
          >
            <Play className="mr-2 h-4 w-4 fill-white" />
            Watch Now
          </Button>

          {mediaType === 'movie' && (
            <Button
              variant="outline"
              className="bg-green-700 hover:bg-green-800 text-white border-green-800 transition-all duration-200 hover:scale-105"
              onClick={handleDownloadClick}
              aria-label="Download"
            >
              <span className="mr-2">
                <svg className="w-4 h-4 inline" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                  <path d="M12 3v12m0 0l-4-4m4 4l4-4M4 21h16" strokeLinejoin="round" strokeLinecap="round"/>
                </svg>
              </span>
              Download
            </Button>
          )}
        </div>
      )}

      {streamingProviders.length > 0 && (
        <div>
          <h4 className="text-sm font-medium mb-2">Stream on:</h4>
          <div className="flex flex-wrap gap-2">
            {streamingProviders.map(provider => renderProviderButton(provider, 'stream'))}
          </div>
        </div>
      )}

      {rentalProviders.length > 0 && (
        <div>
          <h4 className="text-sm font-medium mb-2">Rent on:</h4>
          <div className="flex flex-wrap gap-2">
            {rentalProviders.map(provider => renderProviderButton(provider, 'rent'))}
          </div>
        </div>
      )}

      {!hasStreamingOptions && !providers?.results?.IN && (
        <p className="text-gray-400 italic">
          Not available on streaming or rental platforms in India
        </p>
      )}
    </div>
  );
};

export const StreamingButtons = memo(StreamingButtonsComponent);
