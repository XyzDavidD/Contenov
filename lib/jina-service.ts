import axios from 'axios';

export interface ExtractedContent {
  url: string;
  content: string;
  title: string;
  wordCount: number;
  success: boolean;
  error?: string;
}

/**
 * Validates content quality
 */
function validateContent(content: string, url: string): { valid: boolean; reason?: string } {
  // Minimum 500 words check
  const wordCount = content.trim().split(/\s+/).length;
  
  if (wordCount < 500) {
    return { 
      valid: false, 
      reason: `Content too short (${wordCount} words, minimum: 500)` 
    };
  }
  
  // Check for error pages
  const errorIndicators = [
    '404',
    'not found',
    'page not found',
    'access denied',
    'forbidden',
    'error occurred',
    'something went wrong',
    'try again later'
  ];
  
  const lowerContent = content.toLowerCase();
  const hasErrorIndicator = errorIndicators.some(indicator => 
    lowerContent.includes(indicator) && lowerContent.length < 2000
  );
  
  if (hasErrorIndicator) {
    return { 
      valid: false, 
      reason: 'Appears to be an error page' 
    };
  }
  
  // Check for minimal article structure (should have some headings or paragraphs)
  const hasStructure = 
    content.includes('\n\n') || // Multiple paragraphs
    content.match(/#{1,6}\s/) || // Markdown headings
    wordCount > 1000; // Long content likely has structure
  
  if (!hasStructure) {
    return { 
      valid: false, 
      reason: 'No clear article structure detected' 
    };
  }
  
  return { valid: true };
}

/**
 * Extracts content from a single URL using Jina.ai
 */
async function extractSingleBlogContent(url: string): Promise<ExtractedContent> {
  const apiKey = process.env.JINA_API_KEY;
  
  if (!apiKey) {
    throw new Error('JINA_API_KEY not configured');
  }
  
  console.log(`[JINA] 📄 Extracting content from: ${url}`);
  
  try {
    const jinaUrl = `https://r.jina.ai/${url}`;
    
    const response = await axios.get(jinaUrl, {
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'X-Return-Format': 'text'
      },
      timeout: 30000 // 30 second timeout
    });
    
    const content = response.data;
    const wordCount = content.trim().split(/\s+/).length;
    
    // Extract title (first line or first heading)
    const lines = content.split('\n').filter((line: string) => line.trim());
    const title = lines[0]?.replace(/^#\s*/, '') || 'Untitled';
    
    // Layer 3: Content quality check
    const validation = validateContent(content, url);
    
    if (!validation.valid) {
      console.log(`[JINA] ❌ Content validation failed: ${validation.reason}`);
      return {
        url,
        content: '',
        title: '',
        wordCount: 0,
        success: false,
        error: validation.reason
      };
    }
    
    console.log(`[JINA] ✅ Extracted ${wordCount} words from ${url}`);
    
    return {
      url,
      content,
      title,
      wordCount,
      success: true
    };
    
  } catch (error) {
    let errorMessage = 'Failed to extract content';
    
    if (axios.isAxiosError(error)) {
      if (error.code === 'ECONNABORTED') {
        errorMessage = 'Extraction timeout';
      } else if (error.response) {
        errorMessage = `HTTP ${error.response.status}`;
      } else if (error.request) {
        errorMessage = 'No response from server';
      }
    }
    
    console.error(`[JINA] ❌ Extraction failed for ${url}: ${errorMessage}`);
    
    return {
      url,
      content: '',
      title: '',
      wordCount: 0,
      success: false,
      error: errorMessage
    };
  }
}

/**
 * Extracts content from multiple blog URLs
 * Handles failures gracefully by skipping failed URLs
 * Adds delay between requests to avoid rate limiting
 */
export async function extractMultipleBlogContents(urls: string[]): Promise<ExtractedContent[]> {
  console.log(`[JINA] 🚀 Starting content extraction for ${urls.length} URLs`);
  console.log(`[JINA] ================================================`);
  
  if (!urls || urls.length === 0) {
    throw new Error('No URLs provided for content extraction');
  }
  
  const results: ExtractedContent[] = [];
  const targetCount = Math.min(urls.length, 5); // Try to get 5 successful extractions
  
  for (let i = 0; i < urls.length && results.filter(r => r.success).length < targetCount; i++) {
    const url = urls[i];
    
    try {
      const result = await extractSingleBlogContent(url);
      results.push(result);
      
      if (result.success) {
        console.log(`[JINA] ✅ Success ${results.filter(r => r.success).length}/${targetCount}: ${result.title.substring(0, 60)}...`);
      } else {
        console.log(`[JINA] ⚠️  Skipped (${result.error}): ${url}`);
      }
      
      // Add delay between requests (1-2 seconds)
      if (i < urls.length - 1) {
        const delay = 1000 + Math.random() * 1000; // 1-2 seconds
        console.log(`[JINA] ⏳ Waiting ${Math.round(delay)}ms before next request...`);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
      
    } catch (error) {
      console.error(`[JINA] ❌ Unexpected error processing ${url}:`, error);
      results.push({
        url,
        content: '',
        title: '',
        wordCount: 0,
        success: false,
        error: 'Unexpected error'
      });
    }
  }
  
  const successfulResults = results.filter(r => r.success);
  
  console.log(`[JINA] ================================================`);
  console.log(`[JINA] 📊 Extraction complete: ${successfulResults.length}/${urls.length} successful`);
  
  if (successfulResults.length < 2) {
    console.error(`[JINA] ❌ FAILED: Only ${successfulResults.length} successful extractions (minimum: 2)`);
    throw new Error(
      'Unable to extract sufficient blog content. The blogs may be behind paywalls or have protection against scraping.'
    );
  }
  
  if (successfulResults.length < 3) {
    console.warn(`[JINA] ⚠️  WARNING: Only ${successfulResults.length} successful extractions (recommended: 5)`);
  }
  
  console.log(`[JINA] ✅ Returning ${successfulResults.length} extracted blog contents`);
  successfulResults.forEach((result, index) => {
    console.log(`[JINA]   ${index + 1}. ${result.title.substring(0, 60)}... (${result.wordCount} words)`);
  });
  console.log(`[JINA] ================================================`);
  
  return successfulResults;
}






