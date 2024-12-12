import { useQuery } from '@tanstack/react-query';
import { useParams, useNavigate } from 'react-router-dom';
import { getDetails } from '@/services/tmdb';
import { useWatchlist } from '@/contexts/WatchlistContext';
import { Button } from '@/components/ui/button';
import { Plus, Check, Play } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const TVShowDetails = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { addToWatchlist, removeFromWatchlist, isInWatchlist } = useWatchlist();
  const { toast } = useToast();
  
  const { data: show, isLoading, isError } = useQuery({
    queryKey: ['tv', id],
    queryFn: () => getDetails('tv', Number(id)),
    enabled: !!id,
    meta: {
      onError: () => {
        toast({
          title: "Error",
          description: "Failed to load TV show details. Please try again later.",
          variant: "destructive",
        });
        navigate('/tv');
      }
    }
  });

  const handleWatchlistClick = () => {
    if (!show) return;
    
    const inWatchlist = isInWatchlist(show.id);
    if (inWatchlist) {
      removeFromWatchlist(show.id);
      toast({
        title: "Removed from Watchlist",
        description: `${show.name} has been removed from your watchlist`,
      });
    } else {
      addToWatchlist({
        id: show.id,
        title: show.name,
        posterPath: show.poster_path,
        mediaType: 'tv'
      });
      toast({
        title: "Added to Watchlist",
        description: `${show.name} has been added to your watchlist`,
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

  if (isError || !show) {
    return (
      <div className="container py-8">
        <div className="text-center text-white">
          <h1 className="text-2xl font-bold">TV Show not found</h1>
          <Button 
            onClick={() => navigate('/tv')} 
            className="mt-4"
          >
            Back to TV Shows
          </Button>
        </div>
      </div>
    );
  }

  const trailer = show.videos?.results?.find(
    (video) => video.type === "Trailer"
  );

  return (
    <div className="min-h-screen bg-netflix-black text-white">
      <div className="container mx-auto px-4 py-8 space-y-8">
        <div className="grid gap-8 md:grid-cols-[300px,1fr]">
          <img
            src={`https://image.tmdb.org/t/p/w500${show.poster_path}`}
            alt={show.name}
            className="rounded-lg shadow-lg w-full"
          />
          <div className="space-y-4">
            <h1 className="text-4xl font-bold">{show.name}</h1>
            <p className="text-lg text-gray-400">{show.overview}</p>
            <div className="flex flex-wrap gap-2">
              {show.genres?.map((genre) => (
                <span
                  key={genre.id}
                  className="rounded-full bg-gray-800 px-3 py-1 text-sm"
                >
                  {genre.name}
                </span>
              ))}
            </div>
            <div className="space-y-2">
              <p>First Air Date: {show.first_air_date}</p>
              <p>Episodes: {show.number_of_episodes}</p>
              <p>Seasons: {show.number_of_seasons}</p>
              <p>Rating: ★ {show.vote_average?.toFixed(1)}</p>
            </div>
            <div className="flex flex-wrap gap-4">
              {trailer && (
                <Button
                  onClick={() => window.open(`https://www.youtube.com/watch?v=${trailer.key}`, '_blank')}
                  className="bg-netflix-red hover:bg-netflix-red/90"
                >
                  <Play className="mr-2 h-4 w-4" />
                  Watch Trailer
                </Button>
              )}
              <Button
                onClick={handleWatchlistClick}
                variant={isInWatchlist(show.id) ? "secondary" : "default"}
                className="w-full md:w-auto"
              >
                {isInWatchlist(show.id) ? (
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
        </div>

        {show?.similar?.results?.length > 0 && (
          <section className="space-y-4">
            <h2 className="text-2xl font-bold">Similar TV Shows</h2>
            <MovieCarousel 
              items={show.similar.results.map(item => ({
                ...item,
                media_type: 'tv'
              }))} 
            />
          </section>
        )}

        {show?.recommendations?.results?.length > 0 && (
          <section className="space-y-4">
            <h2 className="text-2xl font-bold">Recommended TV Shows</h2>
            <MovieCarousel 
              items={show.recommendations.results.map(item => ({
                ...item,
                media_type: 'tv'
              }))} 
            />
          </section>
        )}
      </div>
    </div>
  );
};

export default TVShowDetails;
