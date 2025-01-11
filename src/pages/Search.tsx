import { useQuery } from '@tanstack/react-query';
import { useSearchParams } from 'react-router-dom';
import { search } from '@/services/tmdb';
import { MediaGrid } from '@/components/MediaGrid';
import { NotFound } from '@/components/NotFound';

const Search = () => {
  const [searchParams] = useSearchParams();
  const query = searchParams.get('q') || '';

  const { data, isLoading } = useQuery({
    queryKey: ['search', query],
    queryFn: () => search(query),
    enabled: !!query,
  });

  const hasNoResults = !isLoading && data?.results.length === 0;

  return (
    <div className="min-h-screen bg-netflix-black text-white pt-20">
      <main className="container py-8 px-4 md:px-8">
        <h2 className="mb-6 text-2xl font-bold sm:text-3xl">
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
        ) : hasNoResults ? (
          <NotFound message={`No results found for "${query}"`} />
        ) : (
          <MediaGrid items={data?.results || []} />
        )}
      </main>
    </div>
  );
};

export default Search;