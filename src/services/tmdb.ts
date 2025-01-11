import { BASE_URL } from '@/config';
import { Movie, TVShow } from '@/types';

interface SearchFilters {
  genre?: string;
  year?: string;
  rating?: number;
  sort?: string;
}

export const search = async (query: string, filters?: SearchFilters) => {
  const params = new URLSearchParams({
    api_key: import.meta.env.VITE_TMDB_API_KEY,
    query,
    include_adult: 'false',
    language: 'en-US',
    page: '1',
  });

  if (filters?.genre) {
    params.append('with_genres', filters.genre);
  }
  if (filters?.year) {
    params.append('year', filters.year);
  }
  if (filters?.sort) {
    params.append('sort_by', filters.sort);
  }

  const response = await fetch(
    `${BASE_URL}/search/multi?${params.toString()}`
  );
  return response.json();
};
