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
  timeout: 15000, // Increased timeout to 15 seconds
  headers: {
    'Accept': 'application/json',
  },
});

// Enhanced error handling and retry logic
tmdbApi.interceptors.response.use(
  response => response,
  async error => {
    const { config, response } = error;
    
    // Track retry attempts
    const retryCount = config._retryCount || 0;
    
    // Only retry on network errors or 5xx server errors
    if ((error.code === 'ECONNABORTED' || !response || response.status >= 500) && retryCount < 3) {
      config._retryCount = retryCount + 1;
      
      // Exponential backoff delay
      const delay = Math.min(1000 * (2 ** retryCount), 5000);
      
      await new Promise(resolve => setTimeout(resolve, delay));
      
      // Retry the request
      return tmdbApi(config);
    }
    
    // Handle rate limiting
    if (response?.status === 429) {
      const retryAfter = response.headers['retry-after'] || 2;
      await new Promise(resolve => setTimeout(resolve, retryAfter * 1000));
      return tmdbApi(config);
    }

    console.error('API Error:', {
      url: config.url,
      method: config.method,
      status: response?.status,
      error: error.message
    });

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
