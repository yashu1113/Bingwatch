
import { useQuery } from '@tanstack/react-query';
import { getTrending, getTopRated, getMoviesByGenre, getIndianContent } from '@/services/tmdb';
import { MovieCarousel } from '@/components/MovieCarousel';
import { HeroSlider } from '@/components/HeroSlider';
import { TrendingSlider } from '@/components/TrendingSlider';
import { GenreCarousel } from '@/components/GenreCarousel';
import { IndianSection } from '@/components/IndianSection';
import { UpcomingMovies } from '@/components/UpcomingMovies';
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
    <div className="min-h-screen bg-[#141414] text-white">
      <div className="-mt-16 relative">
        {!trendingLoading && trendingAll?.results && (
          <HeroSlider items={trendingAll.results.slice(0, 5)} />
        )}
        <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-[#141414] to-transparent" />
      </div>
      
      <main className="container space-y-12 py-8">
        {/* Indian Content Section - Moved to top */}
        <IndianSection />

        {/* Upcoming Indian Movies */}
        <UpcomingMovies />
        
        {/* Trending Section */}
        <section className="space-y-6">
          <h2 className="text-3xl font-bold text-gray-100">
            Trending Now
          </h2>
          <TrendingSlider />
        </section>

        {/* Genres Section */}
        <section className="space-y-6">
          <h2 className="text-3xl font-bold text-gray-100">
            Browse by Genre
          </h2>
          <GenreCarousel />
        </section>

        {/* Top Rated Section */}
        <section className="space-y-6">
          <h2 className="text-3xl font-bold text-gray-100">
            Top Rated
          </h2>
          {topRatedLoading ? (
            <div className="animate-pulse rounded-lg bg-gray-800/50 h-[300px]" />
          ) : (
            <MovieCarousel items={topRated?.results || []} />
          )}
        </section>

        {/* Genre-based Sections */}
        {genreQueries.map((query, index) => (
          <section key={index} className="space-y-6">
            <h2 className="text-3xl font-bold text-gray-100">
              {query.name} Movies
            </h2>
            {query.isLoading ? (
              <div className="animate-pulse rounded-lg bg-gray-800/50 h-[300px]" />
            ) : (
              <MovieCarousel items={query.data?.results || []} />
            )}
          </section>
        ))}

        {/* Watchlist Recommendations */}
        <WatchlistRecommendations />
      </main>
    </div>
  );
};

export default Index;
