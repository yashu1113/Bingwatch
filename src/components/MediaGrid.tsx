import { MediaCard } from './MediaCard';
import { LoadingGrid } from './LoadingGrid';

interface Media {
  id: number;
  title?: string;
  name?: string;
  poster_path: string;
  media_type: 'movie' | 'tv';
  release_date?: string;
  first_air_date?: string;
  vote_average?: number;
}

interface MediaGridProps {
  items: Media[];
  isLoading?: boolean;
  showDeleteButton?: boolean;
}

export const MediaGrid = ({ items, isLoading, showDeleteButton }: MediaGridProps) => {
  if (isLoading) {
    return <LoadingGrid />;
  }

  if (!items?.length) {
    return (
      <div className="text-center py-8 text-gray-400">
        No items available at the moment
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 md:gap-6">
      {items.map((item) => (
        <MediaCard
          key={item.id}
          id={item.id}
          title={item.title || item.name || ''}
          posterPath={item.poster_path}
          mediaType={item.media_type}
          releaseDate={item.release_date || item.first_air_date}
          voteAverage={item.vote_average}
          showDeleteButton={showDeleteButton}
        />
      ))}
    </div>
  );
};