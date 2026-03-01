import { Link } from 'react-router-dom';
import { Plus, Check, Play, Info, ExternalLink } from 'lucide-react';
import { useWatchlist } from '@/contexts/WatchlistContext';
import { useToast } from '@/hooks/use-toast';

import { cn } from '@/lib/utils';
import { useState } from 'react';
import { getOMDbDetails, OMDbMovie } from '@/services/omdb';
import { OMDbModal } from '@/components/OMDbModal';

interface MediaCardProps {
  id: number;
  title: string;
  posterPath: string;
  mediaType: 'movie' | 'tv';
  rating?: number;
  releaseDate?: string;
  voteAverage?: number;
  showDeleteButton?: boolean;
  CustomActions?: React.ComponentType;
  originalLanguage?: string;
}

export const MediaCard = ({
  id,
  title,
  posterPath,
  mediaType,
  rating = 0,
  voteAverage,
  releaseDate,
  showDeleteButton = false,
  CustomActions,
  originalLanguage,
}: MediaCardProps) => {
  const { addToWatchlist, removeFromWatchlist, isInWatchlist } = useWatchlist();
  const { toast } = useToast();
  const [isHovered, setIsHovered] = useState(false);
  const inWatchlist = isInWatchlist(id);
  const [imageError, setImageError] = useState(false);
  const matchPercentage = Math.floor(65 + Math.random() * 30); // Random 65-95% match
  const [isOMDbModalOpen, setIsOMDbModalOpen] = useState(false);
  const [omdbData, setOmdbData] = useState<OMDbMovie | null>(null);
  const [isLoadingOMDb, setIsLoadingOMDb] = useState(false);

  const handleWatchlistClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (inWatchlist) {
      removeFromWatchlist(id);
      toast({
        title: "Removed from Watchlist",
        description: `${title} has been removed from your watchlist`,
      });
    } else {
      addToWatchlist({ id, title, posterPath, mediaType });
      toast({
        title: "Added to Watchlist",
        description: `${title} has been added to your watchlist`,
      });
    }
  };

  const handleWatchHere = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    setIsLoadingOMDb(true);
    setIsOMDbModalOpen(true);
    
    const year = releaseDate ? new Date(releaseDate).getFullYear().toString() : undefined;
    const data = await getOMDbDetails(title, year);
    
    setOmdbData(data);
    setIsLoadingOMDb(false);
  };

  return (
    <div 
      className="group relative overflow-hidden rounded-md bg-[#141414] transition-all duration-300 hover:scale-105 hover:z-10 hover:shadow-2xl"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <Link to={`/${mediaType}/${id}`} className="block relative">
        {/* Netflix Logo Overlay */}
        <div className="absolute top-2 left-2 z-10 opacity-90">
          <div className="bg-netflix-red text-white font-bold text-lg px-2 py-1 rounded">
            N
          </div>
        </div>

        {!imageError ? (
          <img
            src={`https://image.tmdb.org/t/p/w500${posterPath}`}
            alt={title}
            className="aspect-[2/3] w-full object-cover"
            loading="lazy"
            onError={() => setImageError(true)}
          />
        ) : (
          <div className="aspect-[2/3] w-full bg-gray-800 flex items-center justify-center">
            <span className="text-gray-500 text-sm text-center px-4">{title}</span>
          </div>
        )}

        {/* Gradient overlay on hover */}
        <div className={cn(
          "absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-0 transition-opacity duration-300",
          isHovered && "opacity-100"
        )} />
      </Link>

      {isHovered && (
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black via-black/95 to-transparent p-3 space-y-2.5">
          <div className="flex items-center gap-2">
            {/* Match percentage */}
            <span className="text-green-500 font-bold text-sm">{matchPercentage}% Match</span>
            <span className="text-gray-400 text-xs border border-gray-600 px-1.5 py-0.5 rounded">
              {new Date().getFullYear()}
            </span>
          </div>
          
          <h3 className="font-semibold text-sm line-clamp-2">{title}</h3>
          
          <div className="flex items-center gap-2">
            <Link
              to={`/${mediaType}/${id}`}
              className="flex h-9 w-9 items-center justify-center rounded-full bg-white text-black hover:bg-white/90 transition-all hover:scale-110"
              onClick={(e) => e.stopPropagation()}
            >
              <Play className="h-4 w-4 fill-black ml-0.5" />
            </Link>
            <button
              onClick={handleWatchlistClick}
              className={cn(
                "flex h-9 w-9 items-center justify-center rounded-full border-2 transition-all hover:scale-110",
                inWatchlist 
                  ? "border-green-500 bg-green-500 text-white" 
                  : "border-gray-400 hover:border-white bg-black/50"
              )}
            >
              {inWatchlist ? (
                <Check className="h-4 w-4" />
              ) : (
                <Plus className="h-4 w-4" />
              )}
            </button>
            <Link
              to={`/${mediaType}/${id}`}
              className="flex h-9 w-9 items-center justify-center rounded-full border-2 border-gray-400 hover:border-white bg-black/50 transition-all hover:scale-110"
              onClick={(e) => e.stopPropagation()}
            >
              <Info className="h-4 w-4" />
            </Link>
            <button
              onClick={handleWatchHere}
              className="flex h-9 w-9 items-center justify-center rounded-full border-2 border-netflix-red hover:border-netflix-red/80 bg-netflix-red/20 hover:bg-netflix-red/30 transition-all hover:scale-110"
              title="Watch Here"
            >
              <ExternalLink className="h-4 w-4 text-netflix-red" />
            </button>
            <div className="ml-auto text-xs text-gray-400">
              ★ {(voteAverage || rating).toFixed(1)}
            </div>
          </div>
          {CustomActions && <CustomActions />}
        </div>
      )}
      
      <OMDbModal 
        isOpen={isOMDbModalOpen}
        onClose={() => setIsOMDbModalOpen(false)}
        data={omdbData}
        isLoading={isLoadingOMDb}
      />
    </div>
  );
};
