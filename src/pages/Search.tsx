import { useEffect, useState, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { search } from '../services/api';
import { MediaGrid } from '../components/MediaGrid';
import { useInfiniteScroll } from '../hooks/useInfiniteScroll';

export function Search() {
  const [searchParams] = useSearchParams();
  const query = searchParams.get('q') || '';
  const [results, setResults] = useState([]);
  const [page, setPage] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(true);

  const fetchResults = useCallback(async () => {
    if (!query.trim()) return;
    
    try {
      setIsLoading(true);
      const data = await search(query, page);
      setResults((prev) => [...prev, ...data.results]);
      setHasMore(data.page < data.total_pages);
      setPage((p) => p + 1);
    } catch (err) {
      setError('Failed to fetch search results');
    } finally {
      setIsLoading(false);
    }
  }, [query, page]);

  useEffect(() => {
    setResults([]);
    setPage(1);
    setHasMore(true);
    fetchResults();
  }, [query]);

  const { isFetching } = useInfiniteScroll(() => {
    if (hasMore) {
      fetchResults();
    }
  });

  if (error) {
    return (
      <div className="text-center text-red-400 py-8">
        <p>{error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <h2 className="text-2xl font-bold">Search Results for "{query}"</h2>
      {results.length > 0 ? (
        <>
          <MediaGrid items={results} />
          {(isLoading || isFetching) && (
            <div className="flex justify-center py-4">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-white"></div>
            </div>
          )}
        </>
      ) : (
        <p className="text-center text-gray-400 py-8">No results found</p>
      )}
    </div>
  );
}