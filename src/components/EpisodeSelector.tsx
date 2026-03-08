import { useState } from 'react';
import { ChevronDown, ChevronUp, Play, Check, Eye, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useQuery } from '@tanstack/react-query';
import { getSeasonDetails } from '@/services/tmdb';
import { useContinueWatching } from '@/contexts/ContinueWatchingContext';

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
  tvId?: number;
}

export const EpisodeSelector = ({
  seasons,
  selectedSeason,
  selectedEpisode,
  onSeasonChange,
  onEpisodeChange,
  onPlay,
  tvId
}: EpisodeSelectorProps) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const { watchProgress } = useContinueWatching();

  const currentSeason = seasons.find(s => s.season_number === selectedSeason);

  // Fetch episode details from TMDB
  const { data: seasonData, isLoading: episodesLoading } = useQuery({
    queryKey: ['season-details', tvId, selectedSeason],
    queryFn: () => getSeasonDetails(tvId!, selectedSeason),
    enabled: !!tvId && isExpanded,
    staleTime: 1000 * 60 * 30,
  });

  const episodes = seasonData?.episodes || [];
  const episodeCount = currentSeason?.episode_count || 0;
  const fallbackEpisodes = episodes.length > 0
    ? episodes
    : Array.from({ length: episodeCount }, (_, i) => ({
        episode_number: i + 1,
        name: `Episode ${i + 1}`,
      }));

  // Determine which episodes are "watched" based on continue watching progress
  const currentProgress = tvId ? watchProgress.find(p => p.id === tvId) : null;
  const isEpisodeWatched = (seasonNum: number, epNum: number) => {
    if (!currentProgress) return false;
    if (!currentProgress.currentSeason || !currentProgress.currentEpisode) return false;
    if (seasonNum < currentProgress.currentSeason) return true;
    if (seasonNum === currentProgress.currentSeason && epNum < currentProgress.currentEpisode) return true;
    if (seasonNum === currentProgress.currentSeason && epNum === currentProgress.currentEpisode && currentProgress.progress > 80) return true;
    return false;
  };

  const selectedEpData = fallbackEpisodes.find(e => e.episode_number === selectedEpisode);

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
                    onEpisodeChange(1);
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

          {/* Episode List */}
          <div className="space-y-2">
            <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
              Episodes <span className="text-white font-bold">({episodeCount})</span>
            </h4>
            {episodesLoading ? (
              <div className="flex items-center gap-2 py-4 text-gray-400 text-sm">
                <Loader2 className="w-4 h-4 animate-spin" />
                Loading episodes...
              </div>
            ) : (
              <ScrollArea className="max-h-72">
                <div className="space-y-1.5 pr-2">
                  {fallbackEpisodes.map((ep: any) => {
                    const isSelected = selectedEpisode === ep.episode_number;
                    const watched = isEpisodeWatched(selectedSeason, ep.episode_number);

                    return (
                      <button
                        key={ep.episode_number}
                        onClick={() => onEpisodeChange(ep.episode_number)}
                        className={cn(
                          "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left transition-all",
                          "border focus:outline-none focus:ring-2 focus:ring-netflix-red/50",
                          isSelected
                            ? "bg-netflix-red/15 border-netflix-red text-white"
                            : "bg-gray-800/40 border-gray-800 text-gray-300 hover:bg-gray-800 hover:text-white hover:border-gray-700"
                        )}
                      >
                        {/* Episode number */}
                        <span className={cn(
                          "flex-shrink-0 w-8 h-8 rounded-md flex items-center justify-center text-xs font-bold",
                          isSelected
                            ? "bg-netflix-red text-white"
                            : watched
                              ? "bg-green-600/20 text-green-400 border border-green-600/30"
                              : "bg-gray-700/50 text-gray-400"
                        )}>
                          {watched && !isSelected ? <Check className="w-3.5 h-3.5" /> : ep.episode_number}
                        </span>

                        {/* Episode info */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <span className={cn(
                              "text-sm font-medium truncate",
                              isSelected ? "text-white" : "text-gray-200"
                            )}>
                              {ep.name || `Episode ${ep.episode_number}`}
                            </span>
                          </div>
                          {ep.overview && (
                            <p className="text-xs text-gray-500 truncate mt-0.5">
                              {ep.overview}
                            </p>
                          )}
                          <div className="flex items-center gap-2 mt-0.5">
                            {ep.runtime && (
                              <span className="text-xs text-gray-500">{ep.runtime}m</span>
                            )}
                            {ep.vote_average > 0 && (
                              <span className="text-xs text-yellow-500">★ {ep.vote_average.toFixed(1)}</span>
                            )}
                          </div>
                        </div>

                        {/* Status indicators */}
                        <div className="flex-shrink-0 flex items-center gap-1.5">
                          {watched && (
                            <span className="text-xs text-green-400 flex items-center gap-1">
                              <Eye className="w-3 h-3" />
                              Watched
                            </span>
                          )}
                          {isSelected && (
                            <Play className="w-4 h-4 text-netflix-red fill-netflix-red" />
                          )}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </ScrollArea>
            )}
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
            {currentProgress?.currentEpisode && (
              <Button
                size="sm"
                variant="ghost"
                onClick={() => {
                  if (currentProgress.currentSeason) onSeasonChange(currentProgress.currentSeason);
                  onEpisodeChange(currentProgress.currentEpisode!);
                }}
                className="text-xs text-netflix-red hover:text-netflix-red/80"
              >
                Resume S{currentProgress.currentSeason}E{currentProgress.currentEpisode}
              </Button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
