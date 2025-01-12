import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Fuse from 'fuse.js';
import { useDebounce } from '@/hooks/use-debounce';
import { search } from '@/services/tmdb';
import { useQuery } from '@tanstack/react-query';
import { SearchInput } from './search/SearchInput';
import { SearchSuggestions } from './search/SearchSuggestions';
import { SearchResult } from '@/types/search';

export const SearchBar = ({ onSearch }: { onSearch?: () => void }) => {
  const [query, setQuery] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const debouncedQuery = useDebounce(query, 300);
  const navigate = useNavigate();

  const { data: searchResults } = useQuery({
    queryKey: ['search', debouncedQuery],
    queryFn: () => search(debouncedQuery),
    enabled: debouncedQuery.length > 0,
    staleTime: 1000 * 60 * 5, // Cache results for 5 minutes
    refetchOnWindowFocus: false,
  });

  const fuse = new Fuse(searchResults?.results || [], {
    keys: ['title', 'name'],
    threshold: 0.4,
    includeScore: true,
  });

  const suggestions = debouncedQuery
    ? (fuse.search(debouncedQuery) as Array<{ item: SearchResult; score: number }>)
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
    const shouldShowSuggestions = debouncedQuery.length > 0 && searchResults?.results?.length > 0;
    setShowSuggestions(shouldShowSuggestions);
  }, [debouncedQuery, searchResults]);

  return (
    <div className="relative w-full max-w-[90vw] md:max-w-2xl">
      <SearchInput 
        query={query}
        onChange={setQuery}
        onSubmit={handleSubmit}
      />
      {showSuggestions && (
        <SearchSuggestions 
          suggestions={suggestions}
          onSuggestionClick={handleSuggestionClick}
        />
      )}
    </div>
  );
};