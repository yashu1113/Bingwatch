import { useQuery } from '@tanstack/react-query';
import { useSearchParams } from 'react-router-dom';
import { search } from '@/services/tmdb';
import { MediaGrid } from '@/components/MediaGrid';
import { NotFound } from '@/components/NotFound';
import { FilterBar } from '@/components/FilterBar';

const Search = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const query = searchParams.get('q') || '';
  
  const { data, isLoading } = useQuery({
    queryKey: ['search', query, {
      genre: searchParams.get('genre'),
      year: searchParams.get('year'),
      rating: searchParams.get('rating'),
      sort: searchParams.get('sort'),
    }],
    queryFn: () => search(query, {
      genre: searchParams.get('genre'),
      year: searchParams.get('year'),
      rating: Number(searchParams.get('rating')) || 0,
      sort: searchParams.get('sort'),
    }),
    enabled: !!query,
  });

  const handleFilterChange = (filters: {
    genre?: string;
    year?: string;
    rating?: number;
    sort?: string;
  }) => {
    const newParams = new URLSearchParams(searchParams);
    Object.entries(filters).forEach(([key, value]) => {
      if (value) {
        newParams.set(key, value.toString());
      } else {
        newParams.delete(key);
      }
    });
    setSearchParams(newParams);
  };

  const filteredResults = data?.results.filter((item) => {
    const minRating = Number(searchParams.get('rating')) || 0;
    return item.vote_average >= minRating;
  });

  const hasNoResults = !isLoading && filteredResults?.length === 0;

  return (
    <div className="min-h-screen bg-netflix-black text-white pt-20">
      <main className="container py-8 px-4 md:px-8">
        <h2 className="mb-6 text-2xl font-bold sm:text-3xl">
          Search Results for "{query}"
        </h2>
        
        <FilterBar onFilterChange={handleFilterChange} />
        
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
          <MediaGrid items={filteredResults || []} />
        )}
      </main>
    </div>
  );
};

export default Search;