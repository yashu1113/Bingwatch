import axios from 'axios';

const TMDB_API_KEY = 'cde27df6ea720efcd90be8ecd0400f61';
const BASE_URL = 'https://api.themoviedb.org/3';
const IMAGE_BASE_URL = 'https://image.tmdb.org/t/p';

// Create axios instance with enhanced configuration
export const tmdbApi = axios.create({
  baseURL: BASE_URL,
  params: {
    api_key: TMDB_API_KEY,
  },
  timeout: 15000, // Increased timeout for slower connections
  headers: {
    'Accept': 'application/json',
    'Cache-Control': 'no-cache',
    'Pragma': 'no-cache',
  },
});

// Enhanced error handling and retry logic
let retryCount = 0;
const MAX_RETRIES = 3;
const RETRY_DELAY = 2000;

tmdbApi.interceptors.response.use(
  (response) => {
    // Reset retry count on successful response
    retryCount = 0;
    return response;
  },
  async (error) => {
    const originalRequest = error.config;

    // Don't retry if we've hit the max retries or it's a 404
    if (retryCount >= MAX_RETRIES || error.response?.status === 404) {
      return Promise.reject(error);
    }

    // Handle rate limiting
    if (error.response?.status === 429) {
      const retryAfter = error.response.headers['retry-after'] || 2;
      await new Promise(resolve => setTimeout(resolve, retryAfter * 1000));
      return tmdbApi(originalRequest);
    }

    // Handle network errors and timeouts
    if (error.code === 'ECONNABORTED' || !error.response || error.code === 'ERR_NETWORK') {
      retryCount++;
      await new Promise(resolve => setTimeout(resolve, RETRY_DELAY));
      return tmdbApi(originalRequest);
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

// Enhanced API functions with better error handling
const handleApiError = (error: any) => {
  console.error('API Error:', error);
  if (error.code === 'ERR_NETWORK' || error.code === 'ECONNABORTED') {
    throw new Error('Unable to load content. Please check your network connection.');
  }
  throw error;
};

export const getTrending = async (mediaType: 'all' | 'movie' | 'tv' = 'all', timeWindow: 'day' | 'week' = 'week') => {
  try {
    const response = await tmdbApi.get(`/trending/${mediaType}/${timeWindow}`);
    return response.data;
  } catch (error) {
    handleApiError(error);
  }
};

export const getTopRated = async (type: 'movie' | 'tv' = 'movie') => {
  try {
    const response = await tmdbApi.get(`/${type}/top_rated`);
    return response.data;
  } catch (error) {
    handleApiError(error);
  }
};

export const getMoviesByGenre = async (genreId: number) => {
  try {
    const response = await tmdbApi.get('/discover/movie', {
      params: {
        with_genres: genreId,
        sort_by: 'popularity.desc',
      },
    });
    return response.data;
  } catch (error) {
    handleApiError(error);
  }
};

export const search = async (query: string) => {
  try {
    const response = await tmdbApi.get('/search/multi', {
      params: {
        query,
        include_adult: false,
      },
    });
    return response.data;
  } catch (error) {
    handleApiError(error);
  }
};

export const getDetails = async (mediaType: 'movie' | 'tv', id: number) => {
  try {
    const response = await tmdbApi.get(`/${mediaType}/${id}`, {
      params: {
        append_to_response: 'videos,credits,similar,recommendations',
      },
    });
    return response.data;
  } catch (error) {
    handleApiError(error);
  }
};

export const getGenres = async (type: 'movie' | 'tv' = 'movie') => {
  try {
    const response = await tmdbApi.get(`/genre/${type}/list`);
    return response.data;
  } catch (error) {
    handleApiError(error);
  }
};

export const getIndianContent = async (mediaType: 'movie' | 'tv' = 'movie', page: number = 1) => {
  try {
    const response = await tmdbApi.get(`/discover/${mediaType}`, {
      params: {
        with_original_language: 'hi|ta|te|ml|bn',
        region: 'IN',
        sort_by: 'popularity.desc',
        page,
        include_adult: false,
      },
    });
    return response.data;
  } catch (error) {
    handleApiError(error);
  }
};

export const getWatchProviders = async (mediaType: 'movie' | 'tv', id: number) => {
  try {
    const response = await tmdbApi.get(`/${mediaType}/${id}/watch/providers`);
    return response.data;
  } catch (error) {
    handleApiError(error);
  }
};