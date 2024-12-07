import { TrendingSlider } from '../components/TrendingSlider';

export function Home() {
  return (
    <div className="space-y-12">
      <TrendingSlider mediaType="movie" title="Trending Movies" />
      <TrendingSlider mediaType="tv" title="Trending TV Shows" />
    </div>
  );
}