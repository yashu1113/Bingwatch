import { Button } from "@/components/ui/button";
import { useQuery } from "@tanstack/react-query";
import { getWatchProviders } from "@/services/tmdb";
import { Loader2, Wifi, Film, ChevronDown, List } from "lucide-react";
import { memo, useState } from "react";
import { 
  Tabs, 
  TabsList, 
  TabsTrigger, 
  TabsContent 
} from "@/components/ui/tabs";

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
  const [showSeasonSelector, setShowSeasonSelector] = useState(false);
  const [showEpisodeSelector, setShowEpisodeSelector] = useState(false);
  
  const { data: providers, isLoading } = useQuery({
    queryKey: ['watch-providers', mediaType, id],
    queryFn: () => getWatchProviders(mediaType, id),
    staleTime: 1000 * 60 * 30,
    gcTime: 1000 * 60 * 60,
    refetchOnWindowFocus: false,
    refetchInterval: 1000 * 60 * 60 * 6,
  });

  const getEpisodeCount = () => {
    if (!seasons) return 0;
    const season = seasons.find(s => s.season_number === selectedSeason);
    return season ? season.episode_count : 0;
  };

  const generateEpisodeNumbers = () => {
    const count = getEpisodeCount();
    return Array.from({ length: count }, (_, i) => i + 1);
  };

  const handleLiveStreamClick = () => {
    setIsPlayerOpen(true);
    
    const playerContainer = document.createElement('div');
    playerContainer.className = 'fixed inset-0 z-50 bg-black flex items-center justify-center';
    
    const closeButton = document.createElement('button');
    closeButton.innerHTML = '×';
    closeButton.className = 'absolute top-4 right-4 text-white text-3xl w-10 h-10 flex items-center justify-center rounded-full bg-red-600 hover:bg-red-700 z-10 focus:outline-none';
    closeButton.onclick = () => {
      document.body.removeChild(playerContainer);
      setIsPlayerOpen(false);
    };
    
    const streamUrl = mediaType === 'movie' 
      ? `https://2embed.org/embed/movie?tmdb=${id}`
      : `https://2embed.org/embed/series?tmdb=${id}&s=${selectedSeason}&e=${selectedEpisode}`;
    
    const iframe = document.createElement('iframe');
    iframe.src = streamUrl;
    iframe.className = 'w-full h-full';
    iframe.allowFullscreen = true;
    iframe.allow = "accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture";
    
    const loadingIndicator = document.createElement('div');
    loadingIndicator.className = 'absolute inset-0 flex items-center justify-center bg-black/80';
    loadingIndicator.innerHTML = '<div class="animate-spin h-12 w-12 border-4 border-white border-t-transparent rounded-full"></div>';
    
    playerContainer.appendChild(loadingIndicator);
    playerContainer.appendChild(closeButton);
    playerContainer.appendChild(iframe);
    document.body.appendChild(playerContainer);
    
    iframe.onload = () => {
      if (loadingIndicator.parentNode === playerContainer) {
        playerContainer.removeChild(loadingIndicator);
      }
    };
    
    iframe.focus();
  };

  const handleAlternativeStreamClick = () => {
    const vidsrcUrl = mediaType === 'movie'
      ? `https://vidsrc.to/embed/movie/${id}`
      : `https://vidsrc.to/embed/tv/${id}/${selectedSeason}/${selectedEpisode}`;
    
    setIsPlayerOpen(true);
    
    const playerContainer = document.createElement('div');
    playerContainer.className = 'fixed inset-0 z-50 bg-black flex items-center justify-center';
    
    const closeButton = document.createElement('button');
    closeButton.innerHTML = '×';
    closeButton.className = 'absolute top-4 right-4 text-white text-3xl w-10 h-10 flex items-center justify-center rounded-full bg-red-600 hover:bg-red-700 z-10 focus:outline-none';
    closeButton.onclick = () => {
      document.body.removeChild(playerContainer);
      setIsPlayerOpen(false);
    };
    
    const iframe = document.createElement('iframe');
    iframe.src = vidsrcUrl;
    iframe.className = 'w-full h-full';
    iframe.allowFullscreen = true;
    iframe.allow = "accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture";
    
    const loadingIndicator = document.createElement('div');
    loadingIndicator.className = 'absolute inset-0 flex items-center justify-center bg-black/80';
    loadingIndicator.innerHTML = '<div class="animate-spin h-12 w-12 border-4 border-white border-t-transparent rounded-full"></div>';
    
    playerContainer.appendChild(loadingIndicator);
    playerContainer.appendChild(closeButton);
    playerContainer.appendChild(iframe);
    document.body.appendChild(playerContainer);
    
    iframe.onload = () => {
      if (loadingIndicator.parentNode === playerContainer) {
        playerContainer.removeChild(loadingIndicator);
      }
    };
    
    iframe.focus();
  };

  const handleStreamingClick = (url: string) => {
    const formattedUrl = url.startsWith('http') ? url : `https://${url}`;
    window.open(formattedUrl, '_blank', 'noopener,noreferrer');
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

  const renderSeasonSelector = () => {
    if (!seasons || seasons.length === 0 || mediaType !== 'tv') return null;
    
    return (
      <div className="mt-4">
        <h4 className="text-sm font-medium mb-2">Episodes:</h4>
        <Tabs defaultValue="season" className="w-full">
          <TabsList className="grid w-full grid-cols-2 bg-gray-800">
            <TabsTrigger value="season">Season</TabsTrigger>
            <TabsTrigger value="episode">Episode</TabsTrigger>
          </TabsList>
          <TabsContent value="season" className="bg-gray-900 rounded-b-lg p-3">
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2 max-h-48 overflow-y-auto">
              {seasons.map((season) => (
                <Button
                  key={season.season_number}
                  variant="outline" 
                  size="sm"
                  className={`flex items-center justify-between ${
                    selectedSeason === season.season_number 
                      ? 'bg-blue-600 text-white' 
                      : 'bg-gray-800 hover:bg-gray-700'
                  }`}
                  onClick={() => {
                    setSelectedSeason(season.season_number);
                    setSelectedEpisode(1);
                  }}
                >
                  <span>{season.name}</span>
                  <span className="text-xs opacity-70">({season.episode_count})</span>
                </Button>
              ))}
            </div>
          </TabsContent>
          <TabsContent value="episode" className="bg-gray-900 rounded-b-lg p-3">
            <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 gap-2 max-h-48 overflow-y-auto">
              {generateEpisodeNumbers().map((epNum) => (
                <Button
                  key={epNum}
                  variant="outline"
                  size="sm"
                  className={`${
                    selectedEpisode === epNum 
                      ? 'bg-blue-600 text-white' 
                      : 'bg-gray-800 hover:bg-gray-700'
                  }`}
                  onClick={() => setSelectedEpisode(epNum)}
                >
                  {epNum}
                </Button>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    );
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2 items-center">
        <Button
          variant="outline"
          className="bg-purple-600 hover:bg-purple-700 text-white border-purple-700 
            focus:ring-2 focus:ring-offset-2 focus:ring-offset-netflix-black
            transition-all duration-200 hover:scale-105"
          onClick={handleLiveStreamClick}
          aria-label="Live Stream"
          disabled={isPlayerOpen}
        >
          <Wifi className="mr-2 h-4 w-4" />
          Live Stream
          {mediaType === 'tv' && (
            <span className="ml-2 text-xs bg-gray-800 px-2 py-0.5 rounded">
              S{selectedSeason}:E{selectedEpisode}
            </span>
          )}
        </Button>
        
        <Button
          variant="outline"
          className="bg-red-600 hover:bg-red-700 text-white border-red-700 
            focus:ring-2 focus:ring-offset-2 focus:ring-offset-netflix-black
            transition-all duration-200 hover:scale-105"
          onClick={handleAlternativeStreamClick}
          aria-label="Alternative Stream"
          disabled={isPlayerOpen}
        >
          <Film className="mr-2 h-4 w-4" />
          Alternative Stream
          {mediaType === 'tv' && (
            <span className="ml-2 text-xs bg-gray-800 px-2 py-0.5 rounded">
              S{selectedSeason}:E{selectedEpisode}
            </span>
          )}
        </Button>
      </div>

      {mediaType === 'tv' && seasons && seasons.length > 0 && renderSeasonSelector()}
      
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
