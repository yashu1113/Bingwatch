import { useQuery } from '@tanstack/react-query';
import { useSearchParams } from 'react-router-dom';
import { search } from '@/services/tmdb';
import { MediaGrid } from '@/components/MediaGrid';
import { SearchBar } from '@/components/SearchBar';

const Search = () => {
  const [searchParams] = useSearchParams();
  const query = searchParams.get('q') || '';

  const { data, isLoading } = useQuery({
    queryKey: ['search', query],
    queryFn: () => search(query),
    enabled: !!query,
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
        <h2 className="mb-6 text-3xl font-bold">
          Search Results for "{query}"
        </h2>
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
          <MediaGrid items={data?.results || []} />
        )}
      </main>
    </div>
  );
};

export default Search;