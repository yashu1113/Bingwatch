
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

  // Use backdrop_path for horizontal image if available, fallback to poster_path
  const backgroundImage = movie.backdrop_path 
    ? `https://image.tmdb.org/t/p/original${movie.backdrop_path}`
    : (movie.poster_path ? `https://image.tmdb.org/t/p/original${movie.poster_path}` : '');

  return (
    <div className="min-h-screen bg-netflix-black text-white">
      {/* Full screen background header section */}
      <div 
        className="relative w-full pt-16 md:pt-0"
        style={{
          backgroundImage: `url(${backgroundImage})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center top',
          minHeight: '90vh',
        }}
      > 
        {/* Gradient overlay for better text readability */}
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/80 to-transparent"></div>
        
        <div className="relative z-10 md:pt-20">
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
          />
        </div>
      </div>

      {/* Content with regular container padding */}
      <div className="container mx-auto px-4 py-4 md:py-8 space-y-8 md:space-y-12">
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
