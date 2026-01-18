import { useState, useEffect, useCallback } from 'react';
import { useWatchlist } from '@/contexts/WatchlistContext';
import { useContinueWatching } from '@/contexts/ContinueWatchingContext';
import { supabase } from '@/integrations/supabase/client';
import { Sparkles, Loader2, RefreshCw, Film, Tv, Star, Play, Info, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { useLocalStorage } from '@/hooks/use-local-storage';
import { search as tmdbSearch, getImageUrl } from '@/services/tmdb';
import { VideoPlayer } from '@/components/VideoPlayer';

interface Recommendation {
  title: string;
  type: 'movie' | 'tv';
  year: number;
  reason: string;
  matchScore: number;
}

interface EnhancedRecommendation extends Recommendation {
  tmdbId?: number;
  posterPath?: string;
  backdropPath?: string;
  voteAverage?: number;
  overview?: string;
}

interface AIResponse {
  recommendations: Recommendation[];
  summary: string;
  error?: string;
}

export const AIRecommendations = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [recommendations, setRecommendations] = useState<EnhancedRecommendation[]>([]);
  const [summary, setSummary] = useState('');
  const [mood, setMood] = useState('');
  const [showPlayer, setShowPlayer] = useState(false);
  const [selectedMedia, setSelectedMedia] = useState<{ id: number; type: 'movie' | 'tv'; title: string } | null>(null);
  const { watchlist } = useWatchlist();
  const { watchProgress } = useContinueWatching();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [searchHistory] = useLocalStorage<string[]>('search-history', []);
  const [hasAutoFetched, setHasAutoFetched] = useState(false);

  const moods = [
    { label: 'Action-packed', emoji: '💥', gradient: 'from-orange-500 to-red-600' },
    { label: 'Feel-good', emoji: '😊', gradient: 'from-yellow-400 to-orange-500' },
    { label: 'Mind-bending', emoji: '🧠', gradient: 'from-purple-500 to-indigo-600' },
    { label: 'Scary', emoji: '👻', gradient: 'from-gray-700 to-gray-900' },
    { label: 'Romantic', emoji: '💕', gradient: 'from-pink-500 to-rose-600' },
    { label: 'Funny', emoji: '😂', gradient: 'from-green-400 to-emerald-600' },
  ];

  const enrichWithTMDB = async (recs: Recommendation[]): Promise<EnhancedRecommendation[]> => {
    const enriched = await Promise.all(
      recs.map(async (rec): Promise<EnhancedRecommendation> => {
        try {
          const searchResult = await tmdbSearch(rec.title);
          const match = searchResult.results?.find(
            (item: any) => 
              (item.media_type === rec.type || item.media_type === (rec.type === 'movie' ? 'movie' : 'tv')) &&
              (item.title?.toLowerCase().includes(rec.title.toLowerCase()) || 
               item.name?.toLowerCase().includes(rec.title.toLowerCase()) ||
               rec.title.toLowerCase().includes(item.title?.toLowerCase() || '') ||
               rec.title.toLowerCase().includes(item.name?.toLowerCase() || ''))
          ) || searchResult.results?.[0];

          if (match) {
            return {
              ...rec,
              tmdbId: match.id,
              posterPath: match.poster_path,
              backdropPath: match.backdrop_path,
              voteAverage: match.vote_average,
              overview: match.overview,
              type: (match.media_type === 'tv' ? 'tv' : 'movie') as 'movie' | 'tv',
            };
          }
        } catch (error) {
          console.error(`Failed to enrich ${rec.title}:`, error);
        }
        return rec;
      })
    );
    return enriched;
  };

  const getRecommendations = useCallback(async (isAutoFetch = false) => {
    const hasWatchlist = watchlist.length > 0;
    const hasWatchProgress = watchProgress.length > 0;
    const hasSearchHistory = searchHistory.length > 0;

    setIsLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('ai-recommendations', {
        body: {
          watchlist: watchlist.map(item => ({
            id: item.id,
            title: item.title,
            media_type: item.mediaType,
          })),
          continueWatching: watchProgress.map(item => ({
            id: item.id,
            title: item.title,
            media_type: item.mediaType,
          })),
          searchHistory: searchHistory.slice(0, 10),
          mood: mood || undefined,
          isNewUser: !hasWatchlist && !hasWatchProgress && !hasSearchHistory,
        },
      });

      if (error) throw error;

      if (data?.recommendations?.length > 0) {
        const enriched = await enrichWithTMDB(data.recommendations);
        setRecommendations(enriched);
        setSummary(data.summary || '');
      }

      if (data?.error && !isAutoFetch) {
        toast({
          title: "Couldn't generate recommendations",
          description: data.error,
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Error getting AI recommendations:', error);
      if (!isAutoFetch) {
        toast({
          title: "Error",
          description: "Failed to get recommendations. Please try again.",
          variant: "destructive",
        });
      }
    } finally {
      setIsLoading(false);
    }
  }, [watchlist, watchProgress, searchHistory, mood, toast]);

  useEffect(() => {
    if (!hasAutoFetched) {
      setHasAutoFetched(true);
      getRecommendations(true);
    }
  }, [hasAutoFetched, getRecommendations]);

  const handlePlay = (rec: EnhancedRecommendation) => {
    if (rec.tmdbId) {
      setSelectedMedia({ id: rec.tmdbId, type: rec.type, title: rec.title });
      setShowPlayer(true);
    } else {
      navigate(`/search?q=${encodeURIComponent(rec.title)}`);
    }
  };

  const handleViewDetails = (rec: EnhancedRecommendation) => {
    if (rec.tmdbId) {
      navigate(`/${rec.type}/${rec.tmdbId}`);
    } else {
      navigate(`/search?q=${encodeURIComponent(rec.title)}`);
    }
  };

  return (
    <>
      <section className="py-10 md:py-16 relative overflow-hidden">
        {/* Background Gradient */}
        <div className="absolute inset-0 bg-gradient-to-b from-purple-950/20 via-transparent to-transparent pointer-events-none" />
        
        <div className="container px-4 md:px-8 relative z-10">
          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-gradient-to-br from-purple-500 to-pink-600 shadow-lg shadow-purple-500/30">
                <Sparkles className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-white to-white/70 bg-clip-text text-transparent">
                  AI Picks For You
                </h2>
                <p className="text-sm text-white/50">Personalized recommendations powered by AI</p>
              </div>
            </div>
            
            <Button
              onClick={() => getRecommendations(false)}
              disabled={isLoading}
              size="lg"
              className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 
                text-white font-semibold rounded-xl shadow-lg shadow-purple-500/25 
                transition-all duration-300 hover:scale-105 hover:shadow-purple-500/40"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  Analyzing...
                </>
              ) : (
                <>
                  <RefreshCw className="w-5 h-5 mr-2" />
                  Refresh Picks
                </>
              )}
            </Button>
          </div>

          {/* Mood Selection */}
          <div className="mb-8">
            <p className="text-sm text-white/60 mb-4 flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-purple-500" />
              What's your mood today?
            </p>
            <div className="flex flex-wrap gap-3">
              {moods.map(({ label, emoji, gradient }) => (
                <button
                  key={label}
                  onClick={() => {
                    setMood(mood === label ? '' : label);
                    if (mood !== label) {
                      setTimeout(() => getRecommendations(false), 100);
                    }
                  }}
                  className={`px-5 py-2.5 rounded-full text-sm font-medium transition-all duration-300
                    ${mood === label 
                      ? `bg-gradient-to-r ${gradient} text-white scale-105 shadow-lg` 
                      : 'bg-white/5 text-white/70 hover:bg-white/10 hover:text-white border border-white/10'
                    }`}
                >
                  <span className="mr-2">{emoji}</span>
                  {label}
                </button>
              ))}
            </div>
          </div>

          {/* Summary */}
          {summary && !isLoading && (
            <div className="mb-8 p-5 rounded-2xl bg-gradient-to-r from-purple-900/40 to-pink-900/40 
              border border-purple-500/20 backdrop-blur-sm">
              <p className="text-white/90 italic leading-relaxed">{summary}</p>
            </div>
          )}

          {/* Loading State */}
          {isLoading && (
            <div className="flex flex-col items-center justify-center py-16">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full blur-xl opacity-50 animate-pulse" />
                <Loader2 className="w-16 h-16 animate-spin text-purple-400 relative z-10" />
              </div>
              <p className="mt-6 text-white/70 text-lg">Analyzing your taste...</p>
              <p className="text-white/40 text-sm mt-1">Finding perfect matches for you</p>
            </div>
          )}

          {/* Recommendation Cards */}
          {!isLoading && recommendations.length > 0 && (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
              {recommendations.map((rec, index) => (
                <div
                  key={`${rec.title}-${index}`}
                  className="group relative rounded-xl overflow-hidden bg-gradient-to-b from-white/5 to-white/[0.02] 
                    border border-white/10 hover:border-purple-500/50 
                    transition-all duration-500 hover:scale-[1.02] hover:shadow-2xl hover:shadow-purple-500/20"
                >
                  {/* Poster */}
                  <div className="relative aspect-[2/3] overflow-hidden">
                    {rec.posterPath ? (
                      <img
                        src={getImageUrl(rec.posterPath, 'w500')}
                        alt={rec.title}
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                        loading="lazy"
                      />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-purple-900/50 to-pink-900/50 flex items-center justify-center">
                        {rec.type === 'movie' ? (
                          <Film className="w-16 h-16 text-white/20" />
                        ) : (
                          <Tv className="w-16 h-16 text-white/20" />
                        )}
                      </div>
                    )}
                    
                    {/* Gradient Overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent opacity-60 group-hover:opacity-80 transition-opacity" />
                    
                    {/* Match Score Badge */}
                    <div className="absolute top-3 right-3 px-3 py-1.5 rounded-full 
                      bg-gradient-to-r from-yellow-500/90 to-orange-500/90 backdrop-blur-sm
                      text-white text-xs font-bold shadow-lg flex items-center gap-1">
                      <Star className="w-3 h-3 fill-current" />
                      {rec.matchScore}%
                    </div>

                    {/* Type Badge */}
                    <div className="absolute top-3 left-3 px-2.5 py-1 rounded-md 
                      bg-black/60 backdrop-blur-sm text-white text-xs font-medium uppercase flex items-center gap-1">
                      {rec.type === 'movie' ? (
                        <Film className="w-3 h-3" />
                      ) : (
                        <Tv className="w-3 h-3" />
                      )}
                      {rec.type}
                    </div>

                    {/* Action Buttons - Appear on Hover */}
                    <div className="absolute inset-0 flex items-center justify-center gap-3 opacity-0 group-hover:opacity-100 transition-all duration-300">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handlePlay(rec);
                        }}
                        className="p-4 rounded-full bg-white text-black hover:scale-110 
                          transition-all duration-200 shadow-2xl"
                        title="Play Now"
                      >
                        <Play className="w-6 h-6 fill-current" />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleViewDetails(rec);
                        }}
                        className="p-3 rounded-full bg-white/20 backdrop-blur-sm text-white 
                          hover:bg-white/30 hover:scale-110 transition-all duration-200 border border-white/30"
                        title="More Info"
                      >
                        <Info className="w-5 h-5" />
                      </button>
                    </div>
                  </div>

                  {/* Content */}
                  <div className="p-4">
                    <h3 className="font-semibold text-white truncate group-hover:text-purple-300 transition-colors">
                      {rec.title}
                    </h3>
                    <div className="flex items-center gap-2 mt-1 text-sm text-white/50">
                      <span>{rec.year}</span>
                      {rec.voteAverage && rec.voteAverage > 0 && (
                        <>
                          <span>•</span>
                          <span className="flex items-center gap-1 text-yellow-400">
                            <Star className="w-3 h-3 fill-current" />
                            {rec.voteAverage.toFixed(1)}
                          </span>
                        </>
                      )}
                    </div>
                    <p className="mt-2 text-xs text-white/40 line-clamp-2">
                      {rec.reason}
                    </p>
                    
                    {/* View Details Link */}
                    <button
                      onClick={() => handleViewDetails(rec)}
                      className="mt-3 flex items-center gap-1 text-xs text-purple-400 hover:text-purple-300 
                        transition-colors group/link"
                    >
                      View Details
                      <ChevronRight className="w-3 h-3 group-hover/link:translate-x-0.5 transition-transform" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Empty State */}
          {!isLoading && recommendations.length === 0 && (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <div className="p-4 rounded-full bg-purple-500/10 mb-4">
                <Sparkles className="w-12 h-12 text-purple-400" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">Ready for Recommendations</h3>
              <p className="text-white/50 max-w-md">
                Click "Refresh Picks" to get personalized movie and TV show suggestions based on your preferences.
              </p>
            </div>
          )}
        </div>
      </section>

      {/* Video Player Modal */}
      {showPlayer && selectedMedia && (
        <VideoPlayer
          isOpen={showPlayer}
          onClose={() => {
            setShowPlayer(false);
            setSelectedMedia(null);
          }}
          mediaType={selectedMedia.type}
          tmdbId={selectedMedia.id}
          title={selectedMedia.title}
        />
      )}
    </>
  );
};
