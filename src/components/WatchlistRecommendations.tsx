
import { useWatchlist } from '@/contexts/WatchlistContext';
import { MovieCarousel } from './MovieCarousel';
import { useQuery } from '@tanstack/react-query';
import { getRecommendations } from '@/services/tmdb';

export const WatchlistRecommendations = () => {
  const { watchlist } = useWatchlist();

  const { data: recommendations, isLoading } = useQuery({
    queryKey: ['watchlist-recommendations', watchlist[0]?.id],
    queryFn: () => getRecommendations(watchlist[0]?.id, watchlist[0]?.mediaType),
    enabled: watchlist.length > 0,
  });

  if (watchlist.length === 0 || !recommendations?.results?.length) {
    return null;
  }

  return (
    <section className="space-y-6">
      <h2 className="text-3xl font-bold">Based on Your Watchlist</h2>
      {isLoading ? (
        <div className="animate-pulse rounded-lg bg-gray-800 h-[300px]" />
      ) : (
        <MovieCarousel 
          items={recommendations.results.map(item => ({
            ...item,
            media_type: watchlist[0]?.mediaType
          }))} 
        />
      )}
    </section>
  );
};
