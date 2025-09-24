import { useQuery } from '@tanstack/react-query';
import { useSearchParams } from 'react-router-dom';
import { fuzzySearch } from '@/services/fuzzySearch';
import { MediaGrid } from '@/components/MediaGrid';
import { NotFound } from '@/components/NotFound';

const Search = () => {
  const [searchParams] = useSearchParams();
  const query = searchParams.get('q') || '';

  const { data, isLoading } = useQuery({
    queryKey: ['fuzzy-search', query],
    queryFn: () => fuzzySearch(query),
    enabled: !!query,
    staleTime: 1000 * 60 * 5, // Cache for 5 minutes
  });

  const hasNoResults = !isLoading && data?.results.length === 0;

  return (
    <div className="min-h-screen bg-netflix-black text-white pt-20">
      <main className="container py-8 px-4 md:px-8">
        <div className="mb-6">
          <h2 className="text-2xl font-bold sm:text-3xl">
            Search Results for "{query}"
          </h2>
          {data?.correctedQuery && data.correctedQuery !== query && (
            <p className="mt-2 text-sm text-gray-400">
              Showing results for "{data.correctedQuery}" instead
            </p>
          )}
        </div>
        
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
          <NotFound message={`No results found for "${query}". Try checking your spelling or using different keywords.`} />
        ) : (
          <>
            {data?.results && data.results.length > 0 && (
              <div className="mb-4">
                <p className="text-sm text-gray-400">
                  Found {data.results.length} result{data.results.length !== 1 ? 's' : ''}
                </p>
              </div>
            )}
            <MediaGrid items={data?.results || []} />
          </>
        )}
      </main>
    </div>
  );
};

export default Search;