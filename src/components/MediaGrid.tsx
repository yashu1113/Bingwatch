import { MediaCard } from './MediaCard';
import { generateUniqueKey } from '../lib/utils';

interface MediaGridProps {
  items: Array<{
    id: number;
    title: string;
    poster_path: string;
    media_type: 'movie' | 'tv';
    vote_average: number;
  }>;
}

export function MediaGrid({ items }: MediaGridProps) {
  // Filter out any potential duplicates by ID
  const uniqueItems = items.filter((item, index, self) =>
    index === self.findIndex((t) => t.id === item.id)
  );

  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
      {uniqueItems.map((item, index) => (
        <MediaCard
          key={generateUniqueKey(item.id, item.media_type, index)}
          id={item.id}
          title={item.title}
          posterPath={item.poster_path}
          mediaType={item.media_type}
          rating={item.vote_average}
        />
      ))}
    </div>
  );
}