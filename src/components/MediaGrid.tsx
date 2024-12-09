import { MediaCard } from './MediaCard';

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
}

export const MediaGrid = ({ items }: MediaGridProps) => {
  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
      {items.map((item) => (
        <MediaCard
          key={item.id}
          id={item.id}
          title={item.title || item.name || ''}
          posterPath={item.poster_path}
          mediaType={item.media_type}
          releaseDate={item.release_date || item.first_air_date}
          voteAverage={item.vote_average}
        />
      ))}
    </div>
  );
};