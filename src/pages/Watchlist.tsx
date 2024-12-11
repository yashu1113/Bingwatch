import { useWatchlist } from '@/contexts/WatchlistContext';
import { MediaGrid } from '@/components/MediaGrid';

const Watchlist = () => {
  const { watchlist } = useWatchlist();

  return (
    <main className="container py-8">
      <h1 className="mb-8 text-3xl font-bold text-white">My Watchlist</h1>
      {watchlist.length === 0 ? (
        <div className="text-center text-gray-400">
          <p>Your watchlist is empty</p>
        </div>
      ) : (
        <MediaGrid
          items={watchlist.map((item) => ({
            id: item.id,
            title: item.title,
            poster_path: item.posterPath,
            media_type: item.mediaType,
            showDeleteButton: true,
          }))}
        />
      )}
    </main>
  );
};

export default Watchlist;