import { useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { getMoviesByGenre } from '@/services/tmdb';
import { MediaGrid } from '@/components/MediaGrid';
import { NotFound } from '@/components/NotFound';

const GenrePage = () => {
  const { id } = useParams<{ id: string }>();

  const { data: movies, isLoading } = useQuery({
    queryKey: ['movies', 'genre', id],
    queryFn: () => getMoviesByGenre(Number(id)),
    enabled: !!id,
  });

  if (isLoading) {
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

  if (!movies?.results?.length) {
    return <NotFound message="No movies found for this genre" />;
  }

  return (
    <div className="container py-8 mt-20">
      <MediaGrid items={movies.results.map(item => ({ ...item, media_type: 'movie' }))} />
    </div>
  );
};

export default GenrePage;