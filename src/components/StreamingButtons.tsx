import { Button } from "@/components/ui/button";
import { useQuery } from "@tanstack/react-query";
import { getWatchProviders } from "@/services/tmdb";
import { Loader2 } from "lucide-react";

interface StreamingButtonsProps {
  mediaType: "movie" | "tv";
  id: number;
}

const getProviderColor = (providerName: string): string => {
  const name = providerName.toLowerCase();
  if (name.includes("netflix")) return "streaming-netflix";
  if (name.includes("prime")) return "streaming-prime";
  if (name.includes("hotstar")) return "streaming-hotstar";
  if (name.includes("jio")) return "streaming-jio";
  return "default";
};

export const StreamingButtons = ({ mediaType, id }: StreamingButtonsProps) => {
  const { data: providers, isLoading, isError } = useQuery({
    queryKey: ["watch-providers", mediaType, id],
    queryFn: () => getWatchProviders(mediaType, id),
  });

  const handleStreamingClick = (url: string) => {
    const newWindow = window.open(url, "_blank");
    if (newWindow) {
      try {
        const targetOrigin = new URL(url).origin;
        newWindow.postMessage({ type: "STREAMING_PROVIDER_OPENED" }, targetOrigin);
      } catch (error) {
        console.warn("Failed to send postMessage:", error);
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

  if (isError || !providers?.results?.IN?.flatrate) {
    return (
      <p className="text-gray-400 italic">
        Not available on streaming platforms in India
      </p>
    );
  }

  const streamingProviders = providers.results.IN.flatrate || [];

  return (
    <div className="flex flex-wrap gap-3">
      {streamingProviders.map((provider) => {
        const providerColor = getProviderColor(provider.provider_name);
        const providerLink = provider.provider_url || "#"; // Add proper provider URL if available
        return (
          <Button
            key={provider.provider_id}
            variant="outline"
            className={`flex items-center gap-2 px-4 py-2 bg-white/5 border border-white/10 rounded-lg transition-all duration-300
              hover:bg-${providerColor} hover:border-${providerColor} hover:animate-glow
              focus:ring-2 focus:ring-${providerColor}/50`}
            onClick={() => handleStreamingClick(providerLink)}
            aria-label={`Watch on ${provider.provider_name}`}
          >
            {provider.logo_path ? (
              <img
                src={`https://image.tmdb.org/t/p/original${provider.logo_path}`}
                alt={provider.provider_name}
                className="h-6 w-6 rounded"
                loading="lazy"
              />
            ) : (
              <div className="h-6 w-6 bg-gray-400 rounded" />
            )}
            {provider.provider_name}
          </Button>
        );
      })}
    </div>
  );
};
