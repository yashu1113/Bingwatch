import { useQuery } from "@tanstack/react-query";
import { getUpcomingMovies } from "@/services/tmdb";
import { MovieCarousel } from "./MovieCarousel";

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
    <section className="space-y-6">
      <h2 className="text-3xl font-bold">Coming Soon</h2>
      <MovieCarousel
        items={moviesWithoutReminder || []}
        isLoading={isLoading}
      />
    </section>
  );
};