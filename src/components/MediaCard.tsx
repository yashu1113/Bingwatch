import { Link } from 'react-router-dom';
import { getImageUrl } from '@/services/tmdb';
import { useIsMobile } from '@/hooks/use-mobile';
import { cn } from '@/lib/utils';
import { Trash2, ImageIcon, Star } from 'lucide-react';
import { useWatchlist } from '@/contexts/WatchlistContext';
import { useToast } from '@/hooks/use-toast';
import { useState } from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface MediaCardProps {
  id: number;
  title: string;
  posterPath: string;
  mediaType: 'movie' | 'tv';
  releaseDate?: string;
  voteAverage?: number;
  showDeleteButton?: boolean;
  CustomActions?: React.ComponentType;
}

export const MediaCard = ({
  id,
  title,
  posterPath,
  mediaType,
  releaseDate,
  voteAverage,
  showDeleteButton = false,
  CustomActions,
}: MediaCardProps) => {
  const isMobile = useIsMobile();
  const { removeFromWatchlist } = useWatchlist();
  const { toast } = useToast();
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);
  const [userRating, setUserRating] = useState<number | null>(null);
  const [isRating, setIsRating] = useState(false);

  const handleDelete = (e: React.MouseEvent) => {
    e.preventDefault();
    removeFromWatchlist(id);
    toast({
      title: "Removed from Watchlist",
      description: `${title} has been removed from your watchlist`,
    });
  };

  const handleRate = (e: React.MouseEvent, rating: number) => {
    e.preventDefault();
    setUserRating(rating);
    toast({
      title: "Rating Submitted",
      description: `You rated ${title} ${rating} stars`,
    });
  };

  const DeleteButton = () => (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <button
            onClick={handleDelete}
            className={cn(
              "absolute right-2 top-2 z-10 rounded-full bg-black/80 p-2.5 text-white transition-all hover:bg-black/90",
              isMobile ? "opacity-100" : "opacity-0 group-hover:opacity-100"
            )}
            aria-label={`Remove ${title} from watchlist`}
          >
            <Trash2 className="h-5 w-5" />
          </button>
        </TooltipTrigger>
        <TooltipContent>
          <p>Remove from Watchlist</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );

  const RatingStars = () => (
    <div 
      className={cn(
        "absolute bottom-20 left-0 right-0 flex justify-center gap-1 z-20",
        isMobile ? "opacity-100" : "opacity-0 group-hover:opacity-100"
      )}
      onMouseEnter={() => setIsRating(true)}
      onMouseLeave={() => setIsRating(false)}
    >
      {[1, 2, 3, 4, 5].map((rating) => (
        <button
          key={rating}
          onClick={(e) => handleRate(e, rating)}
          className={cn(
            "p-1 transition-transform hover:scale-125",
            (userRating && rating <= userRating) ? "text-yellow-400" : "text-white"
          )}
        >
          <Star className="h-6 w-6 fill-current" />
        </button>
      ))}
    </div>
  );

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
      {showDeleteButton && <DeleteButton />}
      <RatingStars />
      <div 
        className={cn(
          "absolute inset-0 bg-gradient-to-t from-black/80 to-transparent",
          isMobile || isRating ? "opacity-100" : "opacity-0 transition-opacity group-hover:opacity-100"
        )}
      >
        <div className="absolute bottom-0 p-4 text-white w-full">
          <h3 className="text-lg font-bold line-clamp-2">{title}</h3>
          {releaseDate && (
            <p className="text-sm opacity-80">
              {new Date(releaseDate).getFullYear()}
            </p>
          )}
          <div className="mt-1 flex items-center gap-1">
            <span className="text-sm">★</span>
            <span className="text-sm">{userRating || voteAverage?.toFixed(1)}</span>
          </div>
          {CustomActions && <CustomActions />}
        </div>
      </div>
    </Link>
  );
};