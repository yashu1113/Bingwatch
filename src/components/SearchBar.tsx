import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Input } from '@/components/ui/input';
import { Search } from 'lucide-react';

export const SearchBar = ({ onSearch }: { onSearch?: () => void }) => {
  const [query, setQuery] = useState('');
  const navigate = useNavigate();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      navigate(`/search?q=${encodeURIComponent(query.trim())}`);
      setQuery('');
      onSearch?.();
    }
  };

  return (
    <form onSubmit={handleSubmit} className="relative w-full max-w-[90vw] md:max-w-2xl">
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
  );
};