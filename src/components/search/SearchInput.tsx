import { Input } from '@/components/ui/input';
import { Search } from 'lucide-react';

interface SearchInputProps {
  query: string;
  onChange: (value: string) => void;
  onSubmit: (e: React.FormEvent) => void;
}

export const SearchInput = ({ query, onChange, onSubmit }: SearchInputProps) => {
  return (
    <form onSubmit={onSubmit} className="relative">
      <Input
        type="search"
        placeholder="Search movies, TV shows..."
        value={query}
        onChange={(e) => onChange(e.target.value)}
        className="w-full pl-12 pr-4 py-4 md:py-6 text-base md:text-lg rounded-xl 
          border-2 focus:border-primary focus:ring-2 focus:ring-primary bg-background/80 
          text-foreground placeholder:text-foreground/50
          font-medium leading-relaxed
          shadow-lg backdrop-blur-sm
          h-[56px] md:h-[68px]"
        style={{
          fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
        }}
      />
      <Search className="absolute left-4 top-1/2 h-6 w-6 md:h-7 md:w-7 -translate-y-1/2 text-foreground/60" />
    </form>
  );
};
