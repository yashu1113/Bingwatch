import { useState, useCallback, useEffect, useRef } from 'react';
import useEmblaCarousel from 'embla-carousel-react';
import { ChevronLeft, ChevronRight, Play, Pause, X, Plus, Check, Info } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useIntersectionObserver } from '@/hooks/use-intersection-observer';
import { useWatchlist } from '@/contexts/WatchlistContext';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { VideoPlayer } from '@/components/VideoPlayer';

export interface NetflixSliderItem {
  id: number;
  title: string;
  image: string;
  trailerUrl?: string;
  rating?: number;
  overview?: string;
  mediaType?: 'movie' | 'tv';
}

interface NetflixSliderProps {
  items: NetflixSliderItem[];
  title?: string;
}

export const NetflixSlider = ({ items, title }: NetflixSliderProps) => {
  const [emblaRef, emblaApi] = useEmblaCarousel({
    align: 'start',
    containScroll: 'trimSnaps',
    dragFree: false,
    slidesToScroll: 'auto',
  });

  const [isAutoPlaying, setIsAutoPlaying] = useState(false);
  const [canScrollPrev, setCanScrollPrev] = useState(false);
  const [canScrollNext, setCanScrollNext] = useState(false);
  const [isHovering, setIsHovering] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [hoveredCardId, setHoveredCardId] = useState<number | null>(null);
  const [imageLoaded, setImageLoaded] = useState<Record<number, boolean>>({});
  
  // Modal states
  const [showModal, setShowModal] = useState(false);
  const [selectedItem, setSelectedItem] = useState<NetflixSliderItem | null>(null);
  const [showVideoPlayer, setShowVideoPlayer] = useState(false);
  
  const autoplayTimerRef = useRef<NodeJS.Timeout | null>(null);
  const sliderRef = useRef<HTMLDivElement>(null);
  const hoverTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const navigate = useNavigate();
  const { addToWatchlist, isInWatchlist, removeFromWatchlist } = useWatchlist();
  const { toast } = useToast();

  // Intersection observer
  const { isIntersecting } = useIntersectionObserver(sliderRef, { threshold: 0.3 });

  const onSelect = useCallback(() => {
    if (!emblaApi) return;
    setCanScrollPrev(emblaApi.canScrollPrev());
    setCanScrollNext(emblaApi.canScrollNext());
  }, [emblaApi]);

  const scrollPrev = useCallback(() => {
    if (emblaApi) emblaApi.scrollPrev();
  }, [emblaApi]);

  const scrollNext = useCallback(() => {
    if (emblaApi) emblaApi.scrollNext();
  }, [emblaApi]);

  const stopAutoplay = useCallback(() => {
    if (autoplayTimerRef.current) {
      clearTimeout(autoplayTimerRef.current);
      autoplayTimerRef.current = null;
    }
  }, []);

  const startAutoplay = useCallback(() => {
    if (!isAutoPlaying || isHovering || isDragging || !isIntersecting) return;
    
    stopAutoplay();
    autoplayTimerRef.current = setTimeout(() => {
      if (emblaApi && emblaApi.canScrollNext()) {
        emblaApi.scrollNext();
        startAutoplay();
      } else if (emblaApi) {
        emblaApi.scrollTo(0);
        startAutoplay();
      }
    }, 4000);
  }, [emblaApi, isAutoPlaying, isHovering, isDragging, isIntersecting, stopAutoplay]);

  useEffect(() => {
    if (!emblaApi) return;
    onSelect();
    emblaApi.on('select', onSelect);
    emblaApi.on('pointerDown', () => setIsDragging(true));
    emblaApi.on('pointerUp', () => {
      setIsDragging(false);
      if (isAutoPlaying) setTimeout(startAutoplay, 2000);
    });
    return () => { emblaApi.off('select', onSelect); };
  }, [emblaApi, onSelect, startAutoplay, isAutoPlaying]);

  useEffect(() => {
    if (isIntersecting && isAutoPlaying && !isHovering && !isDragging) {
      startAutoplay();
    } else {
      stopAutoplay();
    }
    return () => stopAutoplay();
  }, [isIntersecting, isHovering, isDragging, isAutoPlaying, startAutoplay, stopAutoplay]);

  // Card hover handlers
  const handleCardHover = useCallback((id: number) => {
    if (hoverTimeoutRef.current) clearTimeout(hoverTimeoutRef.current);
    hoverTimeoutRef.current = setTimeout(() => setHoveredCardId(id), 150);
  }, []);

  const handleCardLeave = useCallback(() => {
    if (hoverTimeoutRef.current) clearTimeout(hoverTimeoutRef.current);
    setHoveredCardId(null);
  }, []);

  // Action handlers
  const handlePlay = useCallback((item: NetflixSliderItem, e?: React.MouseEvent) => {
    e?.stopPropagation();
    setSelectedItem(item);
    setShowVideoPlayer(true);
    setShowModal(false);
  }, []);

  const handleMoreInfo = useCallback((item: NetflixSliderItem, e?: React.MouseEvent) => {
    e?.stopPropagation();
    const route = item.mediaType === 'tv' ? `/tv/${item.id}` : `/movie/${item.id}`;
    navigate(route);
  }, [navigate]);

  const handleWatchlistToggle = useCallback((item: NetflixSliderItem, e?: React.MouseEvent) => {
    e?.stopPropagation();
    const mediaItem = {
      id: item.id,
      title: item.title,
      mediaType: item.mediaType || 'movie' as const,
      posterPath: item.image,
    };

    if (isInWatchlist(item.id)) {
      removeFromWatchlist(item.id);
      toast({ title: "Removed", description: `${item.title} removed from watchlist` });
    } else {
      addToWatchlist(mediaItem);
      toast({ title: "Added", description: `${item.title} added to watchlist` });
    }
  }, [addToWatchlist, removeFromWatchlist, isInWatchlist, toast]);

  const openModal = useCallback((item: NetflixSliderItem) => {
    setSelectedItem(item);
    setShowModal(true);
  }, []);

  const closeModal = useCallback(() => {
    setShowModal(false);
    setSelectedItem(null);
  }, []);

  if (!items?.length) return null;

  return (
    <>
      <section
        ref={sliderRef}
        className="relative py-6 group/section"
        onMouseEnter={() => setIsHovering(true)}
        onMouseLeave={() => setIsHovering(false)}
        role="region"
        aria-label={title || "Content slider"}
      >
        {/* Title and Controls */}
        <div className="flex items-center justify-between mb-5 px-4 md:px-12">
          {title && (
            <div className="flex items-center gap-3 group/title">
              <h2 className="text-xl md:text-2xl font-bold text-white 
                           group-hover/title:text-netflix-red transition-colors duration-300">
                {title}
              </h2>
              <div className="h-0.5 w-0 group-hover/section:w-12 bg-netflix-red rounded-full 
                            transition-all duration-500" />
            </div>
          )}
          
          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsAutoPlaying(prev => !prev)}
              className="p-2 rounded-full bg-white/5 hover:bg-white/15 text-white/70 hover:text-white 
                        border border-white/10 hover:border-white/30
                        transition-all duration-200 hover:scale-110 active:scale-95"
              aria-label={isAutoPlaying ? "Pause autoplay" : "Start autoplay"}
            >
              {isAutoPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* Slider Container */}
        <div className="relative">
          {/* Gradient Fades */}
          <div className={`absolute left-0 top-0 bottom-0 w-16 md:w-24 z-20 pointer-events-none
                          bg-gradient-to-r from-[#141414] to-transparent
                          transition-opacity duration-300 ${canScrollPrev ? 'opacity-100' : 'opacity-0'}`} />
          <div className={`absolute right-0 top-0 bottom-0 w-16 md:w-24 z-20 pointer-events-none
                          bg-gradient-to-l from-[#141414] to-transparent
                          transition-opacity duration-300 ${canScrollNext ? 'opacity-100' : 'opacity-0'}`} />

          {/* Navigation Arrows */}
          <button
            onClick={scrollPrev}
            className={`absolute left-1 top-1/2 -translate-y-1/2 z-30 
                       h-28 w-10 md:w-12 rounded-r-md
                       bg-black/70 hover:bg-black/90 backdrop-blur-sm
                       text-white/80 hover:text-white
                       flex items-center justify-center
                       transition-all duration-300
                       ${canScrollPrev ? 'opacity-0 group-hover/section:opacity-100' : 'opacity-0 pointer-events-none'}
                       hover:scale-x-110 active:scale-x-95`}
            aria-label="Previous"
          >
            <ChevronLeft className="w-7 h-7" />
          </button>

          <button
            onClick={scrollNext}
            className={`absolute right-1 top-1/2 -translate-y-1/2 z-30 
                       h-28 w-10 md:w-12 rounded-l-md
                       bg-black/70 hover:bg-black/90 backdrop-blur-sm
                       text-white/80 hover:text-white
                       flex items-center justify-center
                       transition-all duration-300
                       ${canScrollNext ? 'opacity-0 group-hover/section:opacity-100' : 'opacity-0 pointer-events-none'}
                       hover:scale-x-110 active:scale-x-95`}
            aria-label="Next"
          >
            <ChevronRight className="w-7 h-7" />
          </button>

          {/* Cards Container */}
          <div className="overflow-hidden px-4 md:px-12" ref={emblaRef}>
            <div className="flex gap-2 md:gap-3 py-6">
              {items.map((item) => {
                const isHovered = hoveredCardId === item.id;
                const inWatchlist = isInWatchlist(item.id);
                const isLoaded = imageLoaded[item.id];

                return (
                  <div
                    key={item.id}
                    className="flex-[0_0_42%] sm:flex-[0_0_30%] md:flex-[0_0_22%] lg:flex-[0_0_18%] xl:flex-[0_0_15%] min-w-0"
                    onMouseEnter={() => handleCardHover(item.id)}
                    onMouseLeave={handleCardLeave}
                  >
                    <div
                      className={`relative aspect-video rounded-md overflow-hidden cursor-pointer
                                 bg-gray-800 transition-all duration-300 ease-out
                                 ${isHovered ? 'scale-110 z-40 shadow-2xl shadow-black/70 ring-1 ring-white/20' : 'scale-100 z-10'}`}
                      onClick={() => openModal(item)}
                    >
                      {/* Loading skeleton */}
                      {!isLoaded && (
                        <div className="absolute inset-0 bg-gray-700 animate-pulse" />
                      )}
                      
                      {/* Image */}
                      <img
                        src={item.image}
                        alt={item.title}
                        className={`w-full h-full object-cover transition-all duration-300
                                   ${isLoaded ? 'opacity-100' : 'opacity-0'}
                                   ${isHovered ? 'brightness-[0.6]' : 'brightness-100'}`}
                        loading="lazy"
                        onLoad={() => setImageLoaded(prev => ({ ...prev, [item.id]: true }))}
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = '/placeholder.svg';
                          setImageLoaded(prev => ({ ...prev, [item.id]: true }));
                        }}
                      />

                      {/* Hover Overlay */}
                      <div
                        className={`absolute inset-0 flex flex-col justify-end p-3
                                   bg-gradient-to-t from-black via-black/50 to-transparent
                                   transition-opacity duration-300
                                   ${isHovered ? 'opacity-100' : 'opacity-0'}`}
                      >
                        {/* Title */}
                        <h3 className="text-white font-bold text-sm md:text-base line-clamp-1 mb-2">
                          {item.title}
                        </h3>

                        {/* Action Buttons */}
                        <div className="flex items-center gap-2">
                          <button
                            onClick={(e) => handlePlay(item, e)}
                            className="h-8 w-8 md:h-9 md:w-9 rounded-full bg-white 
                                      flex items-center justify-center
                                      hover:bg-white/90 hover:scale-110 active:scale-95
                                      transition-all duration-200 shadow-lg"
                            aria-label="Play"
                          >
                            <Play className="h-4 w-4 text-black fill-black" />
                          </button>

                          <button
                            onClick={(e) => handleWatchlistToggle(item, e)}
                            className={`h-8 w-8 md:h-9 md:w-9 rounded-full border-2 
                                       flex items-center justify-center
                                       hover:scale-110 active:scale-95
                                       transition-all duration-200
                                       ${inWatchlist 
                                         ? 'bg-green-500/20 border-green-400 text-green-400' 
                                         : 'bg-black/40 border-white/50 hover:border-white text-white'}`}
                            aria-label={inWatchlist ? "In watchlist" : "Add to watchlist"}
                          >
                            {inWatchlist ? <Check className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
                          </button>

                          <button
                            onClick={(e) => handleMoreInfo(item, e)}
                            className="h-8 w-8 md:h-9 md:w-9 rounded-full bg-black/40 border-2 border-white/50
                                      flex items-center justify-center ml-auto
                                      hover:border-white hover:bg-white/10 hover:scale-110 active:scale-95
                                      transition-all duration-200"
                            aria-label="More info"
                          >
                            <Info className="h-4 w-4 text-white" />
                          </button>
                        </div>

                        {/* Rating */}
                        {item.rating && item.rating > 0 && (
                          <div className="absolute top-2 right-2 px-2 py-0.5 bg-black/80 rounded text-xs font-bold text-green-400">
                            {Math.round(item.rating * 10)}%
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* Detail Modal */}
      {showModal && selectedItem && (
        <div 
          className="fixed inset-0 z-[9999] flex items-center justify-center p-4 
                     bg-black/85 backdrop-blur-sm"
          onClick={closeModal}
          role="dialog"
          aria-modal="true"
          aria-label={selectedItem.title}
        >
          <div 
            className="relative w-full max-w-3xl bg-[#181818] rounded-xl overflow-hidden 
                       shadow-2xl shadow-black/50 animate-in zoom-in-95 duration-300"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="relative aspect-video">
              <img
                src={selectedItem.image}
                alt={selectedItem.title}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#181818] via-transparent to-black/30" />
              
              {/* Close Button */}
              <button
                onClick={closeModal}
                className="absolute top-4 right-4 h-10 w-10 rounded-full bg-[#181818]/90 
                          flex items-center justify-center
                          border border-white/20 hover:border-white/50
                          hover:bg-[#181818] hover:scale-110 
                          transition-all duration-300"
                aria-label="Close"
              >
                <X className="h-5 w-5 text-white" />
              </button>

              {/* Content Overlay */}
              <div className="absolute bottom-0 left-0 right-0 p-6 md:p-8">
                <h2 className="text-3xl md:text-4xl font-bold text-white mb-5 drop-shadow-lg">
                  {selectedItem.title}
                </h2>
                
                <div className="flex flex-wrap items-center gap-3">
                  <Button
                    onClick={() => handlePlay(selectedItem)}
                    size="lg"
                    className="bg-white text-black hover:bg-white/90 
                              font-bold text-lg px-8 py-6 rounded-md gap-2
                              hover:scale-105 active:scale-95 transition-all duration-200
                              shadow-xl"
                  >
                    <Play className="h-6 w-6 fill-current" />
                    Play
                  </Button>

                  <Button
                    onClick={() => handleWatchlistToggle(selectedItem)}
                    size="icon"
                    variant="outline"
                    className={`h-14 w-14 rounded-full border-2 
                               hover:scale-110 active:scale-95 transition-all duration-200
                               ${isInWatchlist(selectedItem.id) 
                                 ? 'bg-green-500/20 border-green-400 text-green-400 hover:bg-green-500/30' 
                                 : 'bg-black/40 border-white/50 hover:border-white hover:bg-white/10 text-white'}`}
                    aria-label={isInWatchlist(selectedItem.id) ? "In watchlist" : "Add to watchlist"}
                  >
                    {isInWatchlist(selectedItem.id) ? <Check className="h-6 w-6" /> : <Plus className="h-6 w-6" />}
                  </Button>

                  <Button
                    onClick={() => {
                      handleMoreInfo(selectedItem);
                      closeModal();
                    }}
                    size="icon"
                    variant="outline"
                    className="h-14 w-14 rounded-full bg-black/40 border-2 border-white/50
                              hover:border-white hover:bg-white/10 text-white
                              hover:scale-110 active:scale-95 transition-all duration-200"
                    aria-label="More info"
                  >
                    <Info className="h-6 w-6" />
                  </Button>
                </div>
              </div>
            </div>

            {/* Modal Body */}
            <div className="p-6 md:p-8 pt-4">
              {/* Meta Info */}
              <div className="flex flex-wrap items-center gap-3 mb-4">
                {selectedItem.rating && selectedItem.rating > 0 && (
                  <span className="text-green-400 font-bold text-lg">
                    {Math.round(selectedItem.rating * 10)}% Match
                  </span>
                )}
                <span className="px-3 py-1 bg-netflix-red/80 text-white text-xs font-bold rounded uppercase">
                  {selectedItem.mediaType === 'tv' ? 'Series' : 'Movie'}
                </span>
              </div>

              {/* Overview */}
              {selectedItem.overview && (
                <p className="text-gray-300 text-base leading-relaxed">
                  {selectedItem.overview}
                </p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Video Player */}
      {showVideoPlayer && selectedItem && (
        <VideoPlayer
          isOpen={showVideoPlayer}
          onClose={() => setShowVideoPlayer(false)}
          mediaType={selectedItem.mediaType || 'movie'}
          tmdbId={selectedItem.id}
          title={selectedItem.title}
        />
      )}
    </>
  );
};
