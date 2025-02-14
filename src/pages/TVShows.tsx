
import { useQuery } from '@tanstack/react-query';
import { getTrending, getTopRated, getTVShowsByGenre } from '@/services/tmdb';
import { MovieCarousel } from '@/components/MovieCarousel';
import { memo } from 'react';

// Genre IDs for specific genres we want to showcase
const FEATURED_TV_GENRES = [
  { id: 80, name: "Crime" },
  { id: 18, name: "Drama" },
  { id: 35, name: "Comedy" },
  { id: 99, name: "Documentary" },
  { id: 10765, name: "Sci-Fi & Fantasy" }
];

const GenreSection = memo(({ genreId, genreName }: { genreId: number; genreName: string }) => {
  const { data: genreShows, isLoading } = useQuery({
    queryKey: ['tv', 'genre', genreId],
    queryFn: () => getTVShowsByGenre(genreId),
    staleTime: 1000 * 60 * 30, // 30 minutes
    gcTime: 1000 * 60 * 60, // 1 hour
  });

  return (
    <section className="space-y-4 md:space-y-6">
      <h2 className="text-2xl font-bold text-white md:text-3xl">Top {genreName} TV Shows</h2>
      <MovieCarousel items={genreShows?.results.map(show => ({
        ...show,
        media_type: 'tv'
      })) || []} isLoading={isLoading} />
    </section>
  );
});

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
    <main className="container space-y-12 py-8 mt-[80px] bg-netflix-black/95 backdrop-blur-lg shadow-lg bg-gradient-to-b from-black/80 to-transparent">
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

      {FEATURED_TV_GENRES.map((genre) => (
        <GenreSection key={genre.id} genreId={genre.id} genreName={genre.name} />
      ))}
    </main>
  );
};

export default TVShows;
