
import { useQuery } from '@tanstack/react-query';
import { getTrending, getTopRated, getMoviesByGenre, getIndianContent } from '@/services/tmdb';
import { MovieCarousel } from '@/components/MovieCarousel';
import { GenreCarousel } from '@/components/GenreCarousel';
import { memo } from 'react';

// Genre IDs for specific genres we want to showcase
const FEATURED_GENRES = [
  { id: 53, name: "Thriller" },
  { id: 28, name: "Action" },
  { id: 35, name: "Comedy" },
  { id: 10749, name: "Romance" }
];

// Languages for Indian content
const INDIAN_LANGUAGES = [
  { code: 'hi', name: 'Hindi' },
  { code: 'ta', name: 'Tamil' },
  { code: 'te', name: 'Telugu' },
  { code: 'ml', name: 'Malayalam' },
  { code: 'bn', name: 'Bengali' }
];

const GenreSection = memo(({ genreId, genreName }: { genreId: number; genreName: string }) => {
  const { data: genreMovies, isLoading } = useQuery({
    queryKey: ['movies', 'genre', genreId, 'indian'],
    queryFn: () => getMoviesByGenre(genreId, 'IN'),
    staleTime: 1000 * 60 * 30, // 30 minutes
    gcTime: 1000 * 60 * 60, // 1 hour
  });

  return (
    <section className="space-y-4 md:space-y-6">
      <h2 className="text-2xl font-bold bg-gradient-to-r from-red-600 to-red-400 bg-clip-text text-transparent md:text-3xl">
        {genreName} Movies
      </h2>
      <MovieCarousel items={genreMovies?.results.map(movie => ({
        ...movie,
        media_type: 'movie'
      })) || []} isLoading={isLoading} />
    </section>
  );
});

const Movies = () => {
  const { data: indianTrending, isLoading: indianTrendingLoading } = useQuery({
    queryKey: ['indian-content', 'movie', 1],
    queryFn: () => getIndianContent('movie', 1),
  });

  const { data: topRatedIndian, isLoading: topRatedIndianLoading } = useQuery({
    queryKey: ['movies', 'top-rated', 'indian'],
    queryFn: () => getTopRated('movie', 'IN'),
  });

  return (
    <main className="container space-y-8 py-4 md:space-y-12 md:py-8 mt-[80px]">
      <section className="space-y-4 md:space-y-6">
        <h2 className="text-2xl font-bold bg-gradient-to-r from-red-600 to-red-400 bg-clip-text text-transparent md:text-3xl">
          Trending Indian Movies
        </h2>
        {indianTrendingLoading ? (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 md:gap-4">
            {Array.from({ length: 10 }).map((_, i) => (
              <div
                key={i}
                className="aspect-[2/3] animate-pulse rounded-lg bg-gray-800"
              />
            ))}
          </div>
        ) : (
          <MovieCarousel items={indianTrending?.results.map(item => ({
            ...item,
            media_type: 'movie'
          })) || []} />
        )}
      </section>

      <section className="space-y-4 md:space-y-6">
        <h2 className="text-2xl font-bold bg-gradient-to-r from-red-600 to-red-400 bg-clip-text text-transparent md:text-3xl">
          Top Rated Indian Movies
        </h2>
        {topRatedIndianLoading ? (
          <div className="animate-pulse rounded-lg bg-gray-800 h-[200px] md:h-[300px]" />
        ) : (
          <MovieCarousel items={topRatedIndian?.results.map(item => ({
            ...item,
            media_type: 'movie'
          })) || []} />
        )}
      </section>

      {FEATURED_GENRES.map((genre) => (
        <GenreSection key={genre.id} genreId={genre.id} genreName={genre.name} />
      ))}

      <section className="space-y-6 mb-8 pb-8 border-b border-gray-800">
        <h2 className="text-3xl font-bold bg-gradient-to-r from-red-600 to-red-400 bg-clip-text text-transparent">
          Browse by Indian Languages
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
          {INDIAN_LANGUAGES.map(language => (
            <div 
              key={language.code}
              className="relative rounded-lg overflow-hidden h-24 md:h-36 bg-gradient-to-r from-red-800/60 to-red-600/60 cursor-pointer hover:scale-105 transition-transform duration-300 group"
            >
              <div className="absolute inset-0 flex items-center justify-center">
                <h3 className="text-xl md:text-2xl font-bold text-white group-hover:scale-110 transition-transform duration-300">
                  {language.name}
                </h3>
              </div>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
};

export default Movies;
