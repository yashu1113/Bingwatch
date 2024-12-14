import { useQuery } from "@tanstack/react-query";
import { getGenres } from "@/services/tmdb";
import { Link } from "react-router-dom";
import { Skeleton } from "./ui/skeleton";
import { ScrollArea, ScrollBar } from "./ui/scroll-area";

export const Genres = () => {
  const { data: genresData, isLoading } = useQuery({
    queryKey: ["genres"],
    queryFn: () => getGenres(),
  });

  if (isLoading) {
    return (
      <div className="flex gap-4 overflow-x-auto pb-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <Skeleton key={i} className="h-24 w-40 flex-shrink-0 rounded-lg" />
        ))}
      </div>
    );
  }

  return (
    <ScrollArea className="w-full whitespace-nowrap">
      <div className="flex w-max space-x-4 p-4">
        {genresData?.genres.map((genre) => (
          <Link
            key={genre.id}
            to={`/genre/${genre.id}`}
            className="group relative h-24 w-40 flex-shrink-0 overflow-hidden rounded-lg bg-gradient-to-br from-purple-600 to-blue-700 transition-transform hover:scale-105"
          >
            <div className="absolute inset-0 flex items-center justify-center p-4">
              <span className="text-center text-lg font-bold text-white">
                {genre.name}
              </span>
            </div>
          </Link>
        ))}
      </div>
      <ScrollBar orientation="horizontal" />
    </ScrollArea>
  );
};