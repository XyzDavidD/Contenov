import axios from 'axios';

export interface BlogResult {
  url: string;
  title: string;
  snippet: string;
}

interface SerpResult {
  organic_results?: Array<{
    link: string;
    title: string;
    snippet: string;
  }>;
}

// URL validation patterns
const MUST_HAVE_PATTERNS = [
  '/blog/',
  '/article/',
  '/post/',
  '/guide/',
  '/resource/',
  '/learn/',
  '/insights/',
  '/news/',
  '/content/'
];

const MUST_NOT_HAVE_PATTERNS = [
  '/pricing',
  '/product/',
  '/products/',
  '/signup',
  '/sign-up',
  '/login',
  '/demo',
  '/about',
  '/contact',
  '/careers',
  '/jobs',
  'youtube.com',
  'facebook.com',
  'twitter.com',
  'linkedin.com',
  'instagram.com',
  'tiktok.com',
  'reddit.com'
];

/**
 * Validates if a URL is a valid blog post
 */
function isValidBlogUrl(url: string): boolean {
  const lowerUrl = url.toLowerCase();
  
  // Check MUST NOT have patterns
  for (const pattern of MUST_NOT_HAVE_PATTERNS) {
    if (lowerUrl.includes(pattern.toLowerCase())) {
      console.log(`[SERP] ❌ URL rejected (blocked pattern "${pattern}"): ${url}`);
      return false;
    }
  }
  
  // Check MUST have at least one pattern
  const hasValidPattern = MUST_HAVE_PATTERNS.some(pattern => 
    lowerUrl.includes(pattern.toLowerCase())
  );
  
  if (!hasValidPattern) {
    console.log(`[SERP] ❌ URL rejected (no valid blog pattern): ${url}`);
    return false;
  }
  
  console.log(`[SERP] ✅ URL validated: ${url}`);
  return true;
}

/**
 * Performs a Google search using SERP API
 */
async function performSearch(query: string, numResults: number = 10): Promise<BlogResult[]> {
  const apiKey = process.env.SERP_API_KEY;
  
  if (!apiKey) {
    throw new Error('SERP_API_KEY not configured');
  }
  
  console.log(`[SERP] 🔍 Searching: "${query}"`);
  
  try {
    const response = await axios.get<SerpResult>('https://serpapi.com/search', {
      params: {
        engine: 'google',
        q: query,
        num: numResults,
        gl: 'us',
        hl: 'en',
        api_key: apiKey
      },
      timeout: 15000 // 15 second timeout
    });
    
    const results = response.data.organic_results || [];
    console.log(`[SERP] 📊 Found ${results.length} organic results`);
    
    return results.map(result => ({
      url: result.link,
      title: result.title,
      snippet: result.snippet || ''
    }));
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.error(`[SERP] ❌ Search failed: ${error.message}`);
      if (error.response) {
        console.error(`[SERP] Response status: ${error.response.status}`);
        console.error(`[SERP] Response data:`, error.response.data);
      }
    }
    throw error;
  }
}

/**
 * Layer 1: Blog-Specific Search
 * Tries multiple search queries until we get results
 */
async function layer1BlogSpecificSearch(topic: string): Promise<BlogResult[]> {
  console.log(`[SERP] 🎯 LAYER 1: Blog-specific search for topic: "${topic}"`);
  
  const searchQueries = [
    `${topic} blog`,
    `${topic} inurl:blog`,
    `${topic} article`,
    `${topic} guide`
  ];
  
  const validResults: BlogResult[] = [];
  
  for (const query of searchQueries) {
    if (validResults.length >= 10) break; // Get more than needed for filtering
    
    try {
      const results = await performSearch(query, 10);
      
      // Filter valid blog URLs
      for (const result of results) {
        if (isValidBlogUrl(result.url)) {
          // Check for duplicates
          if (!validResults.some(r => r.url === result.url)) {
            validResults.push(result);
          }
        }
      }
      
      console.log(`[SERP] Layer 1 - Query "${query}": ${validResults.length} valid URLs so far`);
      
      if (validResults.length >= 10) break;
      
      // Small delay between searches to avoid rate limiting
      await new Promise(resolve => setTimeout(resolve, 1000));
      
    } catch (error) {
      console.error(`[SERP] Layer 1 - Query "${query}" failed, trying next...`);
      continue;
    }
  }
  
  console.log(`[SERP] ✅ Layer 1 complete: ${validResults.length} valid blog URLs found`);
  return validResults;
}

