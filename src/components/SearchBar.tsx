import { Search } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { useDebounce } from '../hooks/useDebounce';

export function SearchBar() {
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const debouncedQuery = useDebounce(query, 500);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      navigate(`/search?q=${encodeURIComponent(query)}`);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="relative w-full max-w-xl">
      <input
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Search movies and TV shows..."
        className="w-full rounded-full bg-white/10 px-4 py-2 pl-10 text-white placeholder-white/70 outline-none ring-1 ring-white/20 focus:ring-2"
      />
      <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/70" />
    </form>
  );
}