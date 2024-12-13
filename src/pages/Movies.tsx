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
    <main className="container space-y-8 py-4 md:space-y-12 md:py-8 mt-[80px]"> {/* Added margin-top */}
      <section className="space-y-4 md:space-y-6">
        <h2 className="text-2xl font-bold text-white md:text-3xl">Trending Movies</h2>
        {trendingLoading ? (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 md:gap-4">
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

      <section className="space-y-4 md:space-y-6">
        <h2 className="text-2xl font-bold text-white md:text-3xl">Top Rated Movies</h2>
        {topRatedLoading ? (
          <div className="animate-pulse rounded-lg bg-gray-800 h-[200px] md:h-[300px]" />
        ) : (
          <MovieCarousel items={topRatedMovies?.results || []} />
        )}
      </section>
    </main>
  );
};

export default Movies;
