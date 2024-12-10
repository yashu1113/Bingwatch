import { Link, useLocation } from 'react-router-dom';
import { SearchBar } from './SearchBar';
import { cn } from '@/lib/utils';
import { Menu, X } from 'lucide-react';
import { useState } from 'react';

export const Navigation = () => {
  const location = useLocation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  
  const isActive = (path: string) => {
    return location.pathname === path;
  };

  return (
    <nav className="sticky top-0 z-50 w-full border-b border-gray-800 bg-netflix-black/95 backdrop-blur">
      <div className="container flex h-16 items-center justify-between px-4">
        <div className="flex items-center gap-8">
          <Link to="/" className="text-2xl font-bold text-netflix-red">
            MovieDB
          </Link>
          <div className="hidden items-center space-x-6 md:flex">
            <NavLink to="/" active={isActive('/')}>
              Home
            </NavLink>
            <NavLink to="/movies" active={isActive('/movies')}>
              Movies
            </NavLink>
            <NavLink to="/tv" active={isActive('/tv')}>
              TV Shows
            </NavLink>
            <NavLink to="/watchlist" active={isActive('/watchlist')}>
              Watchlist
            </NavLink>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <div className="hidden md:block">
            <SearchBar />
          </div>
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="p-2 text-white md:hidden"
          >
            {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {isMenuOpen && (
        <div className="absolute left-0 right-0 top-16 animate-fade-down bg-netflix-black/95 px-4 py-4 backdrop-blur md:hidden">
          <div className="flex flex-col space-y-4">
            <NavLink to="/" active={isActive('/')} onClick={() => setIsMenuOpen(false)}>
              Home
            </NavLink>
            <NavLink to="/movies" active={isActive('/movies')} onClick={() => setIsMenuOpen(false)}>
              Movies
            </NavLink>
            <NavLink to="/tv" active={isActive('/tv')} onClick={() => setIsMenuOpen(false)}>
              TV Shows
            </NavLink>
            <NavLink to="/watchlist" active={isActive('/watchlist')} onClick={() => setIsMenuOpen(false)}>
              Watchlist
            </NavLink>
            <div className="pt-2">
              <SearchBar />
            </div>
          </div>
        </div>
      )}
    </nav>
  );
};

const NavLink = ({ 
  to, 
  children, 
  active, 
  onClick 
}: { 
  to: string; 
  children: React.ReactNode; 
  active: boolean;
  onClick?: () => void;
}) => (
  <Link
    to={to}
    onClick={onClick}
    className={cn(
      "text-sm font-medium transition-colors hover:text-white/90",
      active ? "text-white" : "text-white/60"
    )}
  >
    {children}
  </Link>
);