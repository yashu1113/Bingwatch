
import { useQuery } from '@tanstack/react-query';
import { useParams, useNavigate } from 'react-router-dom';
import { getDetails } from '@/services/tmdb';
import { MovieCarousel } from '@/components/MovieCarousel';
import { DetailHeader } from '@/components/details/DetailHeader';
import { VideoSection } from '@/components/details/VideoSection';
import { useToast } from '@/hooks/use-toast';
import { LoadingGrid } from '@/components/LoadingGrid';

const TVShowDetails = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
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

  if (isLoading) {
    return (
      <div className="container py-20 md:py-24">
        <LoadingGrid count={1} className="max-w-4xl mx-auto" />
      </div>
    );
  }

  if (isError || !show) {
    return (
      <div className="container py-20 md:py-24">
        <div className="text-center text-white">
          <h1 className="text-2xl font-bold">TV Show not found</h1>
          <p className="mt-2 text-gray-400">Please try again later</p>
        </div>
      </div>
    );
  }

  const trailer = show.videos?.results?.find(
    (video) => video.type === "Trailer"
  );

  const videos = show.videos?.results?.filter(
    (video) => video.site === "YouTube"
  ) || [];

  // Format seasons data for the streaming controls
  const formattedSeasons = show.seasons
    ? show.seasons.filter(season => 
        season.season_number > 0 && season.episode_count > 0
      ).map(season => ({
        season_number: season.season_number,
        name: season.name,
        episode_count: season.episode_count
      }))
    : [];

  return (
    <div className="min-h-screen bg-netflix-black text-white pt-20 md:pt-24">
      <div className="container mx-auto px-4 py-4 md:py-8 space-y-6 md:space-y-8">
        <DetailHeader
          id={show.id}
          title={show.name}
          overview={show.overview}
          posterPath={show.poster_path}
          genres={show.genres}
          releaseDate={show.first_air_date}
          voteAverage={show.vote_average}
          trailer={trailer}
          mediaType="tv"
          cast={show.credits?.cast}
          seasons={formattedSeasons.length > 0 ? formattedSeasons : undefined}
        />

        <VideoSection videos={videos} />

        {show?.similar?.results?.length > 0 && (
          <section className="space-y-4">
            <h2 className="text-xl md:text-2xl font-bold">Similar TV Shows</h2>
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
            <h2 className="text-xl md:text-2xl font-bold">Recommended TV Shows</h2>
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
