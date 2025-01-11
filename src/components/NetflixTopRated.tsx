import { useQuery } from "@tanstack/react-query";
import { getTopRated } from "@/services/tmdb";
import { MediaCard } from "./MediaCard";
import { Button } from "./ui/button";
import { Skeleton } from "./ui/skeleton";
import { useState } from "react";
import { PlayCircle, TrendingUp } from "lucide-react";

export const NetflixTopRated = () => {
  const [mediaType, setMediaType] = useState<"movie" | "tv">("movie");

  const { data, isLoading } = useQuery({
    queryKey: ["netflix-top-rated", mediaType],
    queryFn: () => getTopRated(mediaType),
    refetchInterval: 300000, // Auto refresh every 5 minutes
  });

  if (isLoading) {
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
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold flex items-center gap-2">
          <TrendingUp className="text-netflix-red" />
          Netflix Top Rated
        </h2>
        <div className="flex gap-2">
          <Button
            variant={mediaType === "movie" ? "default" : "outline"}
            onClick={() => setMediaType("movie")}
            className="bg-netflix-red hover:bg-netflix-red/90"
          >
            <PlayCircle className="mr-2 h-4 w-4" />
            Movies
          </Button>
          <Button
            variant={mediaType === "tv" ? "default" : "outline"}
            onClick={() => setMediaType("tv")}
            className="bg-netflix-red hover:bg-netflix-red/90"
          >
            <PlayCircle className="mr-2 h-4 w-4" />
            TV Shows
          </Button>
        </div>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
        {data?.results.slice(0, 5).map((item) => (
          <div
            key={item.id}
            className="animate-fade-up hover:animate-glow transition-transform duration-300 hover:scale-105"
          >
            <MediaCard
              id={item.id}
              title={item.title || item.name || ""}
              posterPath={item.poster_path}
              mediaType={mediaType}
              releaseDate={item.release_date || item.first_air_date}
              voteAverage={item.vote_average}
            />
          </div>
        ))}
      </div>
    </section>
  );
};