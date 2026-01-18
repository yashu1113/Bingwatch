import { useState, useEffect, useCallback } from 'react';
import { useWatchlist } from '@/contexts/WatchlistContext';
import { useContinueWatching } from '@/contexts/ContinueWatchingContext';
import { supabase } from '@/integrations/supabase/client';
import { Sparkles, Loader2, RefreshCw, Film, Tv, Star, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { useLocalStorage } from '@/hooks/use-local-storage';

interface Recommendation {
  title: string;
  type: 'movie' | 'tv';
  year: number;
  reason: string;
  matchScore: number;
}

interface AIResponse {
  recommendations: Recommendation[];
  summary: string;
  error?: string;
}

export const AIRecommendations = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [recommendations, setRecommendations] = useState<AIResponse | null>(null);
  const [mood, setMood] = useState('');
  const { watchlist } = useWatchlist();
  const { watchProgress } = useContinueWatching();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [searchHistory] = useLocalStorage<string[]>('search-history', []);
  const [hasAutoFetched, setHasAutoFetched] = useState(false);

  const moods = [
    { label: 'Action-packed', emoji: '💥' },
    { label: 'Feel-good', emoji: '😊' },
    { label: 'Mind-bending', emoji: '🧠' },
    { label: 'Scary', emoji: '👻' },
    { label: 'Romantic', emoji: '💕' },
    { label: 'Funny', emoji: '😂' },
  ];

  const getRecommendations = useCallback(async (isAutoFetch = false) => {
    // Build context from available data
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
          searchHistory: searchHistory.slice(0, 10), // Last 10 searches
          mood: mood || undefined,
          isNewUser: !hasWatchlist && !hasWatchProgress && !hasSearchHistory,
        },
      });

      if (error) throw error;

      setRecommendations(data);
      if (data.error && !isAutoFetch) {
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

  // Auto-fetch recommendations on mount
  useEffect(() => {
    if (!hasAutoFetched && !recommendations) {
      setHasAutoFetched(true);
      getRecommendations(true);
    }
  }, [hasAutoFetched, recommendations, getRecommendations]);

  const searchTitle = (title: string, type: 'movie' | 'tv') => {
    navigate(`/search?q=${encodeURIComponent(title)}`);
  };

  return (
    <section className="py-8 md:py-12">
      <div className="container px-4 md:px-8">
        <div className="flex items-center gap-3 mb-6">
          <Sparkles className="w-7 h-7 text-yellow-400" />
          <h2 className="text-2xl md:text-3xl font-bold">AI Picks For You</h2>
        </div>

        {/* Mood Selection */}
        <div className="mb-6">
          <p className="text-sm text-white/60 mb-3">What are you in the mood for?</p>
          <div className="flex flex-wrap gap-2">
            {moods.map(({ label, emoji }) => (
              <button
                key={label}
                onClick={() => setMood(mood === label ? '' : label)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-all
                  ${mood === label 
                    ? 'bg-netflix-red text-white scale-105' 
                    : 'bg-white/10 text-white/80 hover:bg-white/20'
                  }`}
              >
                {emoji} {label}
              </button>
            ))}
          </div>
        </div>

        {/* Get Recommendations Button */}
        <Button
          onClick={() => getRecommendations(false)}
          disabled={isLoading}
          className="mb-8 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 
            text-white font-semibold px-6 py-3 rounded-xl shadow-lg 
            hover:shadow-purple-500/25 transition-all duration-300"
        >
          {isLoading ? (
            <>
              <Loader2 className="w-5 h-5 mr-2 animate-spin" />
              Analyzing your taste...
            </>
          ) : recommendations ? (
            <>
              <RefreshCw className="w-5 h-5 mr-2" />
              Get New Picks
            </>
          ) : (
            <>
              <Sparkles className="w-5 h-5 mr-2" />
              Get AI Recommendations
            </>
          )}
        </Button>

        {/* Results */}
        {recommendations && !recommendations.error && (
          <div className="space-y-6">
            {/* Summary */}
            {recommendations.summary && (
              <div className="p-4 rounded-xl bg-gradient-to-r from-purple-900/30 to-pink-900/30 border border-purple-500/20">
                <p className="text-white/90 italic">{recommendations.summary}</p>
              </div>
            )}

            {/* Recommendation Cards */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {recommendations.recommendations?.map((rec, index) => (
                <div
                  key={index}
                  className="group p-5 rounded-xl bg-white/5 border border-white/10 
                    hover:bg-white/10 hover:border-purple-500/30 
                    transition-all duration-300 cursor-pointer"
                  onClick={() => searchTitle(rec.title, rec.type)}
                >
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div className="flex items-center gap-2">
                      {rec.type === 'movie' ? (
                        <Film className="w-5 h-5 text-blue-400" />
                      ) : (
                        <Tv className="w-5 h-5 text-green-400" />
                      )}
                      <span className="text-xs uppercase text-white/50 font-medium">
                        {rec.type}
                      </span>
                    </div>
                    <div className="flex items-center gap-1 px-2 py-1 rounded-full bg-yellow-500/20 text-yellow-400 text-xs font-semibold">
                      <Star className="w-3 h-3 fill-current" />
                      {rec.matchScore}% match
                    </div>
                  </div>

                  <h3 className="text-lg font-semibold mb-1 group-hover:text-purple-300 transition-colors">
                    {rec.title}
                    <span className="text-white/40 text-sm ml-2">({rec.year})</span>
                  </h3>

                  <p className="text-sm text-white/60 line-clamp-2">
                    {rec.reason}
                  </p>

                  <div className="mt-3 flex items-center gap-1 text-xs text-purple-400 opacity-0 group-hover:opacity-100 transition-opacity">
                    <ExternalLink className="w-3 h-3" />
                    Click to search
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Loading State - always show something */}
        {isLoading && !recommendations && (
          <div className="text-center py-12">
            <Loader2 className="w-12 h-12 mx-auto mb-4 animate-spin text-purple-400" />
            <p className="text-white/70">Analyzing trending content and your preferences...</p>
          </div>
        )}
      </div>
    </section>
  );
};
