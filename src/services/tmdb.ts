import { BASE_URL, IMAGE_BASE_URL } from '@/config';
import type { Movie, TVShow, MediaType, TimeWindow } from '@/types';

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

  const response = await fetch(`${BASE_URL}/search/multi?${params.toString()}`);
  return response.json();
};

export const getGenres = async (type: 'movie' | 'tv') => {
  const response = await fetch(
    `${BASE_URL}/genre/${type}/list?api_key=${import.meta.env.VITE_TMDB_API_KEY}&language=en-US`
  );
  return response.json();
};

export const getTrending = async (mediaType: MediaType, timeWindow: TimeWindow) => {
  const response = await fetch(
    `${BASE_URL}/trending/${mediaType}/${timeWindow}?api_key=${import.meta.env.VITE_TMDB_API_KEY}`
  );
  return response.json();
};

export const getTopRated = async (type: 'movie' | 'tv' = 'movie') => {
  const response = await fetch(
    `${BASE_URL}/${type}/top_rated?api_key=${import.meta.env.VITE_TMDB_API_KEY}&language=en-US&page=1`
  );
  return response.json();
};

export const getMoviesByGenre = async (genreId: number) => {
  const response = await fetch(
    `${BASE_URL}/discover/movie?api_key=${import.meta.env.VITE_TMDB_API_KEY}&with_genres=${genreId}&language=en-US&page=1`
  );
  return response.json();
};

export const getTVShowsByGenre = async (genreId: number) => {
  const response = await fetch(
    `${BASE_URL}/discover/tv?api_key=${import.meta.env.VITE_TMDB_API_KEY}&with_genres=${genreId}&language=en-US&page=1`
  );
  return response.json();
};

export const getDetails = async (type: 'movie' | 'tv', id: number) => {
  const response = await fetch(
    `${BASE_URL}/${type}/${id}?api_key=${import.meta.env.VITE_TMDB_API_KEY}&language=en-US&append_to_response=videos,similar,recommendations,credits`
  );
  return response.json();
};

export const getWatchProviders = async (type: 'movie' | 'tv', id: number) => {
  const response = await fetch(
    `${BASE_URL}/${type}/${id}/watch/providers?api_key=${import.meta.env.VITE_TMDB_API_KEY}`
  );
  return response.json();
};

export const getUpcomingMovies = async () => {
  const response = await fetch(
    `${BASE_URL}/movie/upcoming?api_key=${import.meta.env.VITE_TMDB_API_KEY}&language=en-US&page=1&region=IN`
  );
  return response.json();
};

export const getIndianContent = async () => {
  const response = await fetch(
    `${BASE_URL}/discover/movie?api_key=${import.meta.env.VITE_TMDB_API_KEY}&with_origin_country=IN&language=en-US&page=1`
  );
  return response.json();
};

export const getImageUrl = (path: string, size: string = 'original') => {
  if (!path) return null;
  return `${IMAGE_BASE_URL}/${size}${path}`;
};