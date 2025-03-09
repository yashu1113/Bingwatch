
import React, { useState, useRef, useEffect } from 'react';
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
  onClose?: () => void;
}

export const StreamingPlayer = ({ mediaType, id, seasons = [], onClose }: StreamingPlayerProps) => {
  const [isPlaying, setIsPlaying] = useState(true);
  const [selectedSeason, setSelectedSeason] = useState(seasons.length > 0 ? seasons[0]?.season_number : 1);
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
  
  // Auto enter fullscreen on mount
  useEffect(() => {
    const enterFullscreen = async () => {
      try {
        if (playerContainerRef.current && !document.fullscreenElement) {
          // Short delay to ensure the component is fully mounted
          setTimeout(async () => {
            try {
              await playerContainerRef.current?.requestFullscreen();
            } catch (err) {
              console.error('Failed to enter fullscreen:', err);
            }
          }, 500);
        }
      } catch (err) {
        console.error('Error entering fullscreen on mount:', err);
      }
    };
    
    enterFullscreen();
    
    // Cleanup when component unmounts
    return () => {
      if (document.fullscreenElement) {
        document.exitFullscreen().catch(err => {
          console.error('Error exiting fullscreen on unmount:', err);
        });
      }
    };
  }, []);
  
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
      
      // If user exits fullscreen, handle the close action
      if (!document.fullscreenElement && onClose) {
        onClose();
      }
    };
    
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
    };
  }, [onClose]);

  // Auto-start playback and reset loading state after iframe loads
  useEffect(() => {
    if (isPlaying) {
      setIsLoading(true);
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
      document.exitFullscreen().catch(err => {
        console.error('Error exiting fullscreen:', err);
      });
    }
    if (onClose) onClose();
  };

  const handleSeasonChange = (season: number) => {
    setSelectedSeason(season);
    setSelectedEpisode(1); // Reset to episode 1 when changing seasons
    setShowSeasonSelector(false);
    setIsLoading(true); // Show loading when changing season
  };

  const handleEpisodeChange = (episode: number) => {
    if (episode < 1) {
      setSelectedEpisode(1);
    } else {
      const currentSeason = seasons.find(s => s.season_number === selectedSeason);
      const maxEpisodes = currentSeason?.episode_count || 1;
      
      if (episode > maxEpisodes) {
        setSelectedEpisode(maxEpisodes);
      } else {
        setSelectedEpisode(episode);
        setIsLoading(true); // Show loading when changing episode
      }
    }
  };

  const handleNextEpisode = () => {
    const currentSeason = seasons.find(s => s.season_number === selectedSeason);
    if (currentSeason && selectedEpisode < currentSeason.episode_count) {
      setSelectedEpisode(prev => prev + 1);
      setIsLoading(true);
    } else {
      // Find the next season
      const currentSeasonIndex = seasons.findIndex(s => s.season_number === selectedSeason);
      if (currentSeasonIndex < seasons.length - 1) {
        const nextSeason = seasons[currentSeasonIndex + 1];
        setSelectedSeason(nextSeason.season_number);
        setSelectedEpisode(1);
        setIsLoading(true);
      }
    }
  };

  const handlePrevEpisode = () => {
    if (selectedEpisode > 1) {
      setSelectedEpisode(prev => prev - 1);
      setIsLoading(true);
    } else {
      // Find the previous season
      const currentSeasonIndex = seasons.findIndex(s => s.season_number === selectedSeason);
      if (currentSeasonIndex > 0) {
        const prevSeason = seasons[currentSeasonIndex - 1];
        setSelectedSeason(prevSeason.season_number);
        setSelectedEpisode(prevSeason.episode_count || 1);
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

  return (
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
          
          {/* Top controls - title and close button */}
          <div className={cn(
            "absolute top-0 left-0 right-0 p-2 md:p-4 bg-gradient-to-b from-black/80 to-transparent",
            isFullscreen ? (showControls ? "opacity-100" : "opacity-0") : "opacity-100",
            "transition-opacity duration-300 z-10"
          )}>
            <div className="flex justify-between items-center">
              <h2 className="text-white font-medium truncate">
                {mediaType === 'tv' && `S${selectedSeason} E${selectedEpisode}`}
              </h2>
              <Button
                variant="ghost"
                size="sm"
                className="text-white bg-black/20 hover:bg-white/20 rounded-full p-2 h-auto w-auto"
                onClick={handleClose}
              >
                <X className="h-5 w-5" />
              </Button>
            </div>
          </div>
          
          {/* Media controls - play/pause, volume, fullscreen */}
          <div className={cn(
            "absolute bottom-0 left-0 right-0 flex flex-col gap-2 p-2 md:p-4 bg-gradient-to-t from-black/80 to-transparent",
            isFullscreen ? (showControls ? "opacity-100" : "opacity-0") : "opacity-100",
            "transition-opacity duration-300 z-10"
          )}>
            {/* TV Show Episode and Season Controls */}
            {mediaType === 'tv' && seasons.length > 0 && (
              <div className="flex flex-wrap items-center gap-2 mb-2">
                <div className="relative">
                  <Button 
                    variant="outline"
                    size="sm"
                    className="bg-gray-800/50 hover:bg-gray-700/50 text-white text-xs md:text-sm"
                    onClick={() => setShowSeasonSelector(prev => !prev)}
                  >
                    {seasons.find(s => s.season_number === selectedSeason)?.name || `Season ${selectedSeason}`}
                    {showSeasonSelector ? (
                      <ChevronUp className="ml-1 h-3 w-3" />
                    ) : (
                      <ChevronDown className="ml-1 h-3 w-3" />
                    )}
                  </Button>
                  
                  {showSeasonSelector && (
                    <div className="absolute bottom-full left-0 mb-1 bg-gray-900/90 border border-gray-700 rounded-md shadow-lg z-20 max-h-48 overflow-y-auto">
                      {seasons.map((season) => (
                        <button
                          key={season.season_number}
                          className={cn(
                            "block w-full text-left px-3 py-1.5 text-xs md:text-sm hover:bg-gray-800/80",
                            selectedSeason === season.season_number && "bg-gray-800/80"
                          )}
                          onClick={() => handleSeasonChange(season.season_number)}
                        >
                          {season.name}
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-1">
                  <Button 
                    variant="outline" 
                    size="sm"
                    className="bg-gray-800/50 hover:bg-gray-700/50 p-1 h-8 w-8"
                    onClick={handlePrevEpisode}
                    disabled={selectedSeason === seasons[0]?.season_number && selectedEpisode === 1}
                  >
                    <SkipBack className="h-4 w-4" />
                  </Button>
                  
                  <div className="flex items-center gap-1">
                    <span className="text-xs md:text-sm hidden xs:inline">Ep:</span>
                    <Input
                      type="number"
                      min="1"
                      max={seasons.find(s => s.season_number === selectedSeason)?.episode_count || 1}
                      value={selectedEpisode}
                      onChange={(e) => handleEpisodeChange(parseInt(e.target.value) || 1)}
                      className="w-12 h-8 bg-gray-800/50 text-center text-xs p-1"
                    />
                    <span className="text-xs md:text-sm">/ {seasons.find(s => s.season_number === selectedSeason)?.episode_count || '-'}</span>
                  </div>
                  
                  <Button 
                    variant="outline" 
                    size="sm"
                    className="bg-gray-800/50 hover:bg-gray-700/50 p-1 h-8 w-8"
                    onClick={handleNextEpisode}
                    disabled={
                      selectedSeason === seasons[seasons.length - 1]?.season_number && 
                      selectedEpisode === (seasons.find(s => s.season_number === selectedSeason)?.episode_count || 1)
                    }
                  >
                    <SkipForward className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            )}
            
            {/* Play/Pause and Volume Controls */}
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-2">
                <Button 
                  variant="ghost" 
                  size="sm"
                  className="text-white bg-black/20 hover:bg-white/20 rounded-full p-2 h-auto w-auto"
                  onClick={handlePlay}
                >
                  {isPaused ? <Play className="h-5 w-5" /> : <Pause className="h-5 w-5" />}
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
                  
                  <div className="w-20 hidden xs:block md:w-24">
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
                {isFullscreen ? <Minimize className="h-5 w-5" /> : <Maximize className="h-5 w-5" />}
              </Button>
            </div>
          </div>
        </>
      )}
    </div>
  );
};
