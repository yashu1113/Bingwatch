import { Link } from 'react-router-dom';
import { getImageUrl } from '@/services/tmdb';
import { useIsMobile } from '@/hooks/use-mobile';
import { cn } from '@/lib/utils';
import { Trash2, ImageIcon } from 'lucide-react';
import { useWatchlist } from '@/contexts/WatchlistContext';
import { useToast } from '@/hooks/use-toast';
import { useState } from 'react';
import { Skeleton } from '@/components/ui/skeleton';

interface MediaCardProps {
  id: number;
  title: string;
  posterPath: string;
  mediaType: 'movie' | 'tv';
  releaseDate?: string;
  voteAverage?: number;
  showDeleteButton?: boolean;
}

export const MediaCard = ({
  id,
  title,
  posterPath,
  mediaType,
  releaseDate,
  voteAverage,
  showDeleteButton = false,
}: MediaCardProps) => {
  const isMobile = useIsMobile();
  const { removeFromWatchlist } = useWatchlist();
  const { toast } = useToast();
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);

  const handleDelete = (e: React.MouseEvent) => {
    e.preventDefault();
    removeFromWatchlist(id);
    toast({
      title: "Removed from Watchlist",
      description: `${title} has been removed from your watchlist`,
    });
  };

  return (
    <Link
      to={`/${mediaType}/${id}`}
      className="group relative overflow-hidden rounded-lg transition-transform hover:scale-105 touch-manipulation w-full"
    >
      <div className="aspect-[2/3] w-full bg-gray-900 relative">
        {!imageLoaded && !imageError && (
          <Skeleton className="absolute inset-0 w-full h-full" />
        )}
        {imageError ? (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-800">
            <ImageIcon className="h-12 w-12 text-gray-400" />
          </div>
        ) : (
          <img
            src={getImageUrl(posterPath, 'w500')}
            alt={title}
            className={cn(
              "h-full w-full object-cover transition-opacity duration-300",
              !imageLoaded && "opacity-0"
            )}
            loading="lazy"
            onLoad={() => setImageLoaded(true)}
            onError={() => setImageError(true)}
          />
        )}
      </div>
      {showDeleteButton && (
        <button
          onClick={handleDelete}
          className={cn(
            "absolute right-2 top-2 z-10 rounded-full bg-black/80 p-2 text-white transition-opacity",
            isMobile ? "opacity-100" : "opacity-0 group-hover:opacity-100"
          )}
          aria-label={`Remove ${title} from watchlist`}
        >
          <Trash2 size={20} />
        </button>
      )}
      <div 
        className={cn(
          "absolute inset-0 bg-gradient-to-t from-black/80 to-transparent",
          isMobile ? "opacity-100" : "opacity-0 transition-opacity group-hover:opacity-100"
        )}
      >
        <div className="absolute bottom-0 p-4 text-white">
          <h3 className="text-lg font-bold line-clamp-2">{title}</h3>
          {releaseDate && (
            <p className="text-sm opacity-80">
              {new Date(releaseDate).getFullYear()}
            </p>
          )}
          {voteAverage && (
            <div className="mt-1 flex items-center gap-1">
              <span className="text-sm">★</span>
              <span className="text-sm">{voteAverage.toFixed(1)}</span>
            </div>
          )}
        </div>
      </div>
    </Link>
  );
};