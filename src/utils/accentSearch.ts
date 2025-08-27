/**
 * Accent-insensitive search utilities for stop suggestions
 * Handles accent normalization without fuzzy matching
 */

/**
 * Normalizes a string by removing accents and diacritics
 * This allows searches like "GENEVE" to match "GENÈVE"
 */
export const normalizeString = (str: string): string => {
  return str
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Remove diacritics
    .replace(/æ/g, 'ae')
    .replace(/œ/g, 'oe')
    .replace(/ß/g, 'ss')
    .trim();
};

/**
 * Checks if a search query matches a target string (accent-insensitive)
 * Only matches exact substrings after accent normalization
 */
export const accentInsensitiveMatch = (query: string, target: string): boolean => {
  const normalizedQuery = normalizeString(query);
  const normalizedTarget = normalizeString(target);

  return normalizedTarget.includes(normalizedQuery);
};

/**
 * Sorts search results by relevance score (accent-insensitive)
 * Higher scores mean more relevant matches
 */
export const calculateRelevanceScore = (query: string, stopName: string, municipality: string): number => {
  const normalizedQuery = normalizeString(query);
  const normalizedStopName = normalizeString(stopName);
  const normalizedMunicipality = normalizeString(municipality);

  let score = 0;

  // Exact match gets highest score
  if (normalizedStopName === normalizedQuery) {
    score += 100;
  } else if (normalizedMunicipality === normalizedQuery) {
    score += 90;
  }

  // Starts with query gets high score
  if (normalizedStopName.startsWith(normalizedQuery)) {
    score += 50;
  } else if (normalizedMunicipality.startsWith(normalizedQuery)) {
    score += 40;
  }

  // Contains query gets medium score
  if (normalizedStopName.includes(normalizedQuery)) {
    score += 30;
  } else if (normalizedMunicipality.includes(normalizedQuery)) {
    score += 20;
  }

  return score;
};
