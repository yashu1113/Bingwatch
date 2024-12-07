import { useRef, useEffect, useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Navigation, Pagination } from 'swiper/modules';
import { Swiper, SwiperSlide } from 'swiper/react';
import { MediaCard } from './MediaCard';
import { getTrending } from '../services/api';
import { cn, generateUniqueKey } from '../lib/utils';

import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';

interface TrendingSliderProps {
  mediaType: 'movie' | 'tv';
  title: string;
}

export function TrendingSlider({ mediaType, title }: TrendingSliderProps) {
  const [items, setItems] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const prevRef = useRef<HTMLButtonElement>(null);
  const nextRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const fetchTrending = async () => {
      try {
        const data = await getTrending(mediaType);
        // Filter out any potential duplicates by ID
        const uniqueItems = data.results.filter((item: any, index: number, self: any[]) =>
          index === self.findIndex((t) => t.id === item.id)
        );
        setItems(uniqueItems);
      } catch (err) {
        setError('Failed to load trending content');
        console.error('Error fetching trending content:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchTrending();
  }, [mediaType]);

  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-white"></div>
      </div>
    );
  }

  if (error || items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <div className="rounded-full bg-gray-800 p-4 mb-4">
          <ChevronRight className="h-8 w-8 text-gray-400" />
        </div>
        <h3 className="text-xl font-semibold text-gray-300 mb-2">
          {error || 'No Content Available'}
        </h3>
        <p className="text-gray-400">
          {error ? 'Please try again later' : 'No trending content available at the moment'}
        </p>
      </div>
    );
  }

  return (
    <section className="relative">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-2xl font-bold">{title}</h2>
        <div className="flex gap-2">
          <button
            ref={prevRef}
            className="rounded-full bg-white/10 p-2 hover:bg-white/20 disabled:opacity-50 disabled:cursor-not-allowed"
            aria-label="Previous slides"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          <button
            ref={nextRef}
            className="rounded-full bg-white/10 p-2 hover:bg-white/20 disabled:opacity-50 disabled:cursor-not-allowed"
            aria-label="Next slides"
          >
            <ChevronRight className="h-5 w-5" />
          </button>
        </div>
      </div>

      <Swiper
        modules={[Navigation, Pagination]}
        navigation={{
          prevEl: prevRef.current,
          nextEl: nextRef.current,
        }}
        pagination={{ clickable: true }}
        slidesPerView={1.2}
        spaceBetween={16}
        breakpoints={{
          640: { slidesPerView: 2.2 },
          768: { slidesPerView: 3.2 },
          1024: { slidesPerView: 4.2 },
          1280: { slidesPerView: 5.2 },
        }}
        className="!pb-12"
        onBeforeInit={(swiper) => {
          // @ts-ignore
          swiper.params.navigation.prevEl = prevRef.current;
          // @ts-ignore
          swiper.params.navigation.nextEl = nextRef.current;
        }}
      >
        {items.map((item, index) => (
          <SwiperSlide key={generateUniqueKey(item.id, mediaType, index)}>
            <MediaCard
              id={item.id}
              title={item.title || item.name}
              posterPath={item.poster_path}
              mediaType={mediaType}
              rating={item.vote_average}
              className="aspect-[2/3]"
            />
          </SwiperSlide>
        ))}
      </Swiper>
    </section>
  );
}