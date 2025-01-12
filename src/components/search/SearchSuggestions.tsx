import { SearchResult } from '@/types/search';

interface SearchSuggestionsProps {
  suggestions: Array<{ item: SearchResult; score: number }>;
  onSuggestionClick: (suggestion: SearchResult) => void;
}

export const SearchSuggestions = ({ suggestions, onSuggestionClick }: SearchSuggestionsProps) => {
  if (suggestions.length === 0) return null;

  return (
    <div className="absolute z-50 w-full mt-2 bg-black/95 border border-gray-700 rounded-lg shadow-xl">
      <div className="p-2 text-sm text-gray-400">
        Did you mean...
      </div>
      {suggestions.map(({ item }) => (
        <button
          key={item.id}
          onClick={() => onSuggestionClick(item)}
          className="w-full px-4 py-2 text-left text-white hover:bg-gray-800 transition-colors"
        >
          <span>{item.title || item.name}</span>
        </button>
      ))}
    </div>
  );
};