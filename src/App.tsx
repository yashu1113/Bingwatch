import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Index from "./pages/Index";
import Search from "./pages/Search";
import Movies from "./pages/Movies";
import MovieDetails from "./pages/MovieDetails";
import TVShows from "./pages/TVShows";
import TVShowDetails from "./pages/TVShowDetails";
import Watchlist from "./pages/Watchlist";
import { Navigation } from "./components/Navigation";
import { WatchlistProvider } from "./contexts/WatchlistContext";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5,
      retry: 2,
      refetchOnWindowFocus: false,
    },
  },
});

const App = () => {
  return (
    <BrowserRouter>
      <QueryClientProvider client={queryClient}>
        <WatchlistProvider>
          <TooltipProvider>
            <Toaster />
            <Sonner />
            <div className="min-h-screen bg-netflix-black">
              <Navigation />
              <Routes>
                <Route path="/" element={<Index />} />
                <Route path="/search" element={<Search />} />
                <Route path="/movies" element={<Movies />} />
                <Route path="/movie/:id" element={<MovieDetails />} />
                <Route path="/tv" element={<TVShows />} />
                <Route path="/tv/:id" element={<TVShowDetails />} />
                <Route path="/watchlist" element={<Watchlist />} />
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </div>
          </TooltipProvider>
        </WatchlistProvider>
      </QueryClientProvider>
    </BrowserRouter>
  );
};

export default App;