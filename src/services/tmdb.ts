import axios from 'axios';

const TMDB_API_KEY = 'cde27df6ea720efcd90be8ecd0400f61';
const BASE_URL = 'https://api.themoviedb.org/3';
const IMAGE_BASE_URL = 'https://image.tmdb.org/t/p';

export const tmdbApi = axios.create({
  baseURL: BASE_URL,
  params: {
    api_key: TMDB_API_KEY,
  },
  timeout: 10000, // 10 second timeout
  headers: {
    'Accept': 'application/json',
  },
});

// Add response interceptor for error handling
tmdbApi.interceptors.response.use(
  response => response,
  error => {
    console.error('API Error:', error);
    if (error.response?.status === 429) {
      // Rate limit exceeded, retry after a delay
      return new Promise(resolve => {
        setTimeout(() => {
          resolve(tmdbApi(error.config));
        }, 2000);
      });
    }
    return Promise.reject(error);
  }
);

export const getImageUrl = (path: string, size: string = 'original') => {
  if (!path) return '/placeholder.svg';
  // Use smaller image sizes for mobile devices
  if (window.innerWidth < 768 && size === 'original') {
    size = 'w780';
  } else if (window.innerWidth < 480 && size === 'w500') {
    size = 'w342';
  }
  return `${IMAGE_BASE_URL}/${size}${path}`;
};

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

export const getIndianContent = async (mediaType: 'movie' | 'tv' = 'movie', page: number = 1) => {
  const response = await tmdbApi.get(`/discover/${mediaType}`, {
    params: {
      with_original_language: 'hi|ta|te|ml|bn',  // Hindi, Tamil, Telugu, Malayalam, Bengali
      region: 'IN',
      sort_by: 'popularity.desc',
      page,
      include_adult: false,
    },
  });
  return response.data;
};

export const getWatchProviders = async (mediaType: 'movie' | 'tv', id: number) => {
  const response = await tmdbApi.get(`/${mediaType}/${id}/watch/providers`);
  return response.data;
};
