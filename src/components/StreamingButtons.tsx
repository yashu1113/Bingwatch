import { Button } from "@/components/ui/button";
import { useQuery } from "@tanstack/react-query";
import { getWatchProviders } from "@/services/tmdb";
import { Loader2, Wifi, Film, Play, ExternalLink, List } from "lucide-react";
import { memo, useState, useRef, useEffect } from "react";
import { 
  Tabs, 
  TabsList, 
  TabsTrigger, 
  TabsContent 
} from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";

interface StreamingButtonsProps {
  mediaType: 'movie' | 'tv';
  id: number;
  title?: string;
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

const StreamingButtonsComponent = ({ mediaType, id, title, isInTheaters, seasons }: StreamingButtonsProps) => {
  const [isPlayerOpen, setIsPlayerOpen] = useState(false);
  const [selectedSeason, setSelectedSeason] = useState(seasons && seasons.length > 0 ? seasons[0].season_number : 1);
  const [selectedEpisode, setSelectedEpisode] = useState(1);
  const [activeStreamSource, setActiveStreamSource] = useState<string | null>(null);
  const iframeRef = useRef<HTMLIFrameElement | null>(null);
  const playerContainerRef = useRef<HTMLDivElement | null>(null);
  const { toast } = useToast();
  
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

  useEffect(() => {
    return () => {
      if (playerContainerRef.current && document.body.contains(playerContainerRef.current)) {
        document.body.removeChild(playerContainerRef.current);
      }
    };
  }, []);

  const closePlayer = () => {
    if (playerContainerRef.current && document.body.contains(playerContainerRef.current)) {
      document.body.removeChild(playerContainerRef.current);
    }
    setIsPlayerOpen(false);
    setActiveStreamSource(null);
  };

  const handleStreamClick = (source: string) => {
    setIsPlayerOpen(true);
    setActiveStreamSource(source);
    
    if (!playerContainerRef.current) {
      const container = document.createElement('div');
      container.className = 'fixed inset-0 z-50 bg-black flex flex-col items-center justify-center';
      playerContainerRef.current = container;
    } else {
      playerContainerRef.current.innerHTML = '';
    }
    
    const playerHeader = document.createElement('div');
    playerHeader.className = 'absolute top-0 left-0 right-0 bg-gray-900 p-4 flex items-center justify-between z-10';
    
    const titleElement = document.createElement('div');
    titleElement.className = 'text-white font-medium flex items-center';
    titleElement.innerHTML = `
      <span class="mr-2">${title || 'Now Playing'}</span>
      ${mediaType === 'tv' ? `<span class="text-xs bg-blue-600 px-2 py-0.5 rounded-full">S${selectedSeason}:E${selectedEpisode}</span>` : ''}
    `;
    
    const closeButton = document.createElement('button');
    closeButton.innerHTML = '×';
    closeButton.className = 'text-white text-3xl w-10 h-10 flex items-center justify-center rounded-full bg-red-600 hover:bg-red-700 focus:outline-none';
    closeButton.onclick = closePlayer;
    
    playerHeader.appendChild(titleElement);
    playerHeader.appendChild(closeButton);
    
    let streamUrl = '';
    switch(source) {
      case '2embed':
        streamUrl = mediaType === 'movie' 
          ? `https://2embed.org/embed/movie?tmdb=${id}`
          : `https://2embed.org/embed/series?tmdb=${id}&s=${selectedSeason}&e=${selectedEpisode}`;
        break;
      case 'vidsrc':
        streamUrl = mediaType === 'movie'
          ? `https://vidsrc.to/embed/movie/${id}`
          : `https://vidsrc.to/embed/tv/${id}/${selectedSeason}/${selectedEpisode}`;
        break;
      case 'superembed':
        streamUrl = mediaType === 'movie'
          ? `https://multiembed.mov/directstream.php?video_id=${id}&tmdb=1`
          : `https://multiembed.mov/directstream.php?video_id=${id}&tmdb=1&s=${selectedSeason}&e=${selectedEpisode}`;
        break;
      default:
        streamUrl = mediaType === 'movie' 
          ? `https://2embed.org/embed/movie?tmdb=${id}`
          : `https://2embed.org/embed/series?tmdb=${id}&s=${selectedSeason}&e=${selectedEpisode}`;
    }
    
    const iframe = document.createElement('iframe');
    iframe.src = streamUrl;
    iframe.className = 'w-full h-full';
    iframe.style.marginTop = '56px';
    iframe.allowFullscreen = true;
    iframe.allow = "accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share";
    iframe.setAttribute('sandbox', 'allow-same-origin allow-scripts allow-forms allow-popups allow-popups-to-escape-sandbox allow-presentation');
    iframeRef.current = iframe;
    
    const loadingIndicator = document.createElement('div');
    loadingIndicator.className = 'absolute inset-0 flex items-center justify-center bg-black/80 mt-14';
    loadingIndicator.innerHTML = '<div class="animate-spin h-12 w-12 border-4 border-white border-t-transparent rounded-full"></div>';
    
    playerContainerRef.current.appendChild(playerHeader);
    playerContainerRef.current.appendChild(loadingIndicator);
    playerContainerRef.current.appendChild(iframe);
    
    document.body.appendChild(playerContainerRef.current);
    
    iframe.onload = () => {
      if (loadingIndicator.parentNode === playerContainerRef.current) {
        playerContainerRef.current?.removeChild(loadingIndicator);
      }
      toast({
        title: "Stream loaded",
        description: "If no video appears, try another source or check your ad blocker.",
        duration: 3000,
      });
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

  return (
    <div className="space-y-4">
      {mediaType === 'tv' && seasons && seasons.length > 0 && (
        <div className="bg-gray-900 rounded-lg p-4 border border-gray-800 mb-4">
          <h4 className="text-sm font-medium mb-2 text-gray-300">Select Episode:</h4>
          <Tabs defaultValue="season" className="w-full">
            <TabsList className="grid w-full grid-cols-2 bg-gray-800 mb-3">
              <TabsTrigger value="season">Season</TabsTrigger>
              <TabsTrigger value="episode">Episode</TabsTrigger>
            </TabsList>
            <TabsContent value="season" className="bg-gray-800/50 rounded-lg p-3">
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2 max-h-48 overflow-y-auto">
                {seasons.map((season) => (
                  <Button
                    key={season.season_number}
                    variant="outline" 
                    size="sm"
                    className={`flex items-center justify-between ${
                      selectedSeason === season.season_number 
                        ? 'bg-blue-600 text-white border-blue-500' 
                        : 'bg-gray-800 hover:bg-gray-700 border-gray-700'
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
            <TabsContent value="episode" className="bg-gray-800/50 rounded-lg p-3">
              <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 lg:grid-cols-10 gap-2 max-h-48 overflow-y-auto">
                {generateEpisodeNumbers().map((epNum) => (
                  <Button
                    key={epNum}
                    variant="outline"
                    size="sm"
                    className={`${
                      selectedEpisode === epNum 
                        ? 'bg-blue-600 text-white border-blue-500' 
                        : 'bg-gray-800 hover:bg-gray-700 border-gray-700'
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
      )}

      <div className="flex flex-wrap gap-3 items-center">
        <Button
          variant="outline"
          className={`bg-purple-600 hover:bg-purple-700 text-white border-purple-700 
            focus:ring-2 focus:ring-offset-2 focus:ring-offset-netflix-black
            transition-all duration-200 hover:scale-105 flex-1 md:flex-none
            ${activeStreamSource === '2embed' ? 'ring-2 ring-white' : ''}`}
          onClick={() => handleStreamClick('2embed')}
          aria-label="2Embed Stream"
          disabled={isPlayerOpen && activeStreamSource !== '2embed'}
        >
          <Play className="mr-2 h-4 w-4" />
          2Embed Stream
          {mediaType === 'tv' && (
            <span className="ml-2 text-xs bg-gray-800 px-2 py-0.5 rounded">
              S{selectedSeason}:E{selectedEpisode}
            </span>
          )}
        </Button>
        
        <Button
          variant="outline"
          className={`bg-red-600 hover:bg-red-700 text-white border-red-700 
            focus:ring-2 focus:ring-offset-2 focus:ring-offset-netflix-black
            transition-all duration-200 hover:scale-105 flex-1 md:flex-none
            ${activeStreamSource === 'vidsrc' ? 'ring-2 ring-white' : ''}`}
          onClick={() => handleStreamClick('vidsrc')}
          aria-label="VidSrc Stream"
          disabled={isPlayerOpen && activeStreamSource !== 'vidsrc'}
        >
          <Film className="mr-2 h-4 w-4" />
          VidSrc Stream
          {mediaType === 'tv' && (
            <span className="ml-2 text-xs bg-gray-800 px-2 py-0.5 rounded">
              S{selectedSeason}:E{selectedEpisode}
            </span>
          )}
        </Button>
        
        <Button
          variant="outline"
          className={`bg-green-600 hover:bg-green-700 text-white border-green-700 
            focus:ring-2 focus:ring-offset-2 focus:ring-offset-netflix-black
            transition-all duration-200 hover:scale-105 flex-1 md:flex-none
            ${activeStreamSource === 'superembed' ? 'ring-2 ring-white' : ''}`}
          onClick={() => handleStreamClick('superembed')}
          aria-label="SuperEmbed Stream"
          disabled={isPlayerOpen && activeStreamSource !== 'superembed'}
        >
          <Wifi className="mr-2 h-4 w-4" />
          SuperEmbed
          {mediaType === 'tv' && (
            <span className="ml-2 text-xs bg-gray-800 px-2 py-0.5 rounded">
              S{selectedSeason}:E{selectedEpisode}
            </span>
          )}
        </Button>
      </div>
      
      {streamingProviders.length > 0 && (
        <div>
          <h4 className="text-sm font-medium mb-2 flex items-center gap-2">
            <ExternalLink size={16} />
            Stream on official platforms:
          </h4>
          <div className="flex flex-wrap gap-2">
            {streamingProviders.map(provider => renderProviderButton(provider, 'stream'))}
          </div>
        </div>
      )}

      {rentalProviders.length > 0 && (
        <div>
          <h4 className="text-sm font-medium mb-2 flex items-center gap-2">
            <ExternalLink size={16} />
            Rent on official platforms:
          </h4>
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
