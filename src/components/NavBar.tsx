import { Link } from "react-router-dom";
import { Film, Bookmark } from "lucide-react";
import { SearchBar } from "./SearchBar";

export function NavBar() {
  return (
    <nav className="sticky top-0 z-50 bg-gray-900/95 backdrop-blur supports-[backdrop-filter]:bg-gray-900/75">
      <div className="container mx-auto flex items-center justify-between gap-4 px-4 py-4">
        <Link to="/" className="flex items-center gap-2 text-xl font-bold">
          <Film className="h-6 w-6" />
          <span>BingWatch</span>
        </Link>

        <SearchBar />

        <Link
          to="/watchlist"
          className="flex items-center gap-2 rounded-full bg-white/10 px-4 py-2 font-medium hover:bg-white/20"
        >
          <Bookmark className="h-4 w-4" />
          <span>Watchlist</span>
        </Link>
      </div>
    </nav>
  );
}
