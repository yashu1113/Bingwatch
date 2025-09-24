import Fuse from 'fuse.js';
import { search as tmdbSearch } from './tmdb';

export interface FuzzySearchResult {
  id: number;
  title?: string;
  name?: string;
  original_title?: string;
  original_name?: string;
  overview?: string;
  poster_path?: string;
  media_type: 'movie' | 'tv';
  release_date?: string;
  first_air_date?: string;
  vote_average?: number;
  popularity: number;
}

// Common typos and corrections for movie/TV show names
const commonCorrections: Record<string, string> = {
  // Common misspellings
  'spiderman': 'spider-man',
  'spidermen': 'spider-man',
  'batman': 'batman',
  'supermen': 'superman',
  'xmen': 'x-men',
  'ironman': 'iron man',
  'avengers': 'avengers',
  'starwars': 'star wars',
  'gameofthrones': 'game of thrones',
  'breakingbad': 'breaking bad',
  'walkingdead': 'walking dead',
  'mandalorian': 'mandalorian',
  'witcher': 'witcher',
  'narcos': 'narcos',
  'stranger': 'stranger things',
  'strangerthings': 'stranger things',
  // Add more common corrections as needed
};

// Function to apply common corrections
const applyCorrections = (query: string): string => {
  const lowerQuery = query.toLowerCase().replace(/\s+/g, '');
  
  for (const [typo, correction] of Object.entries(commonCorrections)) {
    if (lowerQuery.includes(typo)) {
      return query.toLowerCase().replace(new RegExp(typo, 'gi'), correction);
    }
  }
  
  return query;
};

// Enhanced search function with fuzzy matching
export const fuzzySearch = async (query: string) => {
  if (!query.trim()) {
    return { results: [] };
  }

  // Apply common corrections first
  const correctedQuery = applyCorrections(query.trim());
  
  // Get results from TMDB API with both original and corrected queries
  const promises = [tmdbSearch(query.trim())];
  
  if (correctedQuery !== query.trim()) {
    promises.push(tmdbSearch(correctedQuery));
  }

  // Also try variations for better results
  const variations = generateQueryVariations(query.trim());
  variations.forEach(variation => {
    if (variation !== query.trim() && variation !== correctedQuery) {
      promises.push(tmdbSearch(variation));
    }
  });

  const searchResults = await Promise.all(promises);
  
  // Combine and deduplicate results
  const allResults = searchResults.reduce((acc, result) => {
    if (result?.results) {
      acc.push(...result.results);
    }
    return acc;
  }, [] as FuzzySearchResult[]);

  // Remove duplicates based on ID and media_type
  const uniqueResults = allResults.filter((item, index, self) => 
    index === self.findIndex(t => t.id === item.id && t.media_type === item.media_type)
  );

  // Configure Fuse.js for fuzzy search
  const fuse = new Fuse(uniqueResults, {
    keys: [
      { name: 'title', weight: 0.7 },
      { name: 'name', weight: 0.7 },
      { name: 'original_title', weight: 0.5 },
      { name: 'original_name', weight: 0.5 },
      { name: 'overview', weight: 0.1 },
    ],
    threshold: 0.6, // More lenient for typos
    includeScore: true,
    ignoreLocation: true,
    findAllMatches: true,
    minMatchCharLength: 2,
    shouldSort: true,
    includeMatches: true,
    useExtendedSearch: true,
  });

  // Perform fuzzy search
  let fuzzyResults = fuse.search(query.trim());

  // If no fuzzy results, try with corrected query
  if (fuzzyResults.length === 0 && correctedQuery !== query.trim()) {
    fuzzyResults = fuse.search(correctedQuery);
  }

  // If still no results, try partial matches
  if (fuzzyResults.length === 0) {
    const partialQuery = `'${query.trim().split(' ').join(' ')}`; // Exact phrase search
    fuzzyResults = fuse.search(partialQuery);
  }

  // Sort results by relevance (score) and popularity
  const sortedResults = fuzzyResults
    .sort((a, b) => {
      // Primary sort by score (lower is better for Fuse.js)
      const scoreDiff = (a.score || 1) - (b.score || 1);
      if (Math.abs(scoreDiff) > 0.1) return scoreDiff;
      
      // Secondary sort by popularity
      const aPopularity = (a.item as FuzzySearchResult).popularity || 0;
      const bPopularity = (b.item as FuzzySearchResult).popularity || 0;
      return bPopularity - aPopularity;
    })
    .map(result => result.item as FuzzySearchResult);

  // If we still have no results, return the original TMDB results
  if (sortedResults.length === 0) {
    return { 
      results: uniqueResults.slice(0, 20),
      correctedQuery: correctedQuery !== query.trim() ? correctedQuery : undefined
    };
  }

  return { 
    results: sortedResults.slice(0, 20),
    correctedQuery: correctedQuery !== query.trim() ? correctedQuery : undefined
  };
};

// Generate query variations to improve search results
const generateQueryVariations = (query: string): string[] => {
  const variations: string[] = [];
  const words = query.toLowerCase().split(' ').filter(word => word.length > 0);
  
  if (words.length > 1) {
    // Try without articles and common words
    const filteredWords = words.filter(word => 
      !['the', 'a', 'an', 'of', 'in', 'on', 'at', 'to', 'for', 'with'].includes(word)
    );
    
    if (filteredWords.length !== words.length && filteredWords.length > 0) {
      variations.push(filteredWords.join(' '));
    }
    
    // Try just the first word (for cases like "Iron Man 3" -> "Iron")
    if (words[0].length > 3) {
      variations.push(words[0]);
    }
    
    // Try without numbers
    const withoutNumbers = words.filter(word => !/^\d+$/.test(word)).join(' ');
    if (withoutNumbers !== query.toLowerCase() && withoutNumbers.length > 0) {
      variations.push(withoutNumbers);
    }
  }
  
  return variations;
};