import { Button } from "@/components/ui/button";
import { useQuery } from "@tanstack/react-query";
import { getWatchProviders } from "@/services/tmdb";
import { Loader2 } from "lucide-react";

interface StreamingButtonsProps {
  mediaType: 'movie' | 'tv';
  id: number;
  isInTheaters?: boolean;
}

const getProviderColor = (providerName: string): string => {
  const name = providerName.toLowerCase();
  if (name.includes('netflix')) return 'streaming-netflix';
  if (name.includes('prime')) return 'streaming-prime';
  if (name.includes('hotstar')) return 'streaming-hotstar';
  if (name.includes('jio')) return 'streaming-jio';
  return 'bg-gray-600 hover:bg-gray-700 border-gray-700';
};

export const StreamingButtons = ({ mediaType, id, isInTheaters }: StreamingButtonsProps) => {
  const { data: providers, isLoading } = useQuery({
    queryKey: ['watch-providers', mediaType, id],
    queryFn: () => getWatchProviders(mediaType, id),
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

  // Only show theater badge if there are no streaming/rental options AND the movie is in theaters
  // AND we're not showing any streaming providers
  if (!hasStreamingOptions && isInTheaters && !providers?.results?.IN) {
    return (
      <div className="inline-flex items-center px-3 py-1.5 bg-[#F4A261] text-white rounded-lg font-medium">
        Now Playing in Theaters
      </div>
    );
  }

  if (!hasStreamingOptions) {
    return (
      <p className="text-gray-400 italic">
        Not available on streaming or rental platforms in India
      </p>
    );
  }

  return (
    <div className="space-y-4">
      {streamingProviders.length > 0 && (
        <div>
          <h4 className="text-sm font-medium mb-2">Stream on:</h4>
          <div className="flex flex-wrap gap-2">
            {streamingProviders.map((provider) => {
              const providerClass = getProviderColor(provider.provider_name);
              if (!providerUrl) return null;
              
              return (
                <Button
                  key={provider.provider_id}
                  variant="outline"
                  className={`flex items-center gap-2 px-3 py-1.5 text-sm border rounded-lg
                    ${providerClass} focus:ring-2 focus:ring-offset-2 focus:ring-offset-netflix-black`}
                  onClick={() => handleStreamingClick(providerUrl)}
                  aria-label={`Watch on ${provider.provider_name}`}
                >
                  <img
                    src={`https://image.tmdb.org/t/p/original${provider.logo_path}`}
                    alt={provider.provider_name}
                    className="h-5 w-5 rounded"
                    loading="lazy"
                  />
                  {provider.provider_name}
                </Button>
              );
            })}
          </div>
        </div>
      )}

      {rentalProviders.length > 0 && (
        <div>
          <h4 className="text-sm font-medium mb-2">Rent on:</h4>
          <div className="flex flex-wrap gap-2">
            {rentalProviders.map((provider) => {
              const providerClass = getProviderColor(provider.provider_name);
              if (!providerUrl) return null;
              
              return (
                <Button
                  key={provider.provider_id}
                  variant="outline"
                  className={`flex items-center gap-2 px-3 py-1.5 text-sm border rounded-lg
                    ${providerClass} focus:ring-2 focus:ring-offset-2 focus:ring-offset-netflix-black`}
                  onClick={() => handleStreamingClick(providerUrl)}
                  aria-label={`Rent on ${provider.provider_name}`}
                >
                  <img
                    src={`https://image.tmdb.org/t/p/original${provider.logo_path}`}
                    alt={provider.provider_name}
                    className="h-5 w-5 rounded"
                    loading="lazy"
                  />
                  {provider.provider_name}
                </Button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};