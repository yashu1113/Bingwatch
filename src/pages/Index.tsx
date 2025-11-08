
import { useQuery } from '@tanstack/react-query';
import { getTrending, getTopRated, getMoviesByGenre, getIndianContent } from '@/services/tmdb';
import { MovieCarousel } from '@/components/MovieCarousel';
import { NewHeroSlider } from '@/components/NewHeroSlider';
import { TrendingSlider } from '@/components/TrendingSlider';
import { GenreCarousel } from '@/components/GenreCarousel';
import { IndianSection } from '@/components/IndianSection';
import { UpcomingMovies } from '@/components/UpcomingMovies';
import { WatchlistRecommendations } from '@/components/WatchlistRecommendations';
import { ContinueWatchingSection } from '@/components/ContinueWatchingSection';

const FEATURED_GENRES = [
  { id: 28, name: 'Action' },
  { id: 35, name: 'Comedy' },
  { id: 18, name: 'Drama' },
];

const Index = () => {
  const { data: indianContent, isLoading: indianLoading } = useQuery({
    queryKey: ['indian-content', 'movie', 1],
    queryFn: () => getIndianContent('movie', 1),
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
        {!indianLoading && indianContent?.results && (
          <NewHeroSlider items={indianContent.results.slice(0, 5)} />
        )}
        <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-[#141414] to-transparent" />
      </div>
      
      <main className="container space-y-12 py-8">
        {/* Continue Watching Section */}
        <ContinueWatchingSection />

        {/* Trending Section */}
        <section className="space-y-4">
          <div className="flex items-center gap-3">
            <h2 className="text-2xl md:text-3xl font-bold text-white">Trending Now</h2>
            <div className="h-1 w-16 bg-netflix-red rounded-full" />
          </div>
          <TrendingSlider />
        </section>

        {/* Indian Content Section */}
        <IndianSection />

        {/* Upcoming Indian Movies */}
        <UpcomingMovies />

        {/* Genres Section */}
        <section className="space-y-4">
          <div className="flex items-center gap-3">
            <h2 className="text-2xl md:text-3xl font-bold text-white">Browse by Genre</h2>
            <div className="h-1 w-16 bg-netflix-red rounded-full" />
          </div>
          <GenreCarousel />
        </section>

        {/* Top Rated Section */}
        <section className="space-y-4">
          <div className="flex items-center gap-3">
            <h2 className="text-2xl md:text-3xl font-bold text-white">Top Rated</h2>
            <div className="h-1 w-16 bg-netflix-red rounded-full" />
          </div>
          {topRatedLoading ? (
            <div className="animate-pulse rounded-lg bg-gray-800/50 h-[300px]" />
          ) : (
            <MovieCarousel items={topRated?.results || []} />
          )}
        </section>

        {/* Genre-based Sections */}
        {genreQueries.map((query, index) => (
          <section key={index} className="space-y-4">
            <div className="flex items-center gap-3">
              <h2 className="text-2xl md:text-3xl font-bold text-white">{query.name} Movies</h2>
              <div className="h-1 w-16 bg-netflix-red rounded-full" />
            </div>
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
