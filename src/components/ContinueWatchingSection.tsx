import { useContinueWatching } from '@/contexts/ContinueWatchingContext';
import { Link } from 'react-router-dom';
import { Play, X } from 'lucide-react';
import { cn } from '@/lib/utils';

export const ContinueWatchingSection = () => {
  const { watchProgress, removeProgress } = useContinueWatching();

  if (watchProgress.length === 0) return null;

  return (
    <section className="space-y-4">
      <div className="flex items-center gap-3">
        <h2 className="text-2xl md:text-3xl font-bold text-white">Continue Watching</h2>
        <div className="h-1 w-16 bg-netflix-red rounded-full" />
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3">
        {watchProgress.slice(0, 12).map((item) => (
          <div key={item.id} className="group relative">
            <Link 
              to={`/${item.mediaType}/${item.id}`}
              className="block relative overflow-hidden rounded-md"
            >
              <img
                src={`https://image.tmdb.org/t/p/w500${item.posterPath}`}
                alt={item.title}
                className="w-full h-auto aspect-[2/3] object-cover transition-transform duration-300 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              
              {/* Progress bar */}
              <div className="absolute bottom-0 left-0 right-0 h-1 bg-gray-700">
                <div 
                  className="h-full bg-netflix-red transition-all"
                  style={{ width: `${item.progress}%` }}
                />
              </div>

              {/* Continue badge */}
              <div className="absolute top-2 left-2 bg-netflix-red px-2 py-0.5 rounded text-xs font-bold">
                Continue
              </div>

              {/* Play button on hover */}
              <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <div className="bg-white rounded-full p-3">
                  <Play className="w-6 h-6 text-black fill-black" />
                </div>
              </div>

              {/* Progress percentage */}
              <div className="absolute bottom-6 left-2 text-xs text-white/80">
                {item.progress}% watched
              </div>
            </Link>

            {/* Remove button */}
            <button
              onClick={(e) => {
                e.preventDefault();
                removeProgress(item.id);
              }}
              className={cn(
                "absolute -top-2 -right-2 bg-black/80 rounded-full p-1.5 opacity-0 group-hover:opacity-100 transition-opacity z-10",
                "hover:bg-white hover:text-black"
              )}
              aria-label="Remove from continue watching"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>
    </section>
  );
};
