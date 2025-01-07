import { useQuery } from '@tanstack/react-query';
import { getTrending, getTopRated, getMoviesByGenre } from '@/services/tmdb';
import { MovieCarousel } from '@/components/MovieCarousel';
import { HeroSlider } from '@/components/HeroSlider';
import { TrendingSlider } from '@/components/TrendingSlider';
import { GenreCarousel } from '@/components/GenreCarousel';
import { IndianSection } from '@/components/IndianSection';
import { UpcomingMovies } from '@/components/UpcomingMovies';
import { ChevronRight } from 'lucide-react';

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

  const buttonClass = "hidden md:flex items-center gap-1 px-4 py-1.5 text-sm font-medium text-white bg-netflix-black rounded-full";

  return (
    <div className="min-h-screen bg-netflix-black text-white">
      <div className="-mt-16">
        {!trendingLoading && trendingAll?.results && (
          <HeroSlider items={trendingAll.results.slice(0, 5)} />
        )}
      </div>
      
      <main className="container space-y-12 py-8">
        <section className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-3xl font-bold">Genres</h2>
            <button className={buttonClass}>
              See all <ChevronRight className="w-4 h-4" />
            </button>
          </div>
          <GenreCarousel />
        </section>

        <section className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-3xl font-bold">Trending Now</h2>
            <button className={buttonClass}>
              See all <ChevronRight className="w-4 h-4" />
            </button>
          </div>
          <TrendingSlider />
        </section>

        <section className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-3xl font-bold">Coming Soon</h2>
            <button className={buttonClass}>
              See all <ChevronRight className="w-4 h-4" />
            </button>
          </div>
          <UpcomingMovies />
        </section>

        <IndianSection />

        <section className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-3xl font-bold">Top Rated</h2>
            <button className={buttonClass}>
              See all <ChevronRight className="w-4 h-4" />
            </button>
          </div>
          {topRatedLoading ? (
            <div className="animate-pulse rounded-lg bg-gray-800 h-[300px]" />
          ) : (
            <MovieCarousel items={topRated?.results || []} />
          )}
        </section>

        {genreQueries.map((query, index) => (
          <section key={index} className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-3xl font-bold">{query.name} Movies</h2>
              <button className={buttonClass}>
                See all <ChevronRight className="w-4 h-4" />
              </button>
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