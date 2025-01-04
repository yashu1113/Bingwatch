import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Input } from '@/components/ui/input';
import { Search } from 'lucide-react';
import Fuse from 'fuse.js';
import { useDebounce } from '@/hooks/use-debounce';
import { search } from '@/services/tmdb';
import { useQuery } from '@tanstack/react-query';

interface SearchResult {
  id: number;
  title?: string;
  name?: string;
  media_type: string;
  popularity: number;
}

interface FuseResult<T> {
  item: T;
  refIndex: number;
  score: number;
}

export const SearchBar = ({ onSearch }: { onSearch?: () => void }) => {
  const [query, setQuery] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const debouncedQuery = useDebounce(query, 300);
  const navigate = useNavigate();

  const { data: searchResults } = useQuery({
    queryKey: ['search', debouncedQuery],
    queryFn: () => search(debouncedQuery),
    enabled: debouncedQuery.length > 0,
  });

  const fuse = new Fuse(searchResults?.results || [], {
    keys: ['title', 'name'],
    threshold: 0.4,
    includeScore: true,
  });

  const suggestions = debouncedQuery
    ? (fuse.search(debouncedQuery) as FuseResult<SearchResult>[])
      .sort((a, b) => b.item.popularity - a.item.popularity)
      .slice(0, 5)
    : [];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      navigate(`/search?q=${encodeURIComponent(query.trim())}`);
      setQuery('');
      setShowSuggestions(false);
      onSearch?.();
    }
  };

  const handleSuggestionClick = (suggestion: SearchResult) => {
    const title = suggestion.title || suggestion.name;
    navigate(`/search?q=${encodeURIComponent(title || '')}`);
    setQuery('');
    setShowSuggestions(false);
    onSearch?.();
  };

  useEffect(() => {
    setShowSuggestions(debouncedQuery.length > 0);
  }, [debouncedQuery]);

  return (
    <div className="relative w-full max-w-[90vw] md:max-w-2xl">
      <form onSubmit={handleSubmit} className="relative">
        <Input
          type="search"
          placeholder="Search movies, TV shows..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="w-full pl-12 pr-4 py-4 md:py-6 text-base md:text-lg rounded-xl 
            border-2 focus:border-netflix-red bg-black/80 
            text-white placeholder:text-gray-400
            font-medium leading-relaxed
            shadow-lg backdrop-blur-sm
            h-[50px] md:h-[60px]"
          style={{
            fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
          }}
        />
        <Search className="absolute left-4 top-1/2 h-5 w-5 md:h-6 md:w-6 -translate-y-1/2 text-gray-400" />
      </form>

      {showSuggestions && suggestions.length > 0 && (
        <div className="absolute z-50 w-full mt-2 bg-black/95 border border-gray-700 rounded-lg shadow-xl">
          <div className="p-2 text-sm text-gray-400">
            Did you mean...
          </div>
          {suggestions.map(({ item }) => (
            <button
              key={item.id}
              onClick={() => handleSuggestionClick(item)}
              className="w-full px-4 py-2 text-left text-white hover:bg-gray-800 transition-colors"
            >
              <span>{item.title || item.name}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};