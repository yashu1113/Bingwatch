import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Bookmark } from 'lucide-react';
import { getDetails, getSimilar, getImageUrl } from '../services/api';
import { MediaGrid } from '../components/MediaGrid';
import { useWatchlist } from '../hooks/useWatchlist';
import { formatDate } from '../lib/utils';

export function Details() {
  const { mediaType, id } = useParams();
  const [details, setDetails] = useState<any>(null);
  const [similar, setSimilar] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { addToWatchlist, removeFromWatchlist, isInWatchlist } = useWatchlist();

  useEffect(() => {
    const fetchDetails = async () => {
      if (!mediaType || !id) return;
      
      try {
        setIsLoading(true);
        const [detailsData, similarData] = await Promise.all([
          getDetails(mediaType as 'movie' | 'tv', id),
          getSimilar(mediaType as 'movie' | 'tv', id)
        ]);
        setDetails(detailsData);
        setSimilar(similarData.results);
      } catch (err) {
        setError('Failed to fetch details');
      } finally {
        setIsLoading(false);
      }
    };

    fetchDetails();
  }, [mediaType, id]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-white"></div>
      </div>
    );
  }

  if (error || !details) {
    return (
      <div className="text-center text-red-400 py-8">
        <p>{error || 'Failed to load content'}</p>
      </div>
    );
  }

  const isInList = isInWatchlist(details.id);

  const handleWatchlist = () => {
    if (isInList) {
      removeFromWatchlist(details.id);
    } else {
      addToWatchlist({
        id: details.id,
        title: details.title || details.name,
        posterPath: details.poster_path,
        mediaType: mediaType as 'movie' | 'tv',
        rating: details.vote_average
      });
    }
  };

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 gap-8 md:grid-cols-[300px_1fr]">
        <img
          src={getImageUrl(details.poster_path, 'original')}
          alt={details.title || details.name}
          className="rounded-lg shadow-lg"
        />
        <div className="space-y-4">
          <h1 className="text-4xl font-bold">{details.title || details.name}</h1>
          <p className="text-gray-400">{formatDate(details.release_date || details.first_air_date)}</p>
          <div className="flex gap-2">
            {details.genres?.map((genre: any) => (
              <span
                key={genre.id}
                className="rounded-full bg-white/10 px-3 py-1 text-sm"
              >
                {genre.name}
              </span>
            ))}
          </div>
          <p className="text-lg">{details.overview}</p>
          <button
            onClick={handleWatchlist}
            className="flex items-center gap-2 rounded-full bg-white/10 px-4 py-2 font-medium hover:bg-white/20"
          >
            <Bookmark className={isInList ? 'fill-current' : ''} />
            {isInList ? 'Remove from Watchlist' : 'Add to Watchlist'}
          </button>
        </div>
      </div>

      <section>
        <h2 className="text-2xl font-bold mb-4">Similar Titles</h2>
        <MediaGrid items={similar} />
      </section>
    </div>
  );
}