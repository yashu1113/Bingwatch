import axios from 'axios';

const TMDB_API_KEY = 'cde27df6ea720efcd90be8ecd0400f61';
const BASE_URL = 'https://api.themoviedb.org/3';
const IMAGE_BASE_URL = 'https://image.tmdb.org/t/p';

export const api = axios.create({
  baseURL: BASE_URL,
  params: {
    api_key: TMDB_API_KEY,
  },
});

export const getImageUrl = (path: string, size: 'w500' | 'original' = 'w500') =>
  path ? `${IMAGE_BASE_URL}/${size}${path}` : null;

export const getTrending = async (mediaType: 'all' | 'movie' | 'tv' = 'all', page = 1) => {
  const { data } = await api.get(`/trending/${mediaType}/day`, {
    params: { page },
  });
  return data;
};

export const search = async (query: string, page = 1) => {
  const { data } = await api.get('/search/multi', {
    params: { query, page },
  });
  return data;
};

export const getDetails = async (mediaType: 'movie' | 'tv', id: string) => {
  const { data } = await api.get(`/${mediaType}/${id}`);
  return data;
};

export const getSimilar = async (mediaType: 'movie' | 'tv', id: string) => {
  const { data } = await api.get(`/${mediaType}/${id}/similar`);
  return data;
};

export const getGenres = async (mediaType: 'movie' | 'tv') => {
  const { data } = await api.get(`/genre/${mediaType}/list`);
  return data.genres;
};