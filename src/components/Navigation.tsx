import { Link, useLocation } from 'react-router-dom';
import { SearchBar } from './SearchBar';
import { cn } from '@/lib/utils';
import { Menu, X, Home, Search, List } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useWatchlist } from '@/contexts/WatchlistContext';

export const Navigation = () => {
  const location = useLocation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isSearchVisible, setIsSearchVisible] = useState(false);
  const { watchlist } = useWatchlist();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 0);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const isActive = (path: string) => {
    return location.pathname === path;
  };

  const toggleSearch = () => {
    setIsSearchVisible(!isSearchVisible);
    if (!isSearchVisible) {
      setTimeout(() => {
        const searchInput = document.querySelector('input[type="search"]');
        if (searchInput instanceof HTMLInputElement) {
          searchInput.focus();
        }
      }, 100);
    }
  };

  return (
    <>
      <nav
        className={cn(
          "fixed top-0 left-0 right-0 z-50 transition-all duration-300",
          isScrolled ? "bg-netflix-black/95 backdrop-blur shadow" : "bg-gradient-to-b from-black/80 to-transparent"
        )}
      >
        <div className="container flex h-16 md:h-20 items-center justify-between px-4 md:px-8">
          <div className="flex items-center gap-8">
            <Link to="/" className="text-2xl md:text-3xl font-bold text-netflix-red">
              Bingwatch
            </Link>
            <div className="hidden items-center space-x-6 md:flex">
              <NavLink to="/" active={isActive('/')}>Home</NavLink>
              <NavLink to="/movies" active={isActive('/movies')}>Movies</NavLink>
              <NavLink to="/tv" active={isActive('/tv')}>TV Shows</NavLink>
              <NavLink to="/watchlist" active={isActive('/watchlist')}>
                Watchlist {watchlist.length > 0 && (
                  <span className="ml-1 rounded-full bg-netflix-red px-2 py-0.5 text-xs">
                    {watchlist.length}
                  </span>
                )}
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
              aria-expanded={isMenuOpen}
              aria-label="Toggle menu"
            >
              {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>

        {/* Mobile Search Overlay */}
        <div
          className={cn(
            "fixed inset-x-0 top-0 bg-netflix-black/95 backdrop-blur transition-transform duration-300 md:hidden",
            isSearchVisible ? "translate-y-0" : "-translate-y-full"
          )}
        >
          <div className="container p-4">
            <SearchBar onSearch={() => setIsSearchVisible(false)} />
          </div>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="absolute left-0 right-0 top-16 bg-netflix-black/95 px-4 py-4 backdrop-blur md:hidden">
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
                Watchlist {watchlist.length > 0 && (
                  <span className="ml-1 rounded-full bg-netflix-red px-2 py-0.5 text-xs">
                    {watchlist.length}
                  </span>
                )}
              </NavLink>
            </div>
          </div>
        )}
      </nav>

      {/* Mobile Bottom Navigation */}
      <div className="fixed bottom-0 left-0 right-0 z-50 border-t border-white/10 bg-netflix-black/95 backdrop-blur md:hidden">
        <div className="container flex h-16 items-center justify-around px-4">
          <NavLink to="/" active={isActive('/')} className="flex flex-col items-center gap-1">
            <Home size={20} />
            <span className="text-xs">Home</span>
          </NavLink>
          <button
            onClick={toggleSearch}
            className={cn(
              "flex flex-col items-center gap-1 text-white/60 transition-colors",
              isSearchVisible && "text-white"
            )}
          >
            <Search size={20} />
            <span className="text-xs">Search</span>
          </button>
          <NavLink to="/movies" active={isActive('/movies')} className="flex flex-col items-center gap-1">
            <List size={20} />
            <span className="text-xs">Browse</span>
          </NavLink>
          <NavLink to="/watchlist" active={isActive('/watchlist')} className="flex flex-col items-center gap-1">
            <div className="relative">
              <List size={20} />
              {watchlist.length > 0 && (
                <span className="absolute -right-2 -top-2 flex h-4 w-4 items-center justify-center rounded-full bg-netflix-red text-[10px]">
                  {watchlist.length}
                </span>
              )}
            </div>
            <span className="text-xs">Watchlist</span>
          </NavLink>
        </div>
      </div>
    </>
  );
};

const NavLink = ({ 
  to, 
  children, 
  active, 
  className,
  onClick 
}: { 
  to: string; 
  children: React.ReactNode; 
  active: boolean;
  className?: string;
  onClick?: () => void;
}) => (
  <Link
    to={to}
    onClick={onClick}
    className={cn(
      "text-sm font-medium transition-colors duration-200 hover:text-white/90",
      active ? "text-white" : "text-white/60",
      className
    )}
  >
    {children}
  </Link>
);