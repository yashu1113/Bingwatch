import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDebounce } from '@/hooks/use-debounce';
import { fuzzySearch, FuzzySearchResult } from '@/services/fuzzySearch';
import { useQuery } from '@tanstack/react-query';
import { SearchInput } from './search/SearchInput';
import { SearchSuggestions } from './search/SearchSuggestions';

export const SearchBar = ({ onSearch }: { onSearch?: () => void }) => {
  const [query, setQuery] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const debouncedQuery = useDebounce(query, 300);
  const navigate = useNavigate();
  const containerRef = useRef<HTMLDivElement>(null);

  const { data: searchResults, isLoading } = useQuery({
    queryKey: ['fuzzy-search-suggestions', debouncedQuery],
    queryFn: () => fuzzySearch(debouncedQuery),
    enabled: debouncedQuery.length > 1,
    staleTime: 1000 * 60 * 5,
    refetchOnWindowFocus: false,
  });

  // Direct suggestions from search results - no double Fuse processing
  const suggestions = searchResults?.results?.slice(0, 6).map(item => ({ 
    item, 
    score: 0 
  })) || [];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      navigate(`/search?q=${encodeURIComponent(query.trim())}`);
      setQuery('');
      setShowSuggestions(false);
      setSelectedIndex(-1);
      onSearch?.();
    }
  };

  const handleSuggestionClick = (suggestion: FuzzySearchResult) => {
    // Navigate directly to the detail page instead of search
    const mediaType = suggestion.media_type;
    navigate(`/${mediaType}/${suggestion.id}`);
    setQuery('');
    setShowSuggestions(false);
    setSelectedIndex(-1);
    onSearch?.();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    // Only handle navigation keys when suggestions are shown
    if (!showSuggestions || suggestions.length === 0) {
      // Allow form submission with Enter when no suggestions
      if (e.key === 'Enter') {
        return; // Let form handle it
      }
      return;
    }

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedIndex(prev => 
          prev < suggestions.length - 1 ? prev + 1 : 0
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedIndex(prev => 
          prev > 0 ? prev - 1 : suggestions.length - 1
        );
        break;
      case 'Enter':
        // Only navigate to suggestion if one is selected
        if (selectedIndex >= 0 && suggestions[selectedIndex]) {
          e.preventDefault();
          handleSuggestionClick(suggestions[selectedIndex].item);
        }
        // Otherwise let form submit normally
        break;
      case 'Escape':
        setShowSuggestions(false);
        setSelectedIndex(-1);
        break;
      // Don't handle Space - let it type normally
    }
  };

  // Click outside to close
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setShowSuggestions(false);
        setSelectedIndex(-1);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    const shouldShow = debouncedQuery.length > 1 && suggestions.length > 0;
    setShowSuggestions(shouldShow);
    setSelectedIndex(-1);
  }, [debouncedQuery, suggestions.length]);

  return (
    <div ref={containerRef} className="relative w-full max-w-[90vw] md:max-w-2xl">
      <SearchInput 
        query={query}
        onChange={setQuery}
        onSubmit={handleSubmit}
        onKeyDown={handleKeyDown}
        isLoading={isLoading && debouncedQuery.length > 1}
      />
      {showSuggestions && suggestions.length > 0 && (
        <SearchSuggestions 
          suggestions={suggestions}
          onSuggestionClick={handleSuggestionClick}
          selectedIndex={selectedIndex}
          correctedQuery={searchResults?.correctedQuery}
        />
      )}
    </div>
  );
};
