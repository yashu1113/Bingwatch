
import { useQuery } from '@tanstack/react-query';
import { getTrending, getTopRated, getTVShowsByGenre, getIndianContent } from '@/services/tmdb';
import { MovieCarousel } from '@/components/MovieCarousel';
import { memo } from 'react';

// Genre IDs for specific genres we want to showcase
const FEATURED_TV_GENRES = [
  { id: 80, name: "Crime" },
  { id: 18, name: "Drama" },
  { id: 35, name: "Comedy" },
  { id: 10765, name: "Fantasy" }
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
  const { data: genreShows, isLoading } = useQuery({
    queryKey: ['tv', 'genre', genreId, 'indian'],
    queryFn: () => getTVShowsByGenre(genreId, 'IN'),
    staleTime: 1000 * 60 * 30, // 30 minutes
    gcTime: 1000 * 60 * 60, // 1 hour
  });

  return (
    <section className="space-y-4 md:space-y-6">
      <h2 className="text-2xl font-bold bg-gradient-to-r from-red-600 to-red-400 bg-clip-text text-transparent md:text-3xl">
        {genreName} Web Series
      </h2>
      <MovieCarousel items={genreShows?.results.map(show => ({
        ...show,
        media_type: 'tv'
      })) || []} isLoading={isLoading} />
    </section>
  );
});

const TVShows = () => {
  const { data: indianTV, isLoading: indianTVLoading } = useQuery({
    queryKey: ['indian-content', 'tv', 1],
    queryFn: () => getIndianContent('tv', 1),
  });

  const { data: topRatedIndianTV, isLoading: topRatedIndianTVLoading } = useQuery({
    queryKey: ['tv', 'top-rated', 'indian'],
    queryFn: () => getTopRated('tv', 'IN'),
  });

  return (
    <main className="container space-y-12 py-8 mt-[80px] bg-netflix-black/95 backdrop-blur-lg shadow-lg bg-gradient-to-b from-black/80 to-transparent">
      <section className="space-y-6">
        <h2 className="text-3xl font-bold bg-gradient-to-r from-red-600 to-red-400 bg-clip-text text-transparent">
          Trending Indian Web Series
        </h2>
        {indianTVLoading ? (
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
            items={indianTV?.results.map(show => ({
              ...show,
              media_type: 'tv'
            })) || []} 
          />
        )}
      </section>

      <section className="space-y-6">
        <h2 className="text-3xl font-bold bg-gradient-to-r from-red-600 to-red-400 bg-clip-text text-transparent">
          Top Rated Indian Web Series
        </h2>
        {topRatedIndianTVLoading ? (
          <div className="animate-pulse rounded-lg bg-gray-800 h-[300px]" />
        ) : (
          <MovieCarousel 
            items={topRatedIndianTV?.results.map(show => ({
              ...show,
              media_type: 'tv'
            })) || []} 
          />
        )}
      </section>

      {FEATURED_TV_GENRES.map((genre) => (
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

export default TVShows;
