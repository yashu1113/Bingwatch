import { useQuery } from '@tanstack/react-query';
import { getTrending, getTopRated } from '@/services/tmdb';
import { MovieCarousel } from '@/components/MovieCarousel';

const Movies = () => {
  const { data: trendingMovies, isLoading: trendingLoading } = useQuery({
    queryKey: ['trending', 'movie', 'week'],
    queryFn: () => getTrending('movie', 'week'),
  });

  const { data: topRatedMovies, isLoading: topRatedLoading } = useQuery({
    queryKey: ['movies', 'top-rated'],
    queryFn: () => getTopRated('movie'),
  });

  return (
    <main className="container space-y-12 py-8">
      <section className="space-y-6">
        <h2 className="text-3xl font-bold text-white">Trending Movies</h2>
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
          <MovieCarousel items={trendingMovies?.results || []} />
        )}
      </section>

      <section className="space-y-6">
        <h2 className="text-3xl font-bold text-white">Top Rated Movies</h2>
        {topRatedLoading ? (
          <div className="animate-pulse rounded-lg bg-gray-800 h-[300px]" />
        ) : (
          <MovieCarousel items={topRatedMovies?.results || []} />
        )}
      </section>
    </main>
  );
};

export default Movies;