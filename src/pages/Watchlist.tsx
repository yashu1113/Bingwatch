import { useWatchlist } from '@/contexts/WatchlistContext';
import { MediaGrid } from '@/components/MediaGrid';
import { Plus } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';

const Watchlist = () => {
  const { watchlist } = useWatchlist();

  return (
    <main className="container py-8 mt-[80px]">
      <h1 className="mb-8 text-3xl font-bold text-white">My Watchlist</h1>
      {watchlist.length === 0 ? (
        <div className="flex flex-col items-center justify-center space-y-4 text-center py-12">
          <p className="text-xl text-gray-400">Your watchlist is empty</p>
          <p className="text-gray-500">Start adding your favorite movies and shows!</p>
          <Button asChild className="mt-4">
            <Link to="/">
              <Plus className="mr-2 h-4 w-4" />
              Browse Content
            </Link>
          </Button>
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