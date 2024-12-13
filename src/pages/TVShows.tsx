import { useQuery } from '@tanstack/react-query';
import { getTrending, getTopRated } from '@/services/tmdb';
import { MovieCarousel } from '@/components/MovieCarousel';

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
    <div className="bg-gray-800">
      {/* Navbar section */}
      <nav className="bg-gray-800 fixed top-0 left-0 w-full z-10 py-4 px-6">
        <h1 className="text-3xl text-white font-bold">TV Shows</h1>
      </nav>

      {/* Main content section */}
      <main className="container space-y-12 py-8 mt-[80px]"> {/* Add margin-top to avoid overlap */}
        <section className="space-y-6 bg-gray-800 p-6 rounded-lg"> {/* Same bg-gray-800 color */}
          <h2 className="text-3xl font-bold text-white">Trending TV Shows</h2>
          {trendingLoading ? (
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
              {Array.from({ length: 10 }).map((_, i) => (
                <div
                  key={i}
                  className="aspect-[2/3] animate-pulse rounded-lg bg-gray-700"
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

        <section className="space-y-6 bg-gray-800 p-6 rounded-lg">
          <h2 className="text-3xl font-bold text-white">Top Rated TV Shows</h2>
          {topRatedLoading ? (
            <div className="animate-pulse rounded-lg bg-gray-700 h-[300px]" />
          ) : (
            <MovieCarousel 
              items={topRatedTV?.results.map(show => ({
                ...show,
                media_type: 'tv'
              })) || []} 
            />
          )}
        </section>
      </main>
    </div>
  );
};

export default TVShows;
