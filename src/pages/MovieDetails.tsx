import { useQuery } from '@tanstack/react-query';
import { useParams } from 'react-router-dom';
import { getDetails } from '@/services/tmdb';
import { useWatchlist } from '@/contexts/WatchlistContext';
import { Button } from '@/components/ui/button';
import { Plus, Check } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

const MovieDetails = () => {
  const { id } = useParams<{ id: string }>();
  const { addToWatchlist, removeFromWatchlist, isInWatchlist } = useWatchlist();
  
  const { data: movie, isLoading } = useQuery({
    queryKey: ['movie', id],
    queryFn: () => getDetails('movie', Number(id)),
    enabled: !!id,
  });

  const handleWatchlistClick = () => {
    if (!movie) return;
    
    const inWatchlist = isInWatchlist(movie.id);
    if (inWatchlist) {
      removeFromWatchlist(movie.id);
      toast({
        title: "Removed from Watchlist",
        description: `${movie.title} has been removed from your watchlist`,
        variant: "default",
      });
    } else {
      addToWatchlist({
        id: movie.id,
        title: movie.title,
        posterPath: movie.poster_path,
        mediaType: 'movie'
      });
      toast({
        title: "Added to Watchlist",
        description: `${movie.title} has been added to your watchlist`,
        variant: "default",
        className: "animate-fade-in",
      });
    }
  };

  if (isLoading) {
    return (
      <div className="container py-8">
        <div className="animate-pulse space-y-4">
          <div className="h-8 w-1/3 bg-gray-800 rounded" />
          <div className="h-96 bg-gray-800 rounded" />
        </div>
      </div>
    );
  }

  if (!movie) {
    return (
      <div className="container py-8">
        <div className="text-center text-white">
          <h1 className="text-2xl font-bold">Movie not found</h1>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-netflix-black text-white">
      <div className="container py-8 space-y-8">
        <div className="grid gap-8 md:grid-cols-[300px,1fr]">
          <img
            src={`https://image.tmdb.org/t/p/w500${movie.poster_path}`}
            alt={movie.title}
            className="rounded-lg shadow-lg w-full"
          />
          <div className="space-y-4">
            <h1 className="text-4xl font-bold">{movie.title}</h1>
            <p className="text-lg text-gray-400">{movie.overview}</p>
            <div className="flex flex-wrap gap-2">
              {movie.genres?.map((genre) => (
                <span
                  key={genre.id}
                  className="rounded-full bg-gray-800 px-3 py-1 text-sm"
                >
                  {genre.name}
                </span>
              ))}
            </div>
            <div className="space-y-2">
              <p>Release Date: {movie.release_date}</p>
              <p>Rating: ★ {movie.vote_average?.toFixed(1)}</p>
              {movie.runtime && <p>Runtime: {movie.runtime} minutes</p>}
            </div>
            <Button
              onClick={handleWatchlistClick}
              variant={isInWatchlist(movie.id) ? "secondary" : "default"}
              className="w-full md:w-auto"
            >
              {isInWatchlist(movie.id) ? (
                <>
                  <Check className="mr-2 h-4 w-4" />
                  In Watchlist
                </>
              ) : (
                <>
                  <Plus className="mr-2 h-4 w-4" />
                  Add to Watchlist
                </>
              )}
            </Button>
          </div>
        </div>

        {movie.videos?.results?.length > 0 && (
          <section className="space-y-4">
            <h2 className="text-2xl font-bold">Trailer</h2>
            <div className="aspect-video">
              <iframe
                className="w-full h-full rounded-lg"
                src={`https://www.youtube.com/embed/${movie.videos.results[0].key}`}
                title="Movie Trailer"
                allowFullScreen
              />
            </div>
          </section>
        )}
      </div>
    </div>
  );
};

export default MovieDetails;