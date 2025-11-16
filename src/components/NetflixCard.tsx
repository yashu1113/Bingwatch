import { useState, useRef, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Play, Plus, ThumbsUp, ChevronDown, Check } from 'lucide-react';
import { useWatchlist } from '@/contexts/WatchlistContext';
import { useToast } from '@/hooks/use-toast';
import { NetflixSliderItem } from './NetflixSlider';

interface NetflixCardProps {
  item: NetflixSliderItem;
  isMuted: boolean;
  isSliderInView: boolean;
}

export const NetflixCard = ({ item, isMuted, isSliderInView }: NetflixCardProps) => {
  const [isHovered, setIsHovered] = useState(false);
  const [isPlayingTrailer, setIsPlayingTrailer] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [mousePosition, setMousePosition] = useState({ x: 0.5, y: 0.5 });
  
  const hoverTimerRef = useRef<NodeJS.Timeout | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const cardRef = useRef<HTMLDivElement | null>(null);
  
  const navigate = useNavigate();
  const { addToWatchlist, isInWatchlist, removeFromWatchlist } = useWatchlist();
  const { toast } = useToast();

  const inWatchlist = isInWatchlist(item.id);

  // Cleanup trailer on unmount or when out of view
  useEffect(() => {
    if (!isSliderInView || !isHovered) {
      setIsPlayingTrailer(false);
      if (videoRef.current) {
        videoRef.current.pause();
        videoRef.current.currentTime = 0;
      }
    }
  }, [isSliderInView, isHovered]);

  // Handle hover with delay for trailer
  useEffect(() => {
    if (isHovered && isSliderInView) {
      hoverTimerRef.current = setTimeout(() => {
        if (item.trailerUrl && videoRef.current) {
          setIsPlayingTrailer(true);
          videoRef.current.play().catch(() => {
            // Autoplay failed, fallback to poster
            setIsPlayingTrailer(false);
          });
        }
      }, 800);
    } else {
      if (hoverTimerRef.current) {
        clearTimeout(hoverTimerRef.current);
      }
      setIsPlayingTrailer(false);
      if (videoRef.current) {
        videoRef.current.pause();
        videoRef.current.currentTime = 0;
      }
    }

    return () => {
      if (hoverTimerRef.current) {
        clearTimeout(hoverTimerRef.current);
      }
    };
  }, [isHovered, isSliderInView, item.trailerUrl]);

  // Mute control
  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.muted = isMuted;
    }
  }, [isMuted]);

  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width;
    const y = (e.clientY - rect.top) / rect.height;
    setMousePosition({ x, y });
  }, []);

  const handleWatchlistToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    
    const mediaItem = {
      id: item.id,
      title: item.title,
      mediaType: item.mediaType || 'movie' as const,
      posterPath: item.image,
    };

    if (inWatchlist) {
      removeFromWatchlist(item.id);
      toast({
        title: "Removed from Watchlist",
        description: `${item.title} removed from your watchlist`,
      });
    } else {
      addToWatchlist(mediaItem);
      toast({
        title: "Added to Watchlist",
        description: `${item.title} added to your watchlist`,
      });
    }
  };

  const handleCardClick = () => {
    const route = item.mediaType === 'tv' ? `/tv/${item.id}` : `/movie/${item.id}`;
    navigate(route);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleCardClick();
    }
  };

  const tiltX = (mousePosition.y - 0.5) * -10;
  const tiltY = (mousePosition.x - 0.5) * 10;

  return (
    <div
      ref={cardRef}
      className="relative group cursor-pointer"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onMouseMove={handleMouseMove}
      onClick={handleCardClick}
      onKeyPress={handleKeyPress}
      tabIndex={0}
      role="button"
      aria-label={`View details for ${item.title}`}
      style={{
        transform: isHovered
          ? `scale(1.15) perspective(1000px) rotateX(${tiltX}deg) rotateY(${tiltY}deg)`
          : 'scale(1)',
        transition: 'transform 200ms cubic-bezier(0.4, 0, 0.2, 1)',
        transformOrigin: 'center',
        zIndex: isHovered ? 50 : 1,
      }}
    >
      <div
        className="relative aspect-[16/9] rounded-md overflow-hidden bg-muted"
        style={{
          boxShadow: isHovered
            ? '0 20px 50px rgba(0, 0, 0, 0.5)'
            : '0 4px 6px rgba(0, 0, 0, 0.1)',
          transition: 'box-shadow 200ms',
        }}
      >
        {/* Loading Skeleton */}
        {!imageLoaded && (
          <div className="absolute inset-0 bg-muted animate-pulse" />
        )}

        {/* Main Image */}
        {!isPlayingTrailer && (
          <img
            src={item.image}
            alt={item.title}
            className="w-full h-full object-cover"
            loading="lazy"
            onLoad={() => setImageLoaded(true)}
            onError={(e) => {
              // Fallback image
              e.currentTarget.src = 'https://placehold.co/400x225?text=No+Image';
              setImageLoaded(true);
            }}
          />
        )}

        {/* Trailer Video */}
        {item.trailerUrl && (
          <video
            ref={videoRef}
            src={item.trailerUrl}
            className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-300 ${
              isPlayingTrailer ? 'opacity-100' : 'opacity-0'
            }`}
            loop
            muted={isMuted}
            playsInline
            preload="none"
          />
        )}

        {/* Hover Overlay with Actions */}
        {isHovered && (
          <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent flex flex-col justify-end p-3 animate-fade-in">
            <h3 className="text-white font-bold text-sm mb-2 line-clamp-1">
              {item.title}
            </h3>

            {/* Action Buttons */}
            <div className="flex items-center gap-2">
              <button
                className="w-8 h-8 rounded-full bg-white hover:bg-white/90 flex items-center justify-center transition-transform hover:scale-110"
                onClick={(e) => {
                  e.stopPropagation();
                  handleCardClick();
                }}
                aria-label="Play"
              >
                <Play className="w-4 h-4 text-black fill-black" />
              </button>

              <button
                className="w-8 h-8 rounded-full border-2 border-white/60 hover:border-white bg-transparent hover:bg-white/20 flex items-center justify-center transition-all hover:scale-110"
                onClick={handleWatchlistToggle}
                aria-label={inWatchlist ? "Remove from watchlist" : "Add to watchlist"}
              >
                {inWatchlist ? (
                  <Check className="w-4 h-4 text-white" />
                ) : (
                  <Plus className="w-4 h-4 text-white" />
                )}
              </button>

              <button
                className="w-8 h-8 rounded-full border-2 border-white/60 hover:border-white bg-transparent hover:bg-white/20 flex items-center justify-center transition-all hover:scale-110"
                onClick={(e) => e.stopPropagation()}
                aria-label="Like"
              >
                <ThumbsUp className="w-4 h-4 text-white" />
              </button>

              <button
                className="w-8 h-8 rounded-full border-2 border-white/60 hover:border-white bg-transparent hover:bg-white/20 flex items-center justify-center transition-all hover:scale-110 ml-auto"
                onClick={(e) => {
                  e.stopPropagation();
                  handleCardClick();
                }}
                aria-label="More info"
              >
                <ChevronDown className="w-4 h-4 text-white" />
              </button>
            </div>

            {/* Rating */}
            {item.rating && (
              <div className="flex items-center gap-1 mt-2">
                <span className="text-green-400 text-xs font-bold">
                  {Math.round(item.rating * 10)}% Match
                </span>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
