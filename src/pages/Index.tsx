import { useQuery } from '@tanstack/react-query';
import { getTrending, getTopRated, getMoviesByGenre } from '@/services/tmdb';
import { MovieCarousel } from '@/components/MovieCarousel';
import { HeroSlider } from '@/components/hero/HeroSlider';
import { TrendingSlider } from '@/components/TrendingSlider';
import { GenreCarousel } from '@/components/GenreCarousel';
import { IndianSection } from '@/components/IndianSection';

const FEATURED_GENRES = [
  { id: 28, name: 'Action' },
  { id: 35, name: 'Comedy' },
  { id: 18, name: 'Drama' },
];

const Index = () => {
  const { data: trendingAll, isLoading: trendingLoading } = useQuery({
    queryKey: ['trending', 'all', 'week'],
    queryFn: () => getTrending('all', 'week'),
  });

  const { data: topRated, isLoading: topRatedLoading } = useQuery({
    queryKey: ['movies', 'top-rated'],
    queryFn: () => getTopRated(),
  });

  const genreQueries = FEATURED_GENRES.map(genre => ({
    ...useQuery({
      queryKey: ['movies', 'genre', genre.id],
      queryFn: () => getMoviesByGenre(genre.id),
    }),
    name: genre.name,
  }));

  return (
    <div className="min-h-screen bg-netflix-black text-white">
      <div className="-mt-16 mb-8">
        {!trendingLoading && trendingAll?.results && (
          <HeroSlider items={trendingAll.results.slice(0, 5)} />
        )}
      </div>
      
      <main className="container space-y-8 py-4">
        <section>
          <h2 className="text-2xl font-bold mb-4">Genres</h2>
          <GenreCarousel />
        </section>

        <section>
          <h2 className="text-2xl font-bold mb-4">Trending Now</h2>
          <TrendingSlider />
        </section>

        <IndianSection />

        <section>
          <h2 className="text-2xl font-bold mb-4">Top Rated</h2>
          {topRatedLoading ? (
            <div className="animate-pulse rounded-lg bg-gray-800 h-[300px]" />
          ) : (
            <MovieCarousel items={topRated?.results || []} />
          )}
        </section>

        {genreQueries.map((query, index) => (
          <section key={index}>
            <h2 className="text-2xl font-bold mb-4">{query.name} Movies</h2>
            {query.isLoading ? (
              <div className="animate-pulse rounded-lg bg-gray-800 h-[300px]" />
            ) : (
              <MovieCarousel items={query.data?.results || []} />
            )}
          </section>
        ))}
      </main>
    </div>
  );
};

export default Index;