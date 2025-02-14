
import { useQuery } from '@tanstack/react-query';
import { getTrending, getTopRated, getMoviesByGenre } from '@/services/tmdb';
import { MovieCarousel } from '@/components/MovieCarousel';
import { GenreCarousel } from '@/components/GenreCarousel';
import { memo } from 'react';

// Genre IDs for specific genres we want to showcase
const FEATURED_GENRES = [
  { id: 53, name: "Thriller" },
  { id: 28, name: "Action" },
  { id: 35, name: "Comedy" },
  { id: 27, name: "Horror" },
  { id: 10749, name: "Romance" }
];

const GenreSection = memo(({ genreId, genreName }: { genreId: number; genreName: string }) => {
  const { data: genreMovies, isLoading } = useQuery({
    queryKey: ['movies', 'genre', genreId],
    queryFn: () => getMoviesByGenre(genreId),
    staleTime: 1000 * 60 * 30, // 30 minutes
    gcTime: 1000 * 60 * 60, // 1 hour
  });

  return (
    <section className="space-y-4 md:space-y-6">
      <h2 className="text-2xl font-bold text-white md:text-3xl">Top {genreName} Movies</h2>
      <MovieCarousel items={genreMovies?.results.map(movie => ({
        ...movie,
        media_type: 'movie'
      })) || []} isLoading={isLoading} />
    </section>
  );
});

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
    <main className="container space-y-8 py-4 md:space-y-12 md:py-8 mt-[80px]">
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

      {FEATURED_GENRES.map((genre) => (
        <GenreSection key={genre.id} genreId={genre.id} genreName={genre.name} />
      ))}
    </main>
  );
};

export default Movies;
