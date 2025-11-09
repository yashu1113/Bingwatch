import axios from 'axios';

const OMDB_API_KEY = 'af4d0590';
const OMDB_BASE_URL = 'http://www.omdbapi.com/';

const omdbApi = axios.create({
  baseURL: OMDB_BASE_URL,
});

export interface OMDbMovie {
  Title: string;
  Year: string;
  Rated: string;
  Released: string;
  Runtime: string;
  Genre: string;
  Director: string;
  Writer: string;
  Actors: string;
  Plot: string;
  Language: string;
  Country: string;
  Awards: string;
  Poster: string;
  Ratings: Array<{
    Source: string;
    Value: string;
  }>;
  Metascore: string;
  imdbRating: string;
  imdbVotes: string;
  imdbID: string;
  Type: string;
  DVD: string;
  BoxOffice: string;
  Production: string;
  Website: string;
  Response: string;
}

export const getOMDbDetails = async (title: string, year?: string): Promise<OMDbMovie | null> => {
  try {
    const params: any = {
      apikey: OMDB_API_KEY,
      t: title,
      plot: 'full',
    };

    if (year) {
      params.y = year;
    }

    const response = await omdbApi.get('', { params });
    
    if (response.data.Response === 'True') {
      return response.data;
    }
    return null;
  } catch (error) {
    console.error('Error fetching OMDb data:', error);
    return null;
  }
};

export const getOMDbDetailsByIMDb = async (imdbId: string): Promise<OMDbMovie | null> => {
  try {
    const response = await omdbApi.get('', {
      params: {
        apikey: OMDB_API_KEY,
        i: imdbId,
        plot: 'full',
      },
    });
    
    if (response.data.Response === 'True') {
      return response.data;
    }
    return null;
  } catch (error) {
    console.error('Error fetching OMDb data:', error);
    return null;
  }
};
