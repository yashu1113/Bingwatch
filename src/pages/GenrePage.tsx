import { useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { getMoviesByGenre } from "@/services/tmdb";
import { MediaGrid } from "@/components/MediaGrid";
import { NotFound } from "@/components/NotFound";
import { Skeleton } from "@/components/ui/skeleton";

const GenrePage = () => {
  const { id } = useParams<{ id: string }>();
  
  const { data, isLoading } = useQuery({
    queryKey: ["genre", id],
    queryFn: () => getMoviesByGenre(Number(id)),
    enabled: !!id,
  });

  if (isLoading) {
    return (
      <div className="container grid grid-cols-2 gap-4 py-8 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
        {Array.from({ length: 10 }).map((_, i) => (
          <Skeleton key={i} className="aspect-[2/3] rounded-lg" />
        ))}
      </div>
    );
  }

  if (!data?.results?.length) {
    return <NotFound />;
  }

  return (
    <div className="container py-8">
      <h1 className="mb-8 text-2xl font-bold text-white md:text-3xl">
        {data.results[0]?.genre_ids ? "Genre Results" : "No results found"}
      </h1>
      <MediaGrid items={data.results.map(item => ({ ...item, media_type: 'movie' }))} />
    </div>
  );
};

export default GenrePage;