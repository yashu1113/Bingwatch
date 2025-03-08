
import React, { useState, useRef, useEffect } from 'react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2, Wifi, ChevronDown, ChevronUp, Play, SkipBack, SkipForward, Maximize, Minimize, X, Volume2, VolumeX } from "lucide-react";
import { cn } from "@/lib/utils";
import { useIsMobile } from "@/hooks/use-mobile";

interface StreamingPlayerProps {
  mediaType: 'movie' | 'tv';
  id: number;
  seasons?: { season_number: number; name: string; episode_count: number }[];
}

export const StreamingPlayer = ({ mediaType, id, seasons = [] }: StreamingPlayerProps) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [selectedSeason, setSelectedSeason] = useState(1);
  const [selectedEpisode, setSelectedEpisode] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showSeasonSelector, setShowSeasonSelector] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  
  const playerContainerRef = useRef<HTMLDivElement>(null);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const isMobile = useIsMobile();
  
  // Handle fullscreen changes
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
    };
  }, []);

  const toggleFullscreen = async () => {
    try {
      if (!document.fullscreenElement && playerContainerRef.current) {
        await playerContainerRef.current.requestFullscreen();
      } else if (document.fullscreenElement) {
        await document.exitFullscreen();
      }
    } catch (err) {
      console.error('Error toggling fullscreen:', err);
    }
  };

  const handlePlay = () => {
    setIsLoading(true);
    setError(null);
    setIsPlaying(true);
    // Reset loading state after iframe loads
    setTimeout(() => setIsLoading(false), 1500);
  };

  const handleClose = () => {
    if (document.fullscreenElement) {
      document.exitFullscreen();
    }
    setIsPlaying(false);
    setError(null);
  };

  const handleSeasonChange = (season: number) => {
    setSelectedSeason(season);
    setSelectedEpisode(1); // Reset to episode 1 when changing seasons
    setShowSeasonSelector(false);
  };

  const handleEpisodeChange = (episode: number) => {
    setSelectedEpisode(episode);
  };

  const handleNextEpisode = () => {
    const currentSeason = seasons.find(s => s.season_number === selectedSeason);
    if (currentSeason && selectedEpisode < currentSeason.episode_count) {
      setSelectedEpisode(prev => prev + 1);
    } else if (selectedSeason < Math.max(...seasons.map(s => s.season_number))) {
      // Move to next season, episode 1
      setSelectedSeason(prev => prev + 1);
      setSelectedEpisode(1);
    }
  };

  const handlePrevEpisode = () => {
    if (selectedEpisode > 1) {
      setSelectedEpisode(prev => prev - 1);
    } else if (selectedSeason > 1) {
      // Move to previous season, last episode
      const prevSeason = seasons.find(s => s.season_number === selectedSeason - 1);
      if (prevSeason) {
        setSelectedSeason(prev => prev - 1);
        setSelectedEpisode(prevSeason.episode_count);
      }
    }
  };

  const toggleMute = () => {
    setIsMuted(!isMuted);
    if (iframeRef.current) {
      try {
        // Send mute/unmute message to iframe
        iframeRef.current.contentWindow?.postMessage(
          { action: isMuted ? 'unmute' : 'mute' },
          '*'
        );
      } catch (err) {
        console.error('Error toggling mute:', err);
      }
    }
  };

  const getStreamUrl = () => {
    try {
      if (mediaType === 'movie') {
        return `https://flicky.host/embed/movie/?id=${id}`;
      } else {
        return `https://flicky.host/embed/tv/?id=${id}/${selectedSeason}/${selectedEpisode}`;
      }
    } catch (err) {
      setError("Failed to generate streaming URL");
      return "";
    }
  };

  if (!isPlaying) {
    return (
      <Button
        onClick={handlePlay}
        className="bg-purple-600 hover:bg-purple-700 text-white border-purple-700 
          focus:ring-2 focus:ring-offset-2 focus:ring-offset-netflix-black
          transition-all duration-200 hover:scale-105"
        aria-label="Live Stream"
      >
        <Wifi className="mr-2 h-4 w-4" />
        Live Stream
      </Button>
    );
  }

  return (
    <div className="space-y-4 w-full">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold flex items-center gap-2">
          <Wifi className="h-4 w-4" />
          {mediaType === 'movie' ? 'Movie Stream' : 'TV Stream'}
        </h3>
        <Button 
          variant="outline" 
          size="sm" 
          onClick={handleClose}
          className="bg-gray-800 hover:bg-gray-700"
        >
          <X className="mr-2 h-4 w-4" />
          Close Player
        </Button>
      </div>

      {mediaType === 'tv' && (
        <div className="flex flex-wrap gap-2 items-center">
          <div className="relative">
            <Button 
              variant="outline"
              className="bg-gray-800 hover:bg-gray-700 text-white"
              onClick={() => setShowSeasonSelector(prev => !prev)}
            >
              Season {selectedSeason}
              {showSeasonSelector ? (
                <ChevronUp className="ml-2 h-4 w-4" />
              ) : (
                <ChevronDown className="ml-2 h-4 w-4" />
              )}
            </Button>
            
            {showSeasonSelector && (
              <div className="absolute top-full left-0 mt-1 bg-gray-900 border border-gray-700 rounded-md shadow-lg z-10 max-h-48 overflow-y-auto">
                {seasons.map((season) => (
                  <button
                    key={season.season_number}
                    className={cn(
                      "block w-full text-left px-4 py-2 hover:bg-gray-800",
                      selectedSeason === season.season_number && "bg-gray-800"
                    )}
                    onClick={() => handleSeasonChange(season.season_number)}
                  >
                    {season.name}
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="flex items-center gap-2">
            <Button 
              variant="outline" 
              size="sm"
              className="bg-gray-800 hover:bg-gray-700"
              onClick={handlePrevEpisode}
              disabled={selectedSeason === 1 && selectedEpisode === 1}
            >
              <SkipBack className="h-4 w-4" />
            </Button>
            
            <div className="flex items-center gap-2">
              <span>Episode:</span>
              <Input
                type="number"
                min="1"
                max={seasons.find(s => s.season_number === selectedSeason)?.episode_count || 1}
                value={selectedEpisode}
                onChange={(e) => handleEpisodeChange(parseInt(e.target.value) || 1)}
                className="w-16 h-8 bg-gray-800"
              />
            </div>
            
            <Button 
              variant="outline" 
              size="sm"
              className="bg-gray-800 hover:bg-gray-700"
              onClick={handleNextEpisode}
              disabled={
                selectedSeason === Math.max(...seasons.map(s => s.season_number)) && 
                selectedEpisode === (seasons.find(s => s.season_number === selectedSeason)?.episode_count || 1)
              }
            >
              <SkipForward className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}

      <div 
        ref={playerContainerRef}
        className={cn(
          "relative w-full bg-black rounded-lg overflow-hidden transition-all",
          isFullscreen 
            ? "fixed inset-0 z-50" 
            : "aspect-video"
        )}
      >
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-900 bg-opacity-70 z-10">
            <Loader2 className="h-8 w-8 animate-spin text-purple-500" />
          </div>
        )}
        
        {error ? (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-gray-900 text-red-400">
            <p>{error}</p>
            <Button 
              onClick={handlePlay} 
              variant="outline" 
              className="mt-4 bg-gray-800 hover:bg-gray-700"
            >
              <Play className="mr-2 h-4 w-4" />
              Try Again
            </Button>
          </div>
        ) : (
          <>
            <iframe
              ref={iframeRef}
              src={getStreamUrl()}
              className="w-full h-full"
              allowFullScreen
              onError={() => setError("Failed to load streaming content")}
              allow="autoplay; fullscreen"
            />
            
            <div className={cn(
              "absolute bottom-0 left-0 right-0 flex justify-between items-center p-2 md:p-4 bg-gradient-to-t from-black/80 to-transparent",
              isFullscreen ? "opacity-0 hover:opacity-100 transition-opacity" : ""
            )}>
              <div className="flex gap-2">
                <Button 
                  variant="ghost" 
                  size="sm"
                  className="text-white bg-transparent hover:bg-white/20"
                  onClick={toggleMute}
                >
                  {isMuted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
                </Button>
              </div>
              
              <Button 
                variant="ghost" 
                size="sm"
                className="text-white bg-transparent hover:bg-white/20"
                onClick={toggleFullscreen}
              >
                {isFullscreen ? <Minimize className="h-4 w-4" /> : <Maximize className="h-4 w-4" />}
              </Button>
            </div>
            
            {isFullscreen && (
              <Button
                variant="ghost"
                size="sm"
                className="absolute top-4 right-4 text-white bg-black/40 hover:bg-black/60"
                onClick={handleClose}
              >
                <X className="h-4 w-4" />
              </Button>
            )}
          </>
        )}
      </div>
    </div>
  );
};

