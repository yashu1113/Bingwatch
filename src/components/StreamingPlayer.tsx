
import React, { useState, useRef, useEffect } from 'react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
import {
  Loader2, Wifi, ChevronDown, ChevronUp, Play, Pause,
  SkipBack, SkipForward, Maximize, Minimize, X,
  Volume2, Volume1, Volume, VolumeX
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useIsMobile } from "@/hooks/use-mobile";

interface StreamingPlayerProps {
  mediaType: 'movie' | 'tv';
  id: number;
  seasons?: { season_number: number; name: string; episode_count: number }[];
}

export const StreamingPlayer = ({ mediaType, id, seasons = [] }: StreamingPlayerProps) => {
  const [isPlaying, setIsPlaying] = useState(true); // Auto-play when opened
  const [selectedSeason, setSelectedSeason] = useState(1);
  const [selectedEpisode, setSelectedEpisode] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showSeasonSelector, setShowSeasonSelector] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [volumeLevel, setVolumeLevel] = useState(80);
  const [showControls, setShowControls] = useState(true);
  const [isPaused, setIsPaused] = useState(false);
  
  const playerContainerRef = useRef<HTMLDivElement>(null);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const controlsTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const isMobile = useIsMobile();
  
  // Automatically hide controls after a period of inactivity
  useEffect(() => {
    if (isFullscreen) {
      const showControlsTemporarily = () => {
        setShowControls(true);
        
        if (controlsTimeoutRef.current) {
          clearTimeout(controlsTimeoutRef.current);
        }
        
        controlsTimeoutRef.current = setTimeout(() => {
          if (!isPaused) {
            setShowControls(false);
          }
        }, 3000);
      };
      
      const handleMouseMove = () => showControlsTemporarily();
      const handleTouch = () => showControlsTemporarily();
      
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('touchstart', handleTouch);
      
      showControlsTemporarily();
      
      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('touchstart', handleTouch);
        if (controlsTimeoutRef.current) {
          clearTimeout(controlsTimeoutRef.current);
        }
      };
    } else {
      setShowControls(true);
    }
  }, [isFullscreen, isPaused]);
  
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

  // Auto-start playback and reset loading state after iframe loads
  useEffect(() => {
    if (isPlaying) {
      const timer = setTimeout(() => {
        setIsLoading(false);
      }, 2500);
      
      return () => clearTimeout(timer);
    }
  }, [isPlaying, selectedSeason, selectedEpisode]);

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
    setIsPaused(!isPaused);
    
    if (iframeRef.current) {
      try {
        // Send play/pause message to iframe
        iframeRef.current.contentWindow?.postMessage(
          { action: isPaused ? 'play' : 'pause' },
          '*'
        );
      } catch (err) {
        console.error('Error toggling play/pause:', err);
      }
    }
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
    setIsLoading(true); // Show loading when changing season
  };

  const handleEpisodeChange = (episode: number) => {
    setSelectedEpisode(episode);
    setIsLoading(true); // Show loading when changing episode
  };

  const handleNextEpisode = () => {
    const currentSeason = seasons.find(s => s.season_number === selectedSeason);
    if (currentSeason && selectedEpisode < currentSeason.episode_count) {
      setSelectedEpisode(prev => prev + 1);
      setIsLoading(true);
    } else if (selectedSeason < Math.max(...seasons.map(s => s.season_number))) {
      // Move to next season, episode 1
      setSelectedSeason(prev => prev + 1);
      setSelectedEpisode(1);
      setIsLoading(true);
    }
  };

  const handlePrevEpisode = () => {
    if (selectedEpisode > 1) {
      setSelectedEpisode(prev => prev - 1);
      setIsLoading(true);
    } else if (selectedSeason > 1) {
      // Move to previous season, last episode
      const prevSeason = seasons.find(s => s.season_number === selectedSeason - 1);
      if (prevSeason) {
        setSelectedSeason(prev => prev - 1);
        setSelectedEpisode(prevSeason.episode_count);
        setIsLoading(true);
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
  
  const handleVolumeChange = (value: number[]) => {
    const newVolume = value[0];
    setVolumeLevel(newVolume);
    setIsMuted(newVolume === 0);
    
    if (iframeRef.current) {
      try {
        // Send volume level to iframe
        iframeRef.current.contentWindow?.postMessage(
          { action: 'setVolume', volume: newVolume / 100 },
          '*'
        );
      } catch (err) {
        console.error('Error changing volume:', err);
      }
    }
  };

  const getVolumeIcon = () => {
    if (isMuted || volumeLevel === 0) return <VolumeX className="h-4 w-4" />;
    if (volumeLevel < 33) return <Volume className="h-4 w-4" />;
    if (volumeLevel < 67) return <Volume1 className="h-4 w-4" />;
    return <Volume2 className="h-4 w-4" />;
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
        onClick={() => setIsPlaying(true)}
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
              onClick={() => {
                setIsLoading(true);
                setError(null);
                setTimeout(() => setIsLoading(false), 2000);
              }} 
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
              "absolute bottom-0 left-0 right-0 flex flex-col gap-2 p-2 md:p-4 bg-gradient-to-t from-black/80 to-transparent",
              isFullscreen ? (showControls ? "opacity-100" : "opacity-0") : "opacity-100",
              "transition-opacity duration-300"
            )}>
              {/* Play/Pause and Volume Controls */}
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <Button 
                    variant="ghost" 
                    size="sm"
                    className="text-white bg-black/20 hover:bg-white/20 rounded-full p-2 h-auto w-auto"
                    onClick={handlePlay}
                  >
                    {isPaused ? <Play className="h-4 w-4" /> : <Pause className="h-4 w-4" />}
                  </Button>
                  
                  <div className="flex items-center gap-2">
                    <Button 
                      variant="ghost" 
                      size="sm"
                      className="text-white bg-black/20 hover:bg-white/20 rounded-full p-2 h-auto w-auto"
                      onClick={toggleMute}
                    >
                      {getVolumeIcon()}
                    </Button>
                    
                    <div className="w-24 hidden sm:block">
                      <Slider
                        value={[volumeLevel]}
                        min={0}
                        max={100}
                        step={1}
                        onValueChange={handleVolumeChange}
                        className="h-1"
                      />
                    </div>
                  </div>
                </div>
                
                <Button 
                  variant="ghost" 
                  size="sm"
                  className="text-white bg-black/20 hover:bg-white/20 rounded-full p-2 h-auto w-auto"
                  onClick={toggleFullscreen}
                >
                  {isFullscreen ? <Minimize className="h-4 w-4" /> : <Maximize className="h-4 w-4" />}
                </Button>
              </div>
            </div>
            
            {isFullscreen && (
              <Button
                variant="ghost"
                size="sm"
                className={cn(
                  "absolute top-4 right-4 text-white bg-black/40 hover:bg-black/60 rounded-full p-2 h-auto w-auto",
                  showControls ? "opacity-100" : "opacity-0",
                  "transition-opacity duration-300"
                )}
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
