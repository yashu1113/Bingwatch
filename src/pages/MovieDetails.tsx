import { useQuery } from '@tanstack/react-query';
import { useParams, useNavigate } from 'react-router-dom';
import { getDetails } from '@/services/tmdb';
import { MovieCarousel } from '@/components/MovieCarousel';
import { DetailHeader } from '@/components/details/DetailHeader';
import { VideoSection } from '@/components/details/VideoSection';
import { StreamingButtons } from '@/components/StreamingButtons';
import { useToast } from '@/hooks/use-toast';

const MovieDetails = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const { data: movie, isLoading, isError } = useQuery({
    queryKey: ['movie', id],
    queryFn: () => getDetails('movie', Number(id)),
    enabled: !!id,
    meta: {
      onError: () => {
        toast({
          title: "Error",
          description: "Failed to load movie details. Please try again later.",
          variant: "destructive",
        });
        navigate('/movies');
      }
    }
  });

  if (isLoading) {
    return (
      <div className="container py-4 md:py-8">
        <div className="animate-pulse space-y-4">
          <div className="h-8 w-1/3 bg-gray-800 rounded" />
          <div className="h-96 bg-gray-800 rounded" />
        </div>
      </div>
    );
  }

  if (isError || !movie) {
    return (
      <div className="container py-4 md:py-8">
        <div className="text-center text-white">
          <h1 className="text-2xl font-bold">Movie not found</h1>
        </div>
      </div>
    );
  }

  const trailer = movie.videos?.results?.find(
    (video) => video.type === "Trailer"
  );

  const videos = movie.videos?.results?.filter(
    (video) => video.site === "YouTube"
  ) || [];

  return (
    <div className="min-h-screen bg-netflix-black text-white">
      <div className="container mx-auto px-4 py-4 md:py-8 space-y-6 md:space-y-8">
        <DetailHeader
          id={movie.id}
          title={movie.title}
          overview={movie.overview}
          posterPath={movie.poster_path}
          genres={movie.genres}
          releaseDate={movie.release_date}
          voteAverage={movie.vote_average}
          runtime={movie.runtime}
          trailer={trailer}
          mediaType="movie"
        />

        <StreamingButtons mediaType="movie" id={movie.id} />

        <VideoSection videos={videos} />

        {movie?.similar?.results?.length > 0 && (
          <section className="space-y-4">
            <h2 className="text-xl md:text-2xl font-bold">Similar Movies</h2>
            <MovieCarousel 
              items={movie.similar.results.map(item => ({
                ...item,
                media_type: 'movie'
              }))} 
            />
          </section>
        )}

        {movie?.recommendations?.results?.length > 0 && (
          <section className="space-y-4">
            <h2 className="text-xl md:text-2xl font-bold">Recommended Movies</h2>
            <MovieCarousel 
              items={movie.recommendations.results.map(item => ({
                ...item,
                media_type: 'movie'
              }))} 
            />
          </section>
        )}
      </div>
    </div>
  );
};

export default MovieDetails;