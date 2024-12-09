import { useQuery } from '@tanstack/react-query';
import { useParams } from 'react-router-dom';
import { getDetails } from '@/services/tmdb';
import { MovieCarousel } from '@/components/MovieCarousel';

const TVShowDetails = () => {
  const { id } = useParams<{ id: string }>();
  
  const { data: show, isLoading } = useQuery({
    queryKey: ['tv', id],
    queryFn: () => getDetails('tv', Number(id)),
    enabled: !!id,
  });

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

  if (!show) {
    return (
      <div className="container py-8">
        <div className="text-center text-white">
          <h1 className="text-2xl font-bold">TV Show not found</h1>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-netflix-black text-white">
      <div className="container py-8 space-y-8">
        <div className="grid gap-8 md:grid-cols-[300px,1fr]">
          <img
            src={`https://image.tmdb.org/t/p/w500${show.poster_path}`}
            alt={show.name}
            className="rounded-lg shadow-lg"
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
          </div>
        </div>

        {show.recommendations?.results?.length > 0 && (
          <section className="space-y-4">
            <h2 className="text-2xl font-bold">Recommended Shows</h2>
            <MovieCarousel items={show.recommendations.results} />
          </section>
        )}
      </div>
    </div>
  );
};

export default TVShowDetails;