/**
 * Layer 4: Fallback Search
 * Broadens search if we don't have enough results
 */
async function layer4FallbackSearch(topic: string, currentResults: BlogResult[]): Promise<BlogResult[]> {
  console.log(`[SERP] 🔄 LAYER 4: Fallback search (current: ${currentResults.length} URLs)`);
  
  // Remove qualifiers from topic
  const simplifiedTopic = topic
    .replace(/\b(best|top|leading|ultimate|essential)\b/gi, '')
    .trim();
  
  const fallbackQueries = [
    `${simplifiedTopic} article`,
    `${simplifiedTopic} how to`,
    `${simplifiedTopic} comparison`,
    `${simplifiedTopic} review`,
    `learn about ${simplifiedTopic}`,
    `${simplifiedTopic} explained`
  ];
  
  const validResults = [...currentResults];
  
  for (const query of fallbackQueries) {
    if (validResults.length >= 10) break;
    
    try {
      const results = await performSearch(query, 10);
      
      for (const result of results) {
        if (validResults.length >= 10) break;
        
        if (isValidBlogUrl(result.url)) {
          // Check for duplicates
          if (!validResults.some(r => r.url === result.url)) {
            validResults.push(result);
            console.log(`[SERP] Layer 4 - Added URL: ${result.url}`);
          }
        }
      }
      
      if (validResults.length >= 10) break;
      
      // Small delay between searches
      await new Promise(resolve => setTimeout(resolve, 1000));
      
    } catch (error) {
      console.error(`[SERP] Layer 4 - Query "${query}" failed, trying next...`);
      continue;
    }
  }
  
  console.log(`[SERP] ✅ Layer 4 complete: ${validResults.length} valid blog URLs found`);
  return validResults;
}

/**
 * Main function: Find blog posts with multi-layer fallback strategy
 * 
 * Returns 5-10 valid blog URLs or throws error if minimum threshold not met
 */
export async function findBlogPosts(topic: string): Promise<BlogResult[]> {
  console.log(`[SERP] 🚀 Starting multi-layer blog search for: "${topic}"`);
  console.log(`[SERP] ================================================`);
  
  if (!topic || topic.trim().length < 3) {
    throw new Error('Topic must be at least 3 characters long');
  }
  
  try {
    // Layer 1: Blog-specific search
    let validResults = await layer1BlogSpecificSearch(topic);
    
    // If we have less than 10 results, try Layer 4: Fallback search
    if (validResults.length < 10) {
      console.log(`[SERP] ⚠️  Only ${validResults.length} URLs found, activating fallback...`);
      validResults = await layer4FallbackSearch(topic, validResults);
    }
    
    // Layer 5: Minimum threshold check
    console.log(`[SERP] 📊 Final count: ${validResults.length} valid blog URLs`);
    
    if (validResults.length < 2) {
      console.error(`[SERP] ❌ FAILED: Only ${validResults.length} blog posts found (minimum: 2)`);
      throw new Error(
        'Unable to find sufficient blog posts on this topic. Try a different or broader search term.'
      );
    }
    
    if (validResults.length < 3) {
      console.warn(`[SERP] ⚠️  WARNING: Only ${validResults.length} blog posts found (recommended: 5)`);
    }
    
    // Return top 10 results (or less if we have less)
    const finalResults = validResults.slice(0, 10);
    
    console.log(`[SERP] ================================================`);
    console.log(`[SERP] ✅ SUCCESS: Returning ${finalResults.length} blog posts`);
    console.log(`[SERP] URLs found:`);
    finalResults.forEach((result, index) => {
      console.log(`[SERP]   ${index + 1}. ${result.title}`);
      console.log(`[SERP]      ${result.url}`);
    });
    console.log(`[SERP] ================================================`);
    
    return finalResults;
    
  } catch (error) {
    if (error instanceof Error && error.message.includes('Unable to find sufficient blog posts')) {
      // Re-throw our custom error
      throw error;
    }
    
    console.error(`[SERP] ❌ Critical error in blog search:`, error);
    throw new Error('Failed to search for blog posts. Please try again later.');
  }
}






