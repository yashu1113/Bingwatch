import { useQuery } from "@tanstack/react-query";
import { getTrending } from "@/services/tmdb";
import { MediaCard } from "./MediaCard";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "./ui/skeleton";

export const HighlightsSection = () => {
  const { data: dailyTrending, isLoading: isDailyLoading } = useQuery({
    queryKey: ["trending", "all", "day"],
    queryFn: () => getTrending("all", "day"),
  });

  const { data: weeklyTrending, isLoading: isWeeklyLoading } = useQuery({
    queryKey: ["trending", "all", "week"],
    queryFn: () => getTrending("all", "week"),
  });

  if (isDailyLoading || isWeeklyLoading) {
    return (
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="space-y-4">
            <Skeleton className="aspect-[2/3] w-full rounded-lg" />
            <div className="space-y-2">
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-4 w-1/2" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <section className="space-y-6">
      <h2 className="text-3xl font-bold">Highlights</h2>
      <Tabs defaultValue="daily" className="space-y-6">
        <TabsList className="grid w-full max-w-[400px] grid-cols-2">
          <TabsTrigger value="daily">Today's Hits</TabsTrigger>
          <TabsTrigger value="weekly">This Week's Best</TabsTrigger>
        </TabsList>
        <TabsContent value="daily" className="space-y-4">
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {dailyTrending?.results.slice(0, 5).map((item) => (
              <div
                key={item.id}
                className="animate-fade-up hover:animate-glow"
              >
                <MediaCard
                  id={item.id}
                  title={item.title || item.name || ""}
                  posterPath={item.poster_path}
                  mediaType={item.media_type || "movie"}
                  releaseDate={item.release_date || item.first_air_date}
                  voteAverage={item.vote_average}
                />
              </div>
            ))}
          </div>
        </TabsContent>
        <TabsContent value="weekly" className="space-y-4">
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {weeklyTrending?.results.slice(0, 5).map((item) => (
              <div
                key={item.id}
                className="animate-fade-up hover:animate-glow"
              >
                <MediaCard
                  id={item.id}
                  title={item.title || item.name || ""}
                  posterPath={item.poster_path}
                  mediaType={item.media_type || "movie"}
                  releaseDate={item.release_date || item.first_air_date}
                  voteAverage={item.vote_average}
                />
              </div>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </section>
  );
};