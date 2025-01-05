import { useQuery } from "@tanstack/react-query";
import { getUpcomingMovies } from "@/services/tmdb";
import { MovieCarousel } from "./MovieCarousel";
import { useToast } from "@/hooks/use-toast";
import { Button } from "./ui/button";
import { Bell } from "lucide-react";

export const UpcomingMovies = () => {
  const { toast } = useToast();
  const { data: upcomingMovies, isLoading } = useQuery({
    queryKey: ["movies", "upcoming"],
    queryFn: getUpcomingMovies,
  });

  const handleSetReminder = (title: string, releaseDate: string) => {
    toast({
      title: "Reminder Set",
      description: `We'll remind you when ${title} releases on ${new Date(releaseDate).toLocaleDateString()}`,
    });
  };

  const moviesWithReminder = upcomingMovies?.results.map((movie) => ({
    ...movie,
    media_type: "movie" as const,
    CustomActions: () => (
      <Button
        size="sm"
        variant="secondary"
        className="mt-2 w-full gap-2"
        onClick={(e) => {
          e.preventDefault();
          handleSetReminder(movie.title || "", movie.release_date || "");
        }}
      >
        <Bell className="h-4 w-4" />
        Set Reminder
      </Button>
    ),
  }));

  return (
    <section className="space-y-6">
      <h2 className="text-3xl font-bold">Coming Soon</h2>
      <MovieCarousel
        items={moviesWithReminder || []}
        isLoading={isLoading}
        showCustomActions
      />
    </section>
  );
};