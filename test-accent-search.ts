// Simple test to verify accent-insensitive search functionality
import { normalizeString, accentInsensitiveMatch, calculateRelevanceScore } from './src/utils/accentSearch';

console.log('🧪 Testing Accent-Insensitive Search Functionality');
console.log('==================================================');

// Test accent normalization
console.log('\n1. Testing accent normalization:');
console.log('normalizeString("GENÈVE"):', normalizeString("GENÈVE"));
console.log('normalizeString("GENEVE"):', normalizeString("GENEVE"));
console.log('normalizeString("MÜNCHEN"):', normalizeString("MÜNCHEN"));
console.log('normalizeString("MUNCHEN"):', normalizeString("MUNCHEN"));

// Test accent-insensitive matching
console.log('\n2. Testing accent-insensitive matching:');
console.log('accentInsensitiveMatch("GENEVE", "GENÈVE"):', accentInsensitiveMatch("GENEVE", "GENÈVE"));
console.log('accentInsensitiveMatch("GENÈVE", "GENEVE"):', accentInsensitiveMatch("GENÈVE", "GENEVE"));
console.log('accentInsensitiveMatch("MUNCHEN", "MÜNCHEN"):', accentInsensitiveMatch("MUNCHEN", "MÜNCHEN"));
console.log('accentInsensitiveMatch("geneve", "GENÈVE"):', accentInsensitiveMatch("geneve", "GENÈVE"));

// Test that typos are NOT matched (this should be false)
console.log('\n3. Testing that typos are NOT matched:');
console.log('accentInsensitiveMatch("GENEVA", "GENÈVE"):', accentInsensitiveMatch("GENEVA", "GENÈVE")); // Should be false
console.log('accentInsensitiveMatch("GENEVE", "GENÈVA"):', accentInsensitiveMatch("GENEVE", "GENÈVA")); // Should be false

// Test relevance scoring
console.log('\n4. Testing relevance scoring:');
console.log('calculateRelevanceScore("GENEVE", "GENÈVE", "Genève"):', calculateRelevanceScore("GENEVE", "GENÈVE", "Genève"));
console.log('calculateRelevanceScore("GENEVE", "GENEVE", "Geneve"):', calculateRelevanceScore("GENEVE", "GENEVE", "Geneve"));
console.log('calculateRelevanceScore("GEN", "GENÈVE", "Genève"):', calculateRelevanceScore("GEN", "GENÈVE", "Genève"));

console.log('\n✅ Accent-insensitive search tests completed!');
