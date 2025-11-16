import { useState, useCallback, useEffect, useRef } from 'react';
import useEmblaCarousel from 'embla-carousel-react';
import { ChevronLeft, ChevronRight, Play, Pause, Volume2, VolumeX } from 'lucide-react';
import { NetflixCard } from './NetflixCard';
import { useIntersectionObserver } from '@/hooks/use-intersection-observer';

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

  const [isAutoPlaying, setIsAutoPlaying] = useState(true);
  const [isMuted, setIsMuted] = useState(true);
  const [canScrollPrev, setCanScrollPrev] = useState(false);
  const [canScrollNext, setCanScrollNext] = useState(false);
  const [isHovering, setIsHovering] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  
  const autoplayTimerRef = useRef<NodeJS.Timeout | null>(null);
  const sliderRef = useRef<HTMLDivElement>(null);

  // Intersection observer to pause when out of view
  const { isIntersecting } = useIntersectionObserver(sliderRef, {
    threshold: 0.5,
  });

  const onSelect = useCallback(() => {
    if (!emblaApi) return;
    setCanScrollPrev(emblaApi.canScrollPrev());
    setCanScrollNext(emblaApi.canScrollNext());
  }, [emblaApi]);

  const scrollPrev = useCallback(() => {
    if (emblaApi) {
      emblaApi.scrollPrev();
      stopAutoplay();
    }
  }, [emblaApi]);

  const scrollNext = useCallback(() => {
    if (emblaApi) {
      emblaApi.scrollNext();
      stopAutoplay();
    }
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
  }, [emblaApi, isAutoPlaying, isHovering, isDragging, isIntersecting]);

  // Setup embla event listeners
  useEffect(() => {
    if (!emblaApi) return;

    onSelect();
    emblaApi.on('select', onSelect);
    emblaApi.on('pointerDown', () => setIsDragging(true));
    emblaApi.on('pointerUp', () => {
      setIsDragging(false);
      setTimeout(startAutoplay, 2000);
    });

    return () => {
      emblaApi.off('select', onSelect);
    };
  }, [emblaApi, onSelect, startAutoplay]);

  // Autoplay management
  useEffect(() => {
    if (isIntersecting && !isHovering && !isDragging) {
      startAutoplay();
    } else {
      stopAutoplay();
    }

    return () => stopAutoplay();
  }, [isIntersecting, isHovering, isDragging, startAutoplay, stopAutoplay]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isIntersecting) return;
      
      if (e.key === 'ArrowLeft') {
        e.preventDefault();
        scrollPrev();
      } else if (e.key === 'ArrowRight') {
        e.preventDefault();
        scrollNext();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [scrollPrev, scrollNext, isIntersecting]);

  const toggleAutoplay = () => {
    setIsAutoPlaying(prev => !prev);
    stopAutoplay();
  };

  const toggleMute = () => {
    setIsMuted(prev => !prev);
  };

  return (
    <section
      ref={sliderRef}
      className="relative py-8 px-4 md:px-12"
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => setIsHovering(false)}
      role="region"
      aria-label={title || "Content slider"}
    >
      {/* Title and Controls */}
      <div className="flex items-center justify-between mb-4">
        {title && (
          <h2 className="text-xl md:text-2xl font-bold text-foreground">
            {title}
          </h2>
        )}
        
        <div className="flex items-center gap-2">
          <button
            onClick={toggleAutoplay}
            className="p-2 rounded-full bg-background/60 hover:bg-background/80 text-foreground transition-all hover:scale-110"
            aria-label={isAutoPlaying ? "Pause autoplay" : "Start autoplay"}
          >
            {isAutoPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
          </button>
          
          <button
            onClick={toggleMute}
            className="p-2 rounded-full bg-background/60 hover:bg-background/80 text-foreground transition-all hover:scale-110"
            aria-label={isMuted ? "Unmute trailers" : "Mute trailers"}
          >
            {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Slider Container */}
      <div className="relative group">
        {/* Gradient Fades */}
        <div className="absolute left-0 top-0 bottom-0 w-12 md:w-20 bg-gradient-to-r from-background to-transparent z-10 pointer-events-none" />
        <div className="absolute right-0 top-0 bottom-0 w-12 md:w-20 bg-gradient-to-l from-background to-transparent z-10 pointer-events-none" />

        {/* Navigation Arrows */}
        {canScrollPrev && (
          <button
            onClick={scrollPrev}
            className="absolute left-0 top-1/2 -translate-y-1/2 z-20 w-12 h-full bg-background/80 hover:bg-background/95 text-foreground opacity-0 group-hover:opacity-100 transition-all duration-300 flex items-center justify-center"
            aria-label="Previous slide"
          >
            <ChevronLeft className="w-8 h-8" />
          </button>
        )}

        {canScrollNext && (
          <button
            onClick={scrollNext}
            className="absolute right-0 top-1/2 -translate-y-1/2 z-20 w-12 h-full bg-background/80 hover:bg-background/95 text-foreground opacity-0 group-hover:opacity-100 transition-all duration-300 flex items-center justify-center"
            aria-label="Next slide"
          >
            <ChevronRight className="w-8 h-8" />
          </button>
        )}

        {/* Embla Viewport */}
        <div className="overflow-hidden" ref={emblaRef}>
          <div className="flex gap-2 md:gap-3">
            {items.map((item) => (
              <div
                key={item.id}
                className="flex-[0_0_45%] sm:flex-[0_0_32%] md:flex-[0_0_24%] lg:flex-[0_0_19%] xl:flex-[0_0_16%] min-w-0"
              >
                <NetflixCard
                  item={item}
                  isMuted={isMuted}
                  isSliderInView={isIntersecting}
                />
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};
