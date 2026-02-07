import { useContinueWatching } from '@/contexts/ContinueWatchingContext';
import { Link } from 'react-router-dom';
import { Play, X, Tv } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useState } from 'react';
import { VideoPlayer } from '@/components/VideoPlayer';

export const ContinueWatchingSection = () => {
  const { watchProgress, removeProgress } = useContinueWatching();
  const [playerOpen, setPlayerOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<typeof watchProgress[0] | null>(null);

  if (watchProgress.length === 0) return null;

  const handleContinueWatching = (item: typeof watchProgress[0], e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setSelectedItem(item);
    setPlayerOpen(true);
  };

  const formatEpisodeInfo = (item: typeof watchProgress[0]) => {
    if (item.mediaType === 'tv' && item.currentSeason && item.currentEpisode) {
      return `S${item.currentSeason}:E${item.currentEpisode}`;
    }
    return null;
  };

  return (
    <>
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
                className="block relative overflow-hidden rounded-lg bg-gray-900"
              >
                <img
                  src={`https://image.tmdb.org/t/p/w500${item.posterPath}`}
                  alt={item.title}
                  className="w-full h-auto aspect-[2/3] object-cover transition-transform duration-300 group-hover:scale-105 group-hover:opacity-70"
                />
                
                {/* Gradient overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/30 to-transparent" />
                
                {/* Progress bar */}
                <div className="absolute bottom-0 left-0 right-0 h-1.5 bg-gray-700/80">
                  <div 
                    className="h-full bg-netflix-red transition-all rounded-r"
                    style={{ width: `${item.progress}%` }}
                  />
                </div>

                {/* Media type badge */}
                <div className={cn(
                  "absolute top-2 left-2 px-2 py-0.5 rounded text-xs font-bold flex items-center gap-1",
                  item.mediaType === 'tv' ? "bg-blue-600" : "bg-netflix-red"
                )}>
                  {item.mediaType === 'tv' && <Tv className="w-3 h-3" />}
                  {item.mediaType === 'tv' ? 'Series' : 'Movie'}
                </div>

                {/* Episode info for TV shows */}
                {item.mediaType === 'tv' && item.currentSeason && item.currentEpisode && (
                  <div className="absolute top-2 right-2 bg-black/80 px-2 py-0.5 rounded text-xs font-medium text-white">
                    {formatEpisodeInfo(item)}
                  </div>
                )}

                {/* Play button on hover */}
                <div 
                  className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                  onClick={(e) => handleContinueWatching(item, e)}
                >
                  <div className="bg-white rounded-full p-4 shadow-xl hover:scale-110 transition-transform cursor-pointer">
                    <Play className="w-8 h-8 text-black fill-black" />
                  </div>
                </div>

                {/* Title and progress info at bottom */}
                <div className="absolute bottom-4 left-2 right-2 space-y-1">
                  <h3 className="text-sm font-semibold text-white truncate drop-shadow-lg">
                    {item.title}
                  </h3>
                  <div className="flex items-center justify-between text-xs text-white/80">
                    <span>{item.progress}% watched</span>
                    {item.mediaType === 'tv' && item.currentSeason && item.currentEpisode && (
                      <span className="bg-white/20 px-1.5 py-0.5 rounded">
                        {formatEpisodeInfo(item)}
                      </span>
                    )}
                  </div>
                </div>
              </Link>

              {/* Remove button */}
              <button
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  removeProgress(item.id);
                }}
                className={cn(
                  "absolute -top-2 -right-2 bg-black/90 rounded-full p-1.5 opacity-0 group-hover:opacity-100 transition-opacity z-10",
                  "hover:bg-red-600 border border-white/20"
                )}
                aria-label="Remove from continue watching"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      </section>

      {/* Video Player */}
      {playerOpen && selectedItem && (
        <VideoPlayer
          isOpen={playerOpen}
          onClose={() => {
            setPlayerOpen(false);
            setSelectedItem(null);
          }}
          mediaType={selectedItem.mediaType}
          tmdbId={selectedItem.id}
          season={selectedItem.currentSeason || 1}
          episode={selectedItem.currentEpisode || 1}
          title={selectedItem.title}
        />
      )}
    </>
  );
};
