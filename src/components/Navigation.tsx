import { Link, useLocation } from 'react-router-dom';
import { SearchBar } from './SearchBar';
import { cn } from '@/lib/utils';

export const Navigation = () => {
  const location = useLocation();
  
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
          </div>
        </div>
        <div className="flex items-center gap-4">
          <SearchBar />
        </div>
      </div>
    </nav>
  );
};

const NavLink = ({ to, children, active }: { to: string; children: React.ReactNode; active: boolean }) => (
  <Link
    to={to}
    className={cn(
      "text-sm font-medium transition-colors hover:text-white/90",
      active ? "text-white" : "text-white/60"
    )}
  >
    {children}
  </Link>
);