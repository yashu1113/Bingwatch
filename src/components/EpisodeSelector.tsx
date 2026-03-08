import { useState, useRef, useEffect, useCallback } from 'react';
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
  onPlay: (episode?: number) => void;
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
  const selectedRef = useRef<HTMLButtonElement>(null);
  const hasScrolled = useRef(false);

  // Auto-scroll to selected episode when panel opens or season changes
  useEffect(() => {
    if (isExpanded && selectedRef.current && !hasScrolled.current) {
      // Small delay to let ScrollArea render
      const timer = setTimeout(() => {
        selectedRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
        hasScrolled.current = true;
      }, 150);
      return () => clearTimeout(timer);
    }
    if (!isExpanded) hasScrolled.current = false;
  }, [isExpanded, selectedSeason]);

  const handleEpisodeChange = useCallback((epNum: number) => {
    onEpisodeChange(epNum);
  }, [onEpisodeChange]);

  const currentSeason = seasons.find(s => s.season_number === selectedSeason);

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

  const currentProgress = tvId ? watchProgress.find(p => p.id === tvId) : null;
  const isEpisodeWatched = (seasonNum: number, epNum: number) => {
    if (!currentProgress) return false;
    if (!currentProgress.currentSeason || !currentProgress.currentEpisode) return false;
    if (seasonNum < currentProgress.currentSeason) return true;
    if (seasonNum === currentProgress.currentSeason && epNum < currentProgress.currentEpisode) return true;
    if (seasonNum === currentProgress.currentSeason && epNum === currentProgress.currentEpisode && currentProgress.progress > 80) return true;
    return false;
  };

  return (
    <div className="space-y-3">
      {/* Header */}
      <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
        <Button
          onClick={onPlay}
          size="sm"
          className="bg-netflix-red hover:bg-netflix-red/90 text-white font-semibold text-xs sm:text-sm"
        >
          <Play className="mr-1.5 h-3.5 w-3.5 sm:h-4 sm:w-4 fill-white" />
          Watch S{selectedSeason} E{selectedEpisode}
        </Button>

        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className={cn(
            "flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg transition-all text-xs sm:text-sm",
            "bg-gray-800/80 hover:bg-gray-700 text-white border border-gray-700",
            isExpanded && "border-netflix-red bg-gray-800"
          )}
        >
          <span className="font-medium">
            {currentSeason?.name || `Season ${selectedSeason}`}
          </span>
          <span className="text-gray-400 hidden sm:inline">• Ep {selectedEpisode}</span>
          {isExpanded ? (
            <ChevronUp className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-gray-400" />
          ) : (
            <ChevronDown className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-gray-400" />
          )}
        </button>
      </div>

      {/* Expandable Panel */}
      {isExpanded && (
        <div className="bg-gray-900/95 backdrop-blur-sm rounded-xl border border-gray-800 p-3 sm:p-4 space-y-3 sm:space-y-4 animate-fade-in">
          {/* Season Pills */}
          <div className="space-y-2">
            <h4 className="text-[10px] sm:text-xs font-semibold text-gray-400 uppercase tracking-wider">Season</h4>
            <ScrollArea className="w-full">
              <div className="flex gap-1.5 sm:gap-2 pb-1">
                {seasons.map((season) => (
                  <button
                    key={season.season_number}
                    onClick={() => {
                      onSeasonChange(season.season_number);
                      onEpisodeChange(1);
                    }}
                    className={cn(
                      "flex-shrink-0 px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg text-xs sm:text-sm font-medium transition-all",
                      "border focus:outline-none focus:ring-2 focus:ring-netflix-red/50",
                      selectedSeason === season.season_number
                        ? "bg-netflix-red text-white border-netflix-red"
                        : "bg-gray-800 text-gray-300 border-gray-700 hover:bg-gray-700 hover:text-white"
                    )}
                  >
                    S{season.season_number}
                    <span className="text-[10px] sm:text-xs opacity-70 ml-1">({season.episode_count})</span>
                  </button>
                ))}
              </div>
            </ScrollArea>
          </div>

          {/* Episode List */}
          <div className="space-y-2">
            <h4 className="text-[10px] sm:text-xs font-semibold text-gray-400 uppercase tracking-wider">
              Episodes <span className="text-white font-bold">({episodeCount})</span>
            </h4>
            {episodesLoading ? (
              <div className="flex items-center gap-2 py-6 justify-center text-gray-400 text-sm">
                <Loader2 className="w-5 h-5 animate-spin" />
                Loading episodes...
              </div>
            ) : (
              <div className="max-h-[400px] sm:max-h-[480px] overflow-y-auto overscroll-contain scroll-smooth" style={{ WebkitOverflowScrolling: 'touch' }}>
                <div className="space-y-2 pr-1">
                  {fallbackEpisodes.map((ep: any) => {
                    const isSelected = selectedEpisode === ep.episode_number;
                    const watched = isEpisodeWatched(selectedSeason, ep.episode_number);
                    const hasStill = !!ep.still_path;

                    return (
                      <button
                        key={ep.episode_number}
                        ref={isSelected ? selectedRef : undefined}
                        onClick={() => {
                          handleEpisodeChange(ep.episode_number);
                          // Small delay to let state update, then auto-play
                          setTimeout(() => onPlay(), 50);
                        }}
                        className={cn(
                          "w-full flex gap-2.5 sm:gap-3 rounded-lg text-left transition-all group/ep",
                          "border focus:outline-none focus:ring-2 focus:ring-netflix-red/50 overflow-hidden",
                          isSelected
                            ? "bg-netflix-red/10 border-netflix-red/60"
                            : "bg-gray-800/30 border-gray-800 hover:bg-gray-800/70 hover:border-gray-700"
                        )}
                      >
                        {/* Thumbnail */}
                        <div className="relative flex-shrink-0 w-24 h-16 sm:w-36 sm:h-20 md:w-44 md:h-24 bg-gray-800 overflow-hidden">
                          {hasStill ? (
                            <img
                              src={`https://image.tmdb.org/t/p/w300${ep.still_path}`}
                              alt={ep.name}
                              className="w-full h-full object-cover transition-transform duration-300 group-hover/ep:scale-105"
                              loading="lazy"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center bg-gray-800">
                              <Play className="w-5 h-5 sm:w-6 sm:h-6 text-gray-600" />
                            </div>
                          )}
                          {/* Episode number overlay */}
                          <div className={cn(
                            "absolute top-1 left-1 w-5 h-5 sm:w-6 sm:h-6 rounded flex items-center justify-center text-[10px] sm:text-xs font-bold",
                            isSelected
                              ? "bg-netflix-red text-white"
                              : watched
                                ? "bg-green-600 text-white"
                                : "bg-black/70 text-white"
                          )}>
                            {watched && !isSelected ? <Check className="w-3 h-3" /> : ep.episode_number}
                          </div>
                          {/* Play overlay on hover */}
                          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover/ep:opacity-100 transition-opacity flex items-center justify-center">
                            <Play className="w-6 h-6 sm:w-8 sm:h-8 text-white fill-white drop-shadow-lg" />
                          </div>
                          {/* Watched overlay */}
                          {watched && (
                            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-green-500" />
                          )}
                        </div>

                        {/* Episode Info */}
                        <div className="flex-1 min-w-0 py-1.5 sm:py-2 pr-2 sm:pr-3 flex flex-col justify-center">
                          <div className="flex items-start justify-between gap-1.5">
                            <h5 className={cn(
                              "text-xs sm:text-sm font-medium leading-tight line-clamp-1",
                              isSelected ? "text-white" : "text-gray-200"
                            )}>
                              {ep.name || `Episode ${ep.episode_number}`}
                            </h5>
                            <div className="flex items-center gap-1 flex-shrink-0">
                              {watched && (
                                <Eye className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-green-400" />
                              )}
                              {isSelected && (
                                <Play className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-netflix-red fill-netflix-red" />
                              )}
                            </div>
                          </div>

                          {/* Meta row */}
                          <div className="flex items-center gap-1.5 sm:gap-2 mt-0.5">
                            {ep.runtime && (
                              <span className="text-[10px] sm:text-xs text-gray-500">{ep.runtime}m</span>
                            )}
                            {ep.vote_average > 0 && (
                              <span className="text-[10px] sm:text-xs text-yellow-500">★ {ep.vote_average.toFixed(1)}</span>
                            )}
                            {ep.air_date && (
                              <span className="text-[10px] sm:text-xs text-gray-600 hidden sm:inline">
                                {new Date(ep.air_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                              </span>
                            )}
                            {watched && (
                              <span className="text-[10px] sm:text-xs text-green-500 font-medium hidden sm:inline">Watched</span>
                            )}
                          </div>

                          {/* Synopsis */}
                          {ep.overview && (
                            <p className="text-[10px] sm:text-xs text-gray-500 line-clamp-1 sm:line-clamp-2 mt-0.5 sm:mt-1 leading-relaxed">
                              {ep.overview}
                            </p>
                          )}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Quick Actions */}
          <div className="flex items-center gap-1 sm:gap-2 pt-2 border-t border-gray-800 flex-wrap">
            <Button
              size="sm"
              variant="ghost"
              onClick={() => onEpisodeChange(1)}
              className="text-[10px] sm:text-xs text-gray-400 hover:text-white h-7 sm:h-8 px-2 sm:px-3"
            >
              First Episode
            </Button>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => onEpisodeChange(episodeCount)}
              className="text-[10px] sm:text-xs text-gray-400 hover:text-white h-7 sm:h-8 px-2 sm:px-3"
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
                className="text-[10px] sm:text-xs text-netflix-red hover:text-netflix-red/80 h-7 sm:h-8 px-2 sm:px-3"
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
