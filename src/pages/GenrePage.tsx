import { useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { getMoviesByGenre, getTVShowsByGenre } from '@/services/tmdb';
import { MediaGrid } from '@/components/MediaGrid';
import { NotFound } from '@/components/NotFound';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const GenrePage = () => {
  const { id } = useParams<{ id: string }>();

  const { data: movies, isLoading: moviesLoading } = useQuery({
    queryKey: ['movies', 'genre', id],
    queryFn: () => getMoviesByGenre(Number(id)),
    enabled: !!id,
  });

  const { data: tvShows, isLoading: tvShowsLoading } = useQuery({
    queryKey: ['tv', 'genre', id],
    queryFn: () => getTVShowsByGenre(Number(id)),
    enabled: !!id,
  });

  if (moviesLoading || tvShowsLoading) {
    return (
      <div className="container py-8 mt-20">
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
          {Array.from({ length: 10 }).map((_, i) => (
            <div
              key={i}
              className="aspect-[2/3] animate-pulse rounded-lg bg-gray-800"
            />
          ))}
        </div>
      </div>
    );
  }

  if (!movies?.results?.length && !tvShows?.results?.length) {
    return <NotFound message="No content found for this genre" />;
  }

  return (
    <div className="container py-8 mt-20">
      <Tabs defaultValue="movies" className="w-full space-y-6">
        <TabsList className="grid w-full max-w-[400px] grid-cols-2">
          <TabsTrigger value="movies" className="text-lg">Movies</TabsTrigger>
          <TabsTrigger value="tv" className="text-lg">TV Shows</TabsTrigger>
        </TabsList>
        <TabsContent value="movies">
          <MediaGrid items={movies?.results.map(item => ({ ...item, media_type: 'movie' })) || []} />
        </TabsContent>
        <TabsContent value="tv">
          <MediaGrid items={tvShows?.results.map(item => ({ ...item, media_type: 'tv' })) || []} />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default GenrePage;