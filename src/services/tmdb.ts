import axios from 'axios';

const TMDB_API_KEY = 'cde27df6ea720efcd90be8ecd0400f61';
const BASE_URL = 'https://api.themoviedb.org/3';
const IMAGE_BASE_URL = 'https://image.tmdb.org/t/p';

export const tmdbApi = axios.create({
  baseURL: BASE_URL,
  params: {
    api_key: TMDB_API_KEY,
  },
  timeout: 10000, // Reduced timeout for slower networks
  headers: {
    'Accept': 'application/json',
  },
});

tmdbApi.interceptors.response.use(
  response => response,
  async error => {
    console.error('TMDB API Error:', {
      message: error.message,
      code: error.code,
      status: error.response?.status,
      url: error.config?.url,
    });
    
    if (error.code === 'ERR_NETWORK' || error.code === 'ECONNABORTED') {
      console.error('Network error detected. Retrying request with increased timeout...');
      if (error.config && !error.config._retry) {
        error.config._retry = true;
        error.config.timeout = 30000; // Increase timeout for retry
        return tmdbApi(error.config);
      }
      return Promise.reject(new Error('Network error. Please check your internet connection.'));
    }

    if (error.response?.status === 404) {
      console.error('Resource not found:', error.config?.url);
      return Promise.reject(new Error('Resource not found'));
    }
    
    const retryCount = error.config?._retryCount || 0;
    const maxRetries = 3;
    
    if (retryCount < maxRetries && (error.code === 'ECONNABORTED' || !error.response || error.response.status >= 500)) {
      error.config._retryCount = retryCount + 1;
      const delay = Math.min(1000 * (2 ** retryCount), 10000);
      
      console.log(`Retry attempt ${retryCount + 1} of ${maxRetries} after ${delay}ms`);
      await new Promise(resolve => setTimeout(resolve, delay));
      return tmdbApi(error.config);
    }

    return Promise.reject(error);
  }
);

export const getNowPlayingMovies = async () => {
  try {
    const response = await tmdbApi.get('/movie/now_playing');
    return response.data;
  } catch (error) {
    console.error('Error fetching now playing movies:', error);
    throw error;
  }
};

export const getImageUrl = (path: string, size: string = 'original') => {
  if (!path) return '/placeholder.svg';
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

export const getTVShowsByGenre = async (genreId: number) => {
  try {
    const response = await tmdbApi.get('/discover/tv', {
      params: {
        with_genres: genreId,
        sort_by: 'popularity.desc',
        include_null_first_air_dates: false,
        'vote_count.gte': 10,
        with_status: 0,
        with_type: 0,
      },
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching TV shows by genre:', error);
    throw error;
  }
};

export const getUpcomingMovies = async () => {
  try {
    const response = await tmdbApi.get('/movie/upcoming', {
      params: {
        region: 'IN',
      },
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching upcoming movies:', error);
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
    const [detailsResponse, nowPlayingResponse] = await Promise.all([
      tmdbApi.get(`/${mediaType}/${id}`, {
        params: {
          append_to_response: 'videos,credits,similar,recommendations',
        },
      }),
      mediaType === 'movie' ? tmdbApi.get('/movie/now_playing') : Promise.resolve({ data: { results: [] } }),
    ]);

    const isInTheaters = mediaType === 'movie' && 
      nowPlayingResponse.data.results.some((movie: { id: number }) => movie.id === id);

    return {
      ...detailsResponse.data,
      isInTheaters,
    };
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

export const getRecommendations = async (id: number, mediaType: 'movie' | 'tv') => {
  try {
    const response = await tmdbApi.get(`/${mediaType}/${id}/recommendations`);
    return response.data;
  } catch (error) {
    console.error('Error fetching recommendations:', error);
    throw error;
  }
};
