import { FuzzySearchResult } from '@/services/fuzzySearch';
import { getImageUrl } from '@/services/tmdb';
import { Film, Tv, Star } from 'lucide-react';

interface SearchSuggestionsProps {
  suggestions: Array<{ item: FuzzySearchResult; score: number }>;
  onSuggestionClick: (suggestion: FuzzySearchResult) => void;
  selectedIndex?: number;
  correctedQuery?: string;
}

export const SearchSuggestions = ({ 
  suggestions, 
  onSuggestionClick, 
  selectedIndex = -1,
  correctedQuery 
}: SearchSuggestionsProps) => {
  if (suggestions.length === 0) return null;

  return (
    <div className="absolute z-50 w-full mt-2 bg-black/95 border border-white/10 rounded-xl shadow-2xl backdrop-blur-xl overflow-hidden">
      {correctedQuery && (
        <div className="px-4 py-2 text-sm text-white/50 border-b border-white/10 bg-white/5">
          Showing results for "<span className="text-netflix-red font-medium">{correctedQuery}</span>"
        </div>
      )}
      <div className="max-h-[400px] overflow-y-auto">
        {suggestions.map(({ item }, index) => (
          <button
            key={`${item.id}-${item.media_type}`}
            onClick={() => onSuggestionClick(item)}
            className={`w-full px-4 py-3 flex items-center gap-3 transition-all duration-200
              ${selectedIndex === index 
                ? 'bg-netflix-red/20 text-white' 
                : 'hover:bg-white/10 text-white/90'
              }`}
          >
            {/* Poster Thumbnail */}
            <div className="w-10 h-14 rounded-md overflow-hidden bg-white/5 flex-shrink-0">
              {item.poster_path ? (
                <img 
                  src={getImageUrl(item.poster_path, 'w92')}
                  alt={item.title || item.name}
                  className="w-full h-full object-cover"
                  loading="lazy"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  {item.media_type === 'movie' ? (
                    <Film className="w-5 h-5 text-white/30" />
                  ) : (
                    <Tv className="w-5 h-5 text-white/30" />
                  )}
                </div>
              )}
            </div>
            
            {/* Content */}
            <div className="flex-1 text-left min-w-0">
              <div className="font-medium truncate">
                {item.title || item.name}
              </div>
              <div className="flex items-center gap-2 text-sm text-white/50">
                <span className="inline-flex items-center gap-1 px-1.5 py-0.5 bg-white/10 rounded text-xs uppercase">
                  {item.media_type === 'movie' ? (
                    <>
                      <Film className="w-3 h-3" /> Movie
                    </>
                  ) : (
                    <>
                      <Tv className="w-3 h-3" /> TV
                    </>
                  )}
                </span>
                {(item.release_date || item.first_air_date) && (
                  <span>
                    {new Date(item.release_date || item.first_air_date || '').getFullYear()}
                  </span>
                )}
                {item.vote_average && item.vote_average > 0 && (
                  <span className="inline-flex items-center gap-0.5 text-yellow-400">
                    <Star className="w-3 h-3 fill-current" />
                    {item.vote_average.toFixed(1)}
                  </span>
                )}
              </div>
            </div>
          </button>
        ))}
      </div>
      
      <div className="px-4 py-2 text-xs text-white/40 border-t border-white/10 bg-white/5">
        Press <kbd className="px-1.5 py-0.5 bg-white/10 rounded text-white/60">↵</kbd> to search all • 
        <kbd className="px-1.5 py-0.5 bg-white/10 rounded text-white/60 ml-1">↑↓</kbd> to navigate
      </div>
    </div>
  );
};
