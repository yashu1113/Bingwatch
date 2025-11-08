import { useQuery } from '@tanstack/react-query';
import { useParams, useNavigate } from 'react-router-dom';
import { getDetails } from '@/services/tmdb';
import { MovieCarousel } from '@/components/MovieCarousel';
import { DetailHeader } from '@/components/details/DetailHeader';
import { VideoSection } from '@/components/details/VideoSection';
import { useToast } from '@/hooks/use-toast';
import { LoadingGrid } from '@/components/LoadingGrid';

const MovieDetails = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const { data: movie, isLoading, isError } = useQuery({
    queryKey: ['movie', id],
    queryFn: () => getDetails('movie', Number(id)),
    enabled: !!id,
    staleTime: 1000 * 60 * 5,
    retry: 3,
    retryDelay: 1000,
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
      <div className="container py-20 md:py-24">
        <LoadingGrid count={1} className="max-w-4xl mx-auto" />
      </div>
    );
  }

  if (isError || !movie) {
    return (
      <div className="container py-20 md:py-24">
        <div className="text-center text-white">
          <h1 className="text-2xl font-bold">Movie not found</h1>
          <p className="mt-2 text-gray-400">Please try again later</p>
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
    <div className="min-h-screen bg-netflix-black text-white pt-20 md:pt-24">
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
          isInTheaters={movie.isInTheaters}
          cast={movie.credits?.cast}
          spokenLanguages={movie.spoken_languages}
          originalLanguage={movie.original_language}
        />

        <VideoSection videos={videos} />

        {movie?.similar?.results?.length > 0 && (
          <section className="space-y-4">
            <h2 className="text-xl md:text-2xl font-bold">Similar Movies</h2>
            <MovieCarousel 
              items={movie.similar.results.map(item => ({
                ...item,
                media_type: 'movie'
              }))}
              isLoading={isLoading}
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
              isLoading={isLoading}
            />
          </section>
        )}
      </div>
    </div>
  );
};

export default MovieDetails;