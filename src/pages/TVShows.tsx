import { useQuery } from '@tanstack/react-query';
import { getTrending, getTopRated } from '@/services/tmdb';
import { MovieCarousel } from '@/components/MovieCarousel';

const TVShows = () => {
  const { data: trendingTV, isLoading: trendingLoading } = useQuery({
    queryKey: ['trending', 'tv', 'week'],
    queryFn: () => getTrending('tv', 'week'),
  });

  const { data: topRatedTV, isLoading: topRatedLoading } = useQuery({
    queryKey: ['tv', 'top-rated'],
    queryFn: () => getTopRated('tv'),
  });

  return (
    <main className="container space-y-12 py-8 mt-[80px] "> {/* Added bg-gray-800 for background color */}

      <section className="space-y-6">
        <h2 className="text-3xl font-bold text-white">Trending TV Shows</h2>
        {trendingLoading ? (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
            {Array.from({ length: 10 }).map((_, i) => (
              <div
                key={i}
                className="aspect-[2/3] animate-pulse rounded-lg bg-gray-800"
              />
            ))}
          </div>
        ) : (
          <MovieCarousel 
            items={trendingTV?.results.map(show => ({
              ...show,
              media_type: 'tv'
            })) || []} 
          />
        )}
      </section>

      <section className="space-y-6">
        <h2 className="text-3xl font-bold text-white">Top Rated TV Shows</h2>
        {topRatedLoading ? (
          <div className="animate-pulse rounded-lg bg-gray-800 h-[300px]" />
        ) : (
          <MovieCarousel 
            items={topRatedTV?.results.map(show => ({
              ...show,
              media_type: 'tv'
            })) || []} 
          />
        )}
      </section>
    </main>
  );
};

export default TVShows;
