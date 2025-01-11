import { useQuery } from "@tanstack/react-query";
import { getTrending } from "@/services/tmdb";
import { MovieCarousel } from "./MovieCarousel";
import { Button } from "./ui/button";
import { useState } from "react";

export const NetflixTrending = () => {
  const [mediaType, setMediaType] = useState<"movie" | "tv">("movie");

  const { data: trendingData, isLoading } = useQuery({
    queryKey: ["netflix-trending", mediaType],
    queryFn: () => getTrending(mediaType),
    refetchInterval: 300000, // Refetch every 5 minutes
  });

  // Filter for Netflix content only
  const netflixContent = trendingData?.results?.filter(
    (item) => item.origin_country?.includes("US") || item.production_companies?.some(company => company.name === "Netflix")
  ) || [];

  return (
    <section className="space-y-6 animate-fade-up">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold">Trending on Netflix</h2>
        <div className="flex gap-2">
          <Button
            variant={mediaType === "movie" ? "default" : "outline"}
            onClick={() => setMediaType("movie")}
            className="bg-netflix-red hover:bg-netflix-red/90"
          >
            Movies
          </Button>
          <Button
            variant={mediaType === "tv" ? "default" : "outline"}
            onClick={() => setMediaType("tv")}
            className="bg-netflix-red hover:bg-netflix-red/90"
          >
            TV Shows
          </Button>
        </div>
      </div>
      <MovieCarousel
        items={netflixContent}
        isLoading={isLoading}
        autoPlay={true}
      />
    </section>
  );
};