import { useQuery } from '@tanstack/react-query';
import { getTrending, getTopRated, getMoviesByGenre } from '@/services/tmdb';
import { MovieCarousel } from '@/components/MovieCarousel';
import { HeroSlider } from '@/components/HeroSlider';
import { TrendingSlider } from '@/components/TrendingSlider';
import { GenreCarousel } from '@/components/GenreCarousel';
import { IndianSection } from '@/components/IndianSection';
import { UpcomingMovies } from '@/components/UpcomingMovies';
import { ChevronLeft, ChevronRight } from 'lucide-react';

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

  const sectionHeaderClass = "flex justify-between items-center";
  const navigationButtonClass = "hidden md:flex items-center justify-center w-8 h-8 rounded-full bg-black/50 text-white";

  return (
    <div className="min-h-screen bg-netflix-black text-white">
      <div className="-mt-16">
        {!trendingLoading && trendingAll?.results && (
          <HeroSlider items={trendingAll.results.slice(0, 5)} />
        )}
      </div>
      
      <main className="container space-y-12 py-8">
        <section className="space-y-6">
          <div className={sectionHeaderClass}>
            <h2 className="text-3xl font-bold">Genres</h2>
          </div>
          <GenreCarousel />
        </section>

        <section className="space-y-6">
          <div className={sectionHeaderClass}>
            <h2 className="text-3xl font-bold">Trending Now</h2>
          </div>
          <TrendingSlider />
        </section>

        <section className="space-y-6">
          <div className={sectionHeaderClass}>
            <h2 className="text-3xl font-bold">Coming Soon</h2>
          </div>
          <UpcomingMovies />
        </section>

        <IndianSection />

        <section className="space-y-6">
          <div className={sectionHeaderClass}>
            <h2 className="text-3xl font-bold">Top Rated</h2>
          </div>
          {topRatedLoading ? (
            <div className="animate-pulse rounded-lg bg-gray-800 h-[300px]" />
          ) : (
            <MovieCarousel items={topRated?.results || []} />
          )}
        </section>

        {genreQueries.map((query, index) => (
          <section key={index} className="space-y-6">
            <div className={sectionHeaderClass}>
              <h2 className="text-3xl font-bold">{query.name} Movies</h2>
            </div>
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