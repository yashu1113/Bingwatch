import { useQuery } from "@tanstack/react-query";
import { getUpcomingMovies } from "@/services/tmdb";
import { MovieCarousel } from "./MovieCarousel";
import { ChevronRight } from "lucide-react";

export const UpcomingMovies = () => {
  const { data: upcomingMovies, isLoading } = useQuery({
    queryKey: ["movies", "upcoming"],
    queryFn: getUpcomingMovies,
  });

  const moviesWithoutReminder = upcomingMovies?.results.map((movie) => ({
    ...movie,
    media_type: "movie" as const,
  }));

  return (
    <section className="space-y-6 relative">
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-bold">Coming Soon</h2>
        <button className="hidden md:flex items-center gap-1 px-4 py-1.5 text-sm font-medium text-white bg-netflix-black rounded-full">
          See all <ChevronRight className="w-4 h-4" />
        </button>
      </div>
      <MovieCarousel
        items={moviesWithoutReminder || []}
        isLoading={isLoading}
      />
    </section>
  );
};