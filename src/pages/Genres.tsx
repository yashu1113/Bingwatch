import { useQuery } from '@tanstack/react-query';
import { getGenres, getMoviesByGenre } from '@/services/tmdb';
import { MediaGrid } from '@/components/MediaGrid';
import { useState } from 'react';
import { Button } from '@/components/ui/button';

const Genres = () => {
  const [selectedGenre, setSelectedGenre] = useState<number | null>(null);

  const { data: genres, isLoading: genresLoading } = useQuery({
    queryKey: ['genres'],
    queryFn: getGenres,
  });

  const { data: movies, isLoading: moviesLoading } = useQuery({
    queryKey: ['movies', 'genre', selectedGenre],
    queryFn: () => getMoviesByGenre(selectedGenre!),
    enabled: !!selectedGenre,
  });

  return (
    <div className="container py-8">
      <h1 className="mb-8 text-3xl font-bold">Movie Genres</h1>
      
      <div className="mb-8 flex flex-wrap gap-2">
        {genresLoading ? (
          <div className="h-10 w-24 animate-pulse rounded-lg bg-gray-800" />
        ) : (
          genres?.genres.map((genre: { id: number; name: string }) => (
            <Button
              key={genre.id}
              variant={selectedGenre === genre.id ? "default" : "outline"}
              onClick={() => setSelectedGenre(genre.id)}
            >
              {genre.name}
            </Button>
          ))
        )}
      </div>

      {selectedGenre && (
        <div className="space-y-6">
          {moviesLoading ? (
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
              {Array.from({ length: 10 }).map((_, i) => (
                <div
                  key={i}
                  className="aspect-[2/3] animate-pulse rounded-lg bg-gray-800"
                />
              ))}
            </div>
          ) : (
            <MediaGrid items={movies?.results || []} />
          )}
        </div>
      )}
    </div>
  );
};

export default Genres;