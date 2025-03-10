
import { Button } from "@/components/ui/button";
import { useQuery } from "@tanstack/react-query";
import { getWatchProviders } from "@/services/tmdb";
import { Loader2, Wifi, Film } from "lucide-react";
import { memo, useState } from "react";

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
  
  const { data: providers, isLoading } = useQuery({
    queryKey: ['watch-providers', mediaType, id],
    queryFn: () => getWatchProviders(mediaType, id),
    staleTime: 1000 * 60 * 30,
    gcTime: 1000 * 60 * 60,
    refetchOnWindowFocus: false,
    refetchInterval: 1000 * 60 * 60 * 6,
  });

  // Handle click on Live Stream button
  const handleLiveStreamClick = () => {
    setIsPlayerOpen(true);
    
    // Create the player iframe in fullscreen
    const playerContainer = document.createElement('div');
    playerContainer.className = 'fixed inset-0 z-50 bg-black flex items-center justify-center';
    
    // Create close button
    const closeButton = document.createElement('button');
    closeButton.innerHTML = '×';
    closeButton.className = 'absolute top-4 right-4 text-white text-3xl w-10 h-10 flex items-center justify-center rounded-full bg-red-600 hover:bg-red-700 z-10 focus:outline-none';
    closeButton.onclick = () => {
      document.body.removeChild(playerContainer);
      setIsPlayerOpen(false);
    };
    
    // Create iframe for the player using 2embed.org API (alternative to flicky.host)
    // The ID formats match TMDB IDs so we can use them directly
    const streamUrl = mediaType === 'movie' 
      ? `https://2embed.org/embed/movie?tmdb=${id}`
      : `https://2embed.org/embed/series?tmdb=${id}${seasons && seasons.length > 0 ? `&s=${seasons[0].season_number}&e=1` : ''}`;
    
    const iframe = document.createElement('iframe');
    iframe.src = streamUrl;
    iframe.className = 'w-full h-full';
    iframe.allowFullscreen = true;
    iframe.allow = "accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture";
    
    // Create a loading indicator
    const loadingIndicator = document.createElement('div');
    loadingIndicator.className = 'absolute inset-0 flex items-center justify-center bg-black/80';
    loadingIndicator.innerHTML = '<div class="animate-spin h-12 w-12 border-4 border-white border-t-transparent rounded-full"></div>';
    
    // Add elements to the DOM
    playerContainer.appendChild(loadingIndicator);
    playerContainer.appendChild(closeButton);
    playerContainer.appendChild(iframe);
    document.body.appendChild(playerContainer);
    
    // Remove loading indicator once iframe is loaded
    iframe.onload = () => {
      if (loadingIndicator.parentNode === playerContainer) {
        playerContainer.removeChild(loadingIndicator);
      }
    };
    
    // Force focus to iframe for better keyboard control
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
        </Button>
        
        <Button
          variant="outline"
          className="bg-red-600 hover:bg-red-700 text-white border-red-700 
            focus:ring-2 focus:ring-offset-2 focus:ring-offset-netflix-black
            transition-all duration-200 hover:scale-105"
          onClick={() => {
            const vidsrcUrl = mediaType === 'movie'
              ? `https://vidsrc.to/embed/movie/${id}`
              : `https://vidsrc.to/embed/tv/${id}${seasons && seasons.length > 0 ? `/1/1` : ''}`;
            
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
            
            playerContainer.appendChild(closeButton);
            playerContainer.appendChild(iframe);
            document.body.appendChild(playerContainer);
            
            iframe.focus();
          }}
          aria-label="Alternative Stream"
          disabled={isPlayerOpen}
        >
          <Film className="mr-2 h-4 w-4" />
          Alternative Stream
        </Button>
      </div>
      
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
