import { Link } from 'react-router-dom';
import { getImageUrl } from '@/services/tmdb';
import { useIsMobile } from '@/hooks/use-mobile';
import { cn } from '@/lib/utils';

interface MediaCardProps {
  id: number;
  title: string;
  posterPath: string;
  mediaType: 'movie' | 'tv';
  releaseDate?: string;
  voteAverage?: number;
}

export const MediaCard = ({
  id,
  title,
  posterPath,
  mediaType,
  releaseDate,
  voteAverage,
}: MediaCardProps) => {
  const isMobile = useIsMobile();

  return (
    <Link
      to={`/${mediaType}/${id}`}
      className="group relative overflow-hidden rounded-lg transition-transform hover:scale-105"
    >
      <div className="aspect-[2/3] w-full">
        <img
          src={getImageUrl(posterPath, 'w500')}
          alt={title}
          className="h-full w-full object-cover"
          loading="lazy"
        />
      </div>
      <div 
        className={cn(
          "absolute inset-0 bg-gradient-to-t from-black/80 to-transparent",
          isMobile ? "opacity-100" : "opacity-0 transition-opacity group-hover:opacity-100"
        )}
      >
        <div className="absolute bottom-0 p-4 text-white">
          <h3 className="text-lg font-bold">{title}</h3>
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