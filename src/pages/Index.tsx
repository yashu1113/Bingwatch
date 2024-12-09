import { useQuery } from '@tanstack/react-query';
import { getTrending } from '@/services/tmdb';
import { MediaGrid } from '@/components/MediaGrid';
import { SearchBar } from '@/components/SearchBar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

const Index = () => {
  const { data: trendingAll, isLoading } = useQuery({
    queryKey: ['trending', 'all', 'week'],
    queryFn: () => getTrending('all', 'week'),
  });

  return (
    <div className="min-h-screen bg-netflix-black text-white">
      <header className="sticky top-0 z-50 bg-netflix-black/95 backdrop-blur">
        <div className="container py-4">
          <div className="flex items-center justify-between gap-4">
            <h1 className="text-2xl font-bold text-netflix-red">MovieDB</h1>
            <SearchBar />
          </div>
        </div>
      </header>

      <main className="container py-8">
        <section className="space-y-6">
          <h2 className="text-3xl font-bold">Trending Now</h2>
          {isLoading ? (
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
              {Array.from({ length: 10 }).map((_, i) => (
                <div
                  key={i}
                  className="aspect-[2/3] animate-pulse rounded-lg bg-gray-800"
                />
              ))}
            </div>
          ) : (
            <MediaGrid items={trendingAll?.results || []} />
          )}
        </section>
      </main>
    </div>
  );
};

export default Index;