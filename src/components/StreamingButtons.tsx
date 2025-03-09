
import { Button } from "@/components/ui/button";
import { useQuery } from "@tanstack/react-query";
import { getWatchProviders } from "@/services/tmdb";
import { Loader2, Wifi } from "lucide-react";
import { memo } from "react";

interface StreamingButtonsProps {
  mediaType: 'movie' | 'tv';
  id: number;
  isInTheaters?: boolean;
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

const StreamingButtonsComponent = ({ mediaType, id, isInTheaters }: StreamingButtonsProps) => {
  const { data: providers, isLoading } = useQuery({
    queryKey: ['watch-providers', mediaType, id],
    queryFn: () => getWatchProviders(mediaType, id),
    staleTime: 1000 * 60 * 30,
    gcTime: 1000 * 60 * 60,
    refetchOnWindowFocus: false,
    refetchInterval: 1000 * 60 * 60 * 6,
  });

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
