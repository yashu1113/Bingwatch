import { Button } from "@/components/ui/button";
import { useQuery } from "@tanstack/react-query";
import { getWatchProviders } from "@/services/tmdb";
import { Loader2 } from "lucide-react";

interface StreamingButtonsProps {
  mediaType: 'movie' | 'tv';
  id: number;
}

const getProviderColor = (providerName: string): string => {
  const name = providerName.toLowerCase();
  if (name.includes('netflix')) return 'bg-[#E50914] hover:bg-[#db0000] border-[#E50914]';  // Netflix: Red hover
  if (name.includes('prime')) return 'bg-[#00A8E8] hover:bg-[#009ACD] border-[#00A8E8]';  // Prime: Light Blue hover
  if (name.includes('hotstar')) return 'bg-[#FF8000] hover:bg-[#E65C00] border-[#FF8000]';  // Hotstar: Orange hover
  if (name.includes('jio')) return 'bg-[#F10F29] hover:bg-[#C40D24] border-[#F10F29]';  // Jio: Red hover
  return 'bg-gray-600 hover:bg-gray-700 border-gray-700'; // Default: Gray hover
};

export const StreamingButtons = ({ mediaType, id }: StreamingButtonsProps) => {
  const { data: providers, isLoading } = useQuery({
    queryKey: ['watch-providers', mediaType, id],
    queryFn: () => getWatchProviders(mediaType, id),
  });

  const handleStreamingClick = (url: string) => {
    const newWindow = window.open(url, '_blank');
    if (newWindow) {
      try {
        const targetOrigin = new URL(url).origin;
        newWindow.postMessage({ type: 'STREAMING_PROVIDER_OPENED' }, targetOrigin);
      } catch (error) {
        console.warn('Failed to send postMessage:', error);
      }
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

  if (!streamingProviders.length) {
    return (
      <p className="text-gray-400 italic">
        Not available on streaming platforms in India
      </p>
    );
  }

  return (
    <div className="flex flex-wrap gap-3">
      {streamingProviders.map((provider) => {
        const providerColor = getProviderColor(provider.provider_name);
        return (
          <Button
            key={provider.provider_id}
            variant="outline"
            className={`flex items-center gap-2 px-4 py-2 bg-white/5 border border-white/10 rounded-lg transition-all duration-300
              ${providerColor} focus:ring-2 focus:ring-${providerColor.split(" ")[0]}/50`}
            onClick={() => handleStreamingClick(providers.results.IN.link)}
            aria-label={`Watch on ${provider.provider_name}`}
          >
            <img
              src={`https://image.tmdb.org/t/p/original${provider.logo_path}`}
              alt={provider.provider_name}
              className="h-6 w-6 rounded"
              loading="lazy"
            />
            {provider.provider_name}
          </Button>
        );
      })}
    </div>
  );
};
