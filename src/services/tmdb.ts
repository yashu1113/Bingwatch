import axios from 'axios';

const TMDB_API_KEY = 'cde27df6ea720efcd90be8ecd0400f61';
const BASE_URL = 'https://api.themoviedb.org/3';
const IMAGE_BASE_URL = 'https://image.tmdb.org/t/p';

export const tmdbApi = axios.create({
  baseURL: BASE_URL,
  params: {
    api_key: TMDB_API_KEY,
  },
});

export const getImageUrl = (path: string, size: string = 'original') => 
  path ? `${IMAGE_BASE_URL}/${size}${path}` : '/placeholder.svg';

export const getTrending = async (mediaType: 'all' | 'movie' | 'tv' = 'all', timeWindow: 'day' | 'week' = 'week') => {
  const response = await tmdbApi.get(`/trending/${mediaType}/${timeWindow}`);
  return response.data;
};

export const getTopRated = async (type: 'movie' | 'tv' = 'movie') => {
  const response = await tmdbApi.get(`/${type}/top_rated`);
  return response.data;
};

export const getMoviesByGenre = async (genreId: number) => {
  const response = await tmdbApi.get('/discover/movie', {
    params: {
      with_genres: genreId,
      sort_by: 'popularity.desc',
    },
  });
  return response.data;
};

export const search = async (query: string) => {
  const response = await tmdbApi.get('/search/multi', {
    params: {
      query,
      include_adult: false,
    },
  });
  return response.data;
};

export const getDetails = async (mediaType: 'movie' | 'tv', id: number) => {
  const response = await tmdbApi.get(`/${mediaType}/${id}`, {
    params: {
      append_to_response: 'videos,credits,similar,recommendations',
    },
  });
  return response.data;
};

export const getGenres = async (type: 'movie' | 'tv' = 'movie') => {
  const response = await tmdbApi.get(`/genre/${type}/list`);
  return response.data;
};