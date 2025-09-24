import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Fuse from 'fuse.js';
import { useDebounce } from '@/hooks/use-debounce';
import { fuzzySearch, FuzzySearchResult } from '@/services/fuzzySearch';
import { useQuery } from '@tanstack/react-query';
import { SearchInput } from './search/SearchInput';
import { SearchSuggestions } from './search/SearchSuggestions';

export const SearchBar = ({ onSearch }: { onSearch?: () => void }) => {
  const [query, setQuery] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const debouncedQuery = useDebounce(query, 300);
  const navigate = useNavigate();

  const { data: searchResults } = useQuery({
    queryKey: ['fuzzy-search-suggestions', debouncedQuery],
    queryFn: () => fuzzySearch(debouncedQuery),
    enabled: debouncedQuery.length > 1,
    staleTime: 1000 * 60 * 5, // Cache results for 5 minutes
    refetchOnWindowFocus: false,
  });

  const fuse = new Fuse(searchResults?.results || [], {
    keys: [
      { name: 'title', weight: 0.7 },
      { name: 'name', weight: 0.7 },
      { name: 'original_title', weight: 0.5 },
      { name: 'original_name', weight: 0.5 },
      { name: 'overview', weight: 0.2 },
    ],
    threshold: 0.6, // More forgiving for typos
    includeScore: true,
    ignoreLocation: true,
    findAllMatches: true,
    minMatchCharLength: 2,
    shouldSort: true,
    includeMatches: true,
  });

  const suggestions = debouncedQuery
    ? (fuse.search(debouncedQuery) as Array<{ item: FuzzySearchResult; score: number }>)
      .sort((a, b) => (b.item.popularity || 0) - (a.item.popularity || 0))
      .slice(0, 5)
    : searchResults?.results?.slice(0, 5)?.map(item => ({ item, score: 0 })) || [];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      navigate(`/search?q=${encodeURIComponent(query.trim())}`);
      setQuery('');
      setShowSuggestions(false);
      onSearch?.();
    }
  };

  const handleSuggestionClick = (suggestion: FuzzySearchResult) => {
    const title = suggestion.title || suggestion.name;
    navigate(`/search?q=${encodeURIComponent(title || '')}`);
    setQuery('');
    setShowSuggestions(false);
    onSearch?.();
  };

  useEffect(() => {
    const shouldShowSuggestions = debouncedQuery.length > 1 && 
      (searchResults?.results?.length || 0) > 0;
    setShowSuggestions(shouldShowSuggestions);
  }, [debouncedQuery, searchResults]);

  return (
    <div className="relative w-full max-w-[90vw] md:max-w-2xl">
      <SearchInput 
        query={query}
        onChange={setQuery}
        onSubmit={handleSubmit}
      />
      {showSuggestions && suggestions.length > 0 && (
        <SearchSuggestions 
          suggestions={suggestions}
          onSuggestionClick={handleSuggestionClick}
        />
      )}
    </div>
  );
};