import axios from 'axios';

const TMDB_API_KEY = 'cde27df6ea720efcd90be8ecd0400f61';
const BASE_URL = 'https://api.themoviedb.org/3';
const IMAGE_BASE_URL = 'https://image.tmdb.org/t/p';

export const tmdbApi = axios.create({
  baseURL: BASE_URL,
  params: {
    api_key: TMDB_API_KEY,
  },
  timeout: 30000,
  headers: {
    'Accept': 'application/json',
  },
});

// Enhanced error handling and retry logic
tmdbApi.interceptors.response.use(
  response => response,
  async error => {
    const { config, response } = error;
    const retryCount = config._retryCount || 0;
    
    console.error('API Request Failed:', {
      url: config.url,
      method: config.method,
      status: response?.status,
      statusText: response?.statusText,
      error: error.message,
      retryCount,
    });
    
    // Only retry on network errors or 5xx server errors
    if ((error.code === 'ECONNABORTED' || 
         error.message.includes('timeout') || 
         !response || 
         response.status >= 500) && 
        retryCount < 3) {
      
      config._retryCount = retryCount + 1;
      const delay = Math.min(1000 * (2 ** retryCount) + Math.random() * 1000, 8000);
      
      await new Promise(resolve => setTimeout(resolve, delay));
      
      return tmdbApi(config);
    }
    
    // Handle rate limiting
    if (response?.status === 429) {
      const retryAfter = parseInt(response.headers['retry-after']) || 2;
      await new Promise(resolve => setTimeout(resolve, retryAfter * 1000));
      return tmdbApi(config);
    }

    return Promise.reject(error);
  }
);

export const getImageUrl = (path: string, size: string = 'original') => {
  if (!path) return '/placeholder.svg';
  if (size === 'original') size = 'w780';
  else if (size === 'w500') size = 'w342';
  return `${IMAGE_BASE_URL}/${size}${path}`;
};

export const getTrending = async (mediaType: 'all' | 'movie' | 'tv' = 'all', timeWindow: 'day' | 'week' = 'week') => {
  try {
    const response = await tmdbApi.get(`/trending/${mediaType}/${timeWindow}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching trending:', error);
    throw error;
  }
};

export const getTopRated = async (type: 'movie' | 'tv' = 'movie') => {
  try {
    const response = await tmdbApi.get(`/${type}/top_rated`);
    return response.data;
  } catch (error) {
    console.error('Error fetching top rated:', error);
    throw error;
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
    console.error('Error fetching movies by genre:', error);
    throw error;
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
    console.error('Error searching:', error);
    throw error;
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
    console.error('Error fetching details:', error);
    throw error;
  }
};

export const getGenres = async (type: 'movie' | 'tv' = 'movie') => {
  try {
    const response = await tmdbApi.get(`/genre/${type}/list`);
    return response.data;
  } catch (error) {
    console.error('Error fetching genres:', error);
    throw error;
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
    console.error('Error fetching Indian content:', error);
    throw error;
  }
};

export const getWatchProviders = async (mediaType: 'movie' | 'tv', id: number) => {
  try {
    const response = await tmdbApi.get(`/${mediaType}/${id}/watch/providers`);
    return response.data;
  } catch (error) {
    console.error('Error fetching watch providers:', error);
    throw error;
  }
};