import { Input } from '@/components/ui/input';
import { Search, Loader2 } from 'lucide-react';

interface SearchInputProps {
  query: string;
  onChange: (value: string) => void;
  onSubmit: (e: React.FormEvent) => void;
  onKeyDown?: (e: React.KeyboardEvent) => void;
  isLoading?: boolean;
}

export const SearchInput = ({ 
  query, 
  onChange, 
  onSubmit, 
  onKeyDown,
  isLoading 
}: SearchInputProps) => {
  return (
    <form onSubmit={onSubmit} className="relative group">
      <Input
        type="search"
        placeholder="Search movies, TV shows..."
        value={query}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={onKeyDown}
        className="w-full pl-12 pr-12 py-3 md:py-4 text-sm md:text-base rounded-xl 
          border border-white/20 focus:border-netflix-red focus:ring-2 focus:ring-netflix-red/30 
          bg-black/80 text-white placeholder:text-white/40
          font-medium leading-relaxed backdrop-blur-md
          h-[48px] md:h-[56px]
          transition-all duration-300
          group-hover:border-white/30"
      />
      <div className="absolute left-4 top-1/2 -translate-y-1/2">
        {isLoading ? (
          <Loader2 className="h-5 w-5 text-white/50 animate-spin" />
        ) : (
          <Search className="h-5 w-5 text-white/50 group-hover:text-white/70 transition-colors" />
        )}
      </div>
    </form>
  );
};
