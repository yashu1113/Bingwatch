import { Link } from 'react-router-dom';
import { Star } from 'lucide-react';
import { getImageUrl } from '../services/api';
import { cn } from '../lib/utils';

interface MediaCardProps {
  id: number;
  title: string;
  posterPath: string;
  mediaType: 'movie' | 'tv';
  rating: number;
  className?: string;
}

export function MediaCard({
  id,
  title,
  posterPath,
  mediaType,
  rating,
  className,
}: MediaCardProps) {
  return (
    <Link
      to={`/${mediaType}/${id}`}
      className={cn(
        'group relative overflow-hidden rounded-lg transition-transform hover:scale-105',
        className
      )}
    >
      <img
        src={getImageUrl(posterPath)}
        alt={title}
        className="h-full w-full object-cover"
        loading="lazy"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent p-4 flex flex-col justify-end opacity-0 group-hover:opacity-100 transition-opacity">
        <h3 className="text-white font-semibold">{title}</h3>
        <div className="flex items-center gap-1 text-yellow-400">
          <Star size={16} />
          <span>{rating.toFixed(1)}</span>
        </div>
      </div>
    </Link>
  );
}