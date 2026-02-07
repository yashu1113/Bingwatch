import { useState, useEffect } from 'react';
import { ChevronDown, ChevronUp, Play, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { ScrollArea } from '@/components/ui/scroll-area';

interface Season {
  season_number: number;
  name: string;
  episode_count: number;
}

interface EpisodeSelectorProps {
  seasons: Season[];
  selectedSeason: number;
  selectedEpisode: number;
  onSeasonChange: (season: number) => void;
  onEpisodeChange: (episode: number) => void;
  onPlay: () => void;
}

export const EpisodeSelector = ({
  seasons,
  selectedSeason,
  selectedEpisode,
  onSeasonChange,
  onEpisodeChange,
  onPlay
}: EpisodeSelectorProps) => {
  const [isExpanded, setIsExpanded] = useState(false);
  
  const currentSeason = seasons.find(s => s.season_number === selectedSeason);
  const episodeCount = currentSeason?.episode_count || 0;
  const episodes = Array.from({ length: episodeCount }, (_, i) => i + 1);

  // Calculate episode grid columns based on count
  const getGridCols = () => {
    if (episodeCount <= 8) return 'grid-cols-4';
    if (episodeCount <= 16) return 'grid-cols-6';
    return 'grid-cols-8';
  };

  return (
    <div className="space-y-3">
      {/* Compact Header with Play Button */}
      <div className="flex items-center gap-3 flex-wrap">
        <Button
          onClick={onPlay}
          className="bg-netflix-red hover:bg-netflix-red/90 text-white font-semibold"
        >
          <Play className="mr-2 h-4 w-4 fill-white" />
          Watch S{selectedSeason} E{selectedEpisode}
        </Button>
        
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className={cn(
            "flex items-center gap-2 px-4 py-2 rounded-lg transition-all",
            "bg-gray-800/80 hover:bg-gray-700 text-white border border-gray-700",
            isExpanded && "border-netflix-red bg-gray-800"
          )}
        >
          <span className="text-sm font-medium">
            {currentSeason?.name || `Season ${selectedSeason}`}
          </span>
          <span className="text-xs text-gray-400">• Ep {selectedEpisode}</span>
          {isExpanded ? (
            <ChevronUp className="w-4 h-4 text-gray-400" />
          ) : (
            <ChevronDown className="w-4 h-4 text-gray-400" />
          )}
        </button>
      </div>

      {/* Expandable Selection Panel */}
      {isExpanded && (
        <div className="bg-gray-900/95 backdrop-blur-sm rounded-xl border border-gray-800 p-4 space-y-4 animate-fade-in">
          {/* Season Pills */}
          <div className="space-y-2">
            <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Season</h4>
            <div className="flex flex-wrap gap-2">
              {seasons.map((season) => (
                <button
                  key={season.season_number}
                  onClick={() => {
                    onSeasonChange(season.season_number);
                    onEpisodeChange(1); // Reset to episode 1
                  }}
                  className={cn(
                    "px-4 py-2 rounded-lg text-sm font-medium transition-all",
                    "border focus:outline-none focus:ring-2 focus:ring-netflix-red/50",
                    selectedSeason === season.season_number
                      ? "bg-netflix-red text-white border-netflix-red"
                      : "bg-gray-800 text-gray-300 border-gray-700 hover:bg-gray-700 hover:text-white"
                  )}
                >
                  <span className="flex items-center gap-2">
                    S{season.season_number}
                    <span className="text-xs opacity-70">({season.episode_count} eps)</span>
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Episode Grid */}
          <div className="space-y-2">
            <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
              Episode <span className="text-white font-bold">({episodeCount} episodes)</span>
            </h4>
            <ScrollArea className="max-h-48">
              <div className={cn("grid gap-2", getGridCols())}>
                {episodes.map((ep) => (
                  <button
                    key={ep}
                    onClick={() => onEpisodeChange(ep)}
                    className={cn(
                      "relative h-10 rounded-lg text-sm font-medium transition-all",
                      "border focus:outline-none focus:ring-2 focus:ring-netflix-red/50",
                      "flex items-center justify-center",
                      selectedEpisode === ep
                        ? "bg-netflix-red text-white border-netflix-red shadow-lg shadow-netflix-red/30"
                        : "bg-gray-800/60 text-gray-300 border-gray-700 hover:bg-gray-700 hover:text-white hover:border-gray-600"
                    )}
                  >
                    {selectedEpisode === ep ? (
                      <span className="flex items-center gap-1">
                        <Check className="w-3 h-3" />
                        {ep}
                      </span>
                    ) : (
                      ep
                    )}
                  </button>
                ))}
              </div>
            </ScrollArea>
          </div>

          {/* Quick Actions */}
          <div className="flex items-center gap-2 pt-2 border-t border-gray-800">
            <Button
              size="sm"
              variant="ghost"
              onClick={() => onEpisodeChange(1)}
              className="text-xs text-gray-400 hover:text-white"
            >
              First Episode
            </Button>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => onEpisodeChange(episodeCount)}
              className="text-xs text-gray-400 hover:text-white"
            >
              Latest Episode
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};
