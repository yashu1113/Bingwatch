
import { useQuery } from '@tanstack/react-query';
import { getTrending, getTopRated, getMoviesByGenre } from '@/services/tmdb';
import { MovieCarousel } from '@/components/MovieCarousel';
import { HeroSlider } from '@/components/HeroSlider';
import { TrendingSlider } from '@/components/TrendingSlider';
import { GenreCarousel } from '@/components/GenreCarousel';
import { IndianSection } from '@/components/IndianSection';
import { UpcomingMovies } from '@/components/UpcomingMovies';
import { HighlightsSection } from '@/components/HighlightsSection';
import { WatchlistRecommendations } from '@/components/WatchlistRecommendations';

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
      <div className="-mt-16">
        {!trendingLoading && trendingAll?.results && (
          <HeroSlider items={trendingAll.results.slice(0, 5)} />
        )}
      </div>
      
      <main className="container space-y-12 py-8">
        <HighlightsSection />

        <section className="space-y-6">
          <h2 className="text-3xl font-bold">Genres</h2>
          <GenreCarousel />
        </section>

        <section className="space-y-6">
          <h2 className="text-3xl font-bold">Top 10 in India Today - Hindi</h2>
          <TrendingSlider />
        </section>

        <UpcomingMovies />

        <IndianSection />

        <section className="space-y-6">
          <h2 className="text-3xl font-bold">Top Rated</h2>
          {topRatedLoading ? (
            <div className="animate-pulse rounded-lg bg-gray-800 h-[300px]" />
          ) : (
            <MovieCarousel items={topRated?.results || []} />
          )}
        </section>

        {genreQueries.map((query, index) => (
          <section key={index} className="space-y-6">
            <h2 className="text-3xl font-bold">{query.name} Movies</h2>
            {query.isLoading ? (
              <div className="animate-pulse rounded-lg bg-gray-800 h-[300px]" />
            ) : (
              <MovieCarousel items={query.data?.results || []} />
            )}
          </section>
        ))}

        <WatchlistRecommendations />
      </main>
    </div>
  );
};

export default Index;
