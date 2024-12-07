import { useWatchlist } from '../hooks/useWatchlist';
import { MediaGrid } from '../components/MediaGrid';

export function Watchlist() {
  const { watchlist } = useWatchlist();

  if (watchlist.length === 0) {
    return (
      <div className="text-center py-8">
        <h2 className="text-2xl font-bold mb-4">Your Watchlist</h2>
        <p className="text-gray-400">Your watchlist is empty</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <h2 className="text-2xl font-bold">Your Watchlist</h2>
      <MediaGrid items={watchlist.map(item => ({
        ...item,
        poster_path: item.posterPath,
        media_type: item.mediaType,
        vote_average: item.rating
      }))} />
    </div>
  );
}