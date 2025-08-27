/**
 * Fuzzy search utilities for stop suggestions
 * Handles accent normalization and fuzzy matching
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
 * Calculates similarity score between two strings using Levenshtein distance
 * Lower scores mean more similar strings
 */
export const calculateSimilarity = (str1: string, str2: string): number => {
  const matrix = Array(str2.length + 1).fill(null).map(() => Array(str1.length + 1).fill(null));

  for (let i = 0; i <= str1.length; i += 1) {
    matrix[0][i] = i;
  }

  for (let j = 0; j <= str2.length; j += 1) {
    matrix[j][0] = j;
  }

  for (let j = 1; j <= str2.length; j += 1) {
    for (let i = 1; i <= str1.length; i += 1) {
      const indicator = str1[i - 1] === str2[j - 1] ? 0 : 1;
      matrix[j][i] = Math.min(
        matrix[j][i - 1] + 1,     // deletion
        matrix[j - 1][i] + 1,     // insertion
        matrix[j - 1][i - 1] + indicator, // substitution
      );
    }
  }

  return matrix[str2.length][str1.length];
};

/**
 * Checks if a search query matches a target string with fuzzy logic
 * Uses both accent normalization and fuzzy matching
 */
export const fuzzyMatch = (query: string, target: string, threshold: number = 0.6): boolean => {
  const normalizedQuery = normalizeString(query);
  const normalizedTarget = normalizeString(target);

  // Exact match after normalization
  if (normalizedTarget.includes(normalizedQuery) || normalizedQuery.includes(normalizedTarget)) {
    return true;
  }

  // Fuzzy match for short queries (allow 1 character difference for queries <= 4 chars)
  if (normalizedQuery.length <= 4) {
    const distance = calculateSimilarity(normalizedQuery, normalizedTarget);
    const maxDistance = Math.min(1, Math.floor(normalizedQuery.length * 0.5));
    return distance <= maxDistance;
  }

  // For longer queries, require substring match
  return normalizedTarget.includes(normalizedQuery);
};

/**
 * Sorts search results by relevance score
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

  // Fuzzy match gets lower score
  const stopDistance = calculateSimilarity(normalizedQuery, normalizedStopName);
  const municipalityDistance = calculateSimilarity(normalizedQuery, normalizedMunicipality);
  const minDistance = Math.min(stopDistance, municipalityDistance);

  if (minDistance <= 2) {
    score += Math.max(0, 15 - minDistance);
  }

  return score;
};
