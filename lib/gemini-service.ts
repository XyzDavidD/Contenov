import { GoogleGenerativeAI } from '@google/generative-ai';

export interface BlogAnalysis {
  url: string;
  primaryKeywords: string[];
  structure: {
    h1?: string;
    h2s: string[];
    h3s: string[];
  };
  wordCount: number;
  tone: string;
  style: string;
  keyTopics: string[];
  uniqueAngles: string[];
  isGeneric?: boolean;
}

export interface ComprehensiveBrief {
  seoData: {
    title: string;
    primaryKeyword: string;
    secondaryKeywords: string[];
    searchIntent: string;
    difficulty: string;
  };
  targetSpecs: {
    wordCount: string;
    readingLevel: string;
    tone: string;
    format: string;
  };
  structure: {
    h1: string;
    sections: Array<{
      h2: string;
      h3s: string[];
    }>;
  };
  competitorAnalysis: {
    commonTopics: string[];
    avgWordCount: string;
    gaps: string[];
  };
  contentRequirements: {
    mustInclude: string[];
    internalLinks: string[];
    externalLinks: string[];
    visuals: string[];
  };
  writingInstructions: {
    audience: string;
    voice: string;
    keyPoints: string[];
    avoid: string[];
    cta: string;
  };
  metaData: {
    title: string;
    description: string;
  };
}

/**
 * Initialize Gemini AI
 */
function getGeminiAI() {
  const apiKey = process.env.GOOGLE_GENERATIVE_AI_API_KEY;
  
  if (!apiKey) {
    throw new Error('GOOGLE_GENERATIVE_AI_API_KEY not configured');
  }
  
  return new GoogleGenerativeAI(apiKey);
}

/**
 * Analyzes a single blog post individually
 */
export async function analyzeBlogIndividually(
  content: string, 
  url: string,
  title: string
): Promise<BlogAnalysis> {
  console.log(`[GEMINI] 🔍 Analyzing blog: ${title.substring(0, 60)}...`);
  
  try {
    const genAI = getGeminiAI();
    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });
    
    // Send more content to Gemini for better analysis (12000 chars)
    const contentToAnalyze = content.substring(0, 12000);
    
    const prompt = `ANALYZE THIS REAL BLOG POST. Extract ONLY information that is ACTUALLY PRESENT in the content below.

BLOG URL: ${url}
BLOG TITLE: ${title}

BLOG CONTENT TO ANALYZE:
${contentToAnalyze}

MANDATORY TASKS:
1. SCAN the content for H2 headings (## heading or <h2>heading</h2> format)
2. SCAN the content for H3 headings (### heading or <h3>heading</h3> format)  
3. EXTRACT keywords that appear frequently in the content
4. IDENTIFY the specific topics this blog discusses
5. DETERMINE the writing style and tone

CRITICAL RULES:
- ONLY include headings that are ACTUALLY in the content above
- ONLY include keywords that are ACTUALLY used in the content
- DO NOT invent or guess any information
- If you cannot find real headings, return empty arrays
- If you cannot find real keywords, return ["content", "article", "information"]

Return ONLY this JSON (no markdown, no explanations):
{
  "actualH2Headings": ["exact H2 from content", "another exact H2"],
  "actualH3Headings": ["exact H3 from content", "another exact H3"],
  "primaryKeywords": ["keyword from content", "another keyword from content"],
  "wordCount": ${content.split(/\s+/).length},
  "tone": "specific tone observed in this content",
  "style": "content format/style observed",
  "mainTopics": ["specific topic discussed", "another topic discussed"],
  "uniqueInsights": ["specific insight from this content", "another insight"]
}`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    
    // Clean the response (remove markdown code blocks if present)
    const cleanedText = text
      .replace(/```json\n?/g, '')
      .replace(/```\n?/g, '')
      .trim();
    
    const analysis = JSON.parse(cleanedText);
    
    // Validate it's not generic
    const isGeneric = analysis.actualH2Headings?.some((h: string) => 
      ['introduction', 'main content', 'conclusion', 'overview'].includes(h.toLowerCase())
    );
    
    if (isGeneric) {
      console.log(`[GEMINI] ⚠️  WARNING: Generic headings detected for ${url}`);
    }
    
    console.log(`[GEMINI] ✅ Analysis complete: ${analysis.primaryKeywords?.slice(0, 3).join(', ')}`);
    
    return {
      url,
      primaryKeywords: analysis.primaryKeywords || [],
      structure: {
        h1: analysis.actualH2Headings?.[0] || '',
        h2s: analysis.actualH2Headings || [],
        h3s: analysis.actualH3Headings || []
      },
      wordCount: analysis.wordCount || 0,
      tone: analysis.tone || '',
      style: analysis.style || '',
      keyTopics: analysis.mainTopics || [],
      uniqueAngles: analysis.uniqueInsights || [],
      isGeneric
    };
    
  } catch (error) {
    console.error(`[GEMINI] ❌ Analysis failed for ${url}:`, error);
    
    // Return a basic fallback analysis
    const wordCount = content.split(/\s+/).length;
    return {
      url,
      primaryKeywords: ['content', 'article', 'blog'],
      structure: {
        h1: title,
        h2s: ['Introduction', 'Main Content', 'Conclusion'],
        h3s: []
      },
      wordCount,
      tone: 'professional',
      style: 'article',
      keyTopics: ['general content'],
      uniqueAngles: ['informative approach']
    };
  }
}

/**
 * Synthesizes final comprehensive brief from all individual blog analyses
 */
export async function synthesizeFinalBrief(
  analyses: BlogAnalysis[], 
  topic: string
): Promise<ComprehensiveBrief> {
  console.log(`[GEMINI] 🎯 Synthesizing final brief from ${analyses.length} blog analyses`);
  console.log(`[GEMINI] Topic: "${topic}"`);
  
  try {
    const genAI = getGeminiAI();
    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });
    
    // Extract ALL actual headings and keywords to show Gemini
    const allH2Headings = analyses.flatMap(a => a.structure.h2s);
    const allH3Headings = analyses.flatMap(a => a.structure.h3s);
    const allKeywords = analyses.flatMap(a => a.primaryKeywords);
    const uniqueKeywords = Array.from(new Set(allKeywords));
    
    const prompt = `CREATE A BLOG BRIEF FOR: "${topic}"

I analyzed ${analyses.length} competitor blogs. Use ONLY the data below - DO NOT use generic templates.

REAL H2 HEADINGS FOUND IN BLOGS:
${allH2Headings.filter(h => h && h.trim()).map((h, i) => `${i + 1}. "${h}"`).join('\n')}

REAL H3 HEADINGS FOUND IN BLOGS:
${allH3Headings.filter(h => h && h.trim()).slice(0, 20).map((h, i) => `${i + 1}. "${h}"`).join('\n')}

REAL KEYWORDS FOUND IN BLOGS:
${uniqueKeywords.filter(k => k && k.trim()).join(', ')}

COMPETITOR DETAILS:
${analyses.map((a, i) => `
BLOG ${i + 1}: ${a.url}
- REAL H2s: ${a.structure.h2s.filter(h => h && h.trim()).join(' | ') || 'None found'}
- REAL Keywords: ${a.primaryKeywords.filter(k => k && k.trim()).join(', ') || 'None found'}
- Word Count: ${a.wordCount}
- Tone: ${a.tone}
- Topics: ${a.keyTopics.filter(t => t && t.trim()).join(', ') || 'None found'}
- Unique Insights: ${a.uniqueAngles.filter(u => u && u.trim()).join(', ') || 'None found'}
`).join('\n')}

ABSOLUTE REQUIREMENTS:
1. Use ONLY the H2 headings listed above (do NOT create generic ones)
2. Use ONLY the keywords listed above (do NOT invent new ones)
3. Base ALL recommendations on the competitor analysis above
4. NO generic placeholders like "Introduction", "Main Content", "Conclusion"
5. NO template phrases like "Fluff content", "Outdated information"
6. Make everything SPECIFIC to "${topic}" based on competitor data
7. If competitor data is insufficient, say so instead of using templates

Return a comprehensive brief as JSON (no markdown, no explanation):

{
  "seoData": {
    "title": "SEO-optimized blog title (50-60 characters)",
    "primaryKeyword": "main target keyword",
    "secondaryKeywords": ["keyword2", "keyword3", "keyword4"],
    "searchIntent": "informational/transactional/navigational/commercial",
    "difficulty": "low/medium/high"
  },
  "targetSpecs": {
    "wordCount": "recommended word count range (e.g., 2000-2500 words)",
    "readingLevel": "target reading level (e.g., grade 8-10)",
    "tone": "recommended tone (e.g., professional, conversational)",
    "format": "article format (e.g., how-to guide, listicle, comparison)"
  },
  "structure": {
    "h1": "Main headline for the article",
    "sections": [
      {
        "h2": "Section heading 1",
        "h3s": ["Subsection 1.1", "Subsection 1.2"]
      },
      {
        "h2": "Section heading 2",
        "h3s": ["Subsection 2.1", "Subsection 2.2"]
      }
    ]
  },
  "competitorAnalysis": {
    "commonTopics": ["topic all competitors cover", "another common topic"],
    "avgWordCount": "average word count across analyzed blogs",
    "gaps": ["topic competitors missed", "another gap opportunity"]
  },
  "contentRequirements": {
    "mustInclude": ["essential element 1", "essential element 2"],
    "internalLinks": ["suggested internal link topic 1", "suggested topic 2"],
    "externalLinks": ["type of external source to link 1", "type 2"],
    "visuals": ["recommended visual type 1", "recommended type 2"]
  },
  "writingInstructions": {
    "audience": "target audience description",
    "voice": "brand voice description",
    "keyPoints": ["key message 1", "key message 2", "key message 3"],
    "avoid": ["what not to do 1", "what not to do 2"],
    "cta": "suggested call-to-action"
  },
  "metaData": {
    "title": "SEO meta title (50-60 characters)",
    "description": "SEO meta description (150-160 characters)"
  }
}

Important: 
- Return ONLY the JSON object, no markdown formatting, no explanation text
- Ensure all arrays have at least 2-3 items
- Make it actionable and specific to the topic "${topic}"
- Base recommendations on the competitor analysis provided`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    
    // Clean the response
    const cleanedText = text
      .replace(/```json\n?/g, '')
      .replace(/```\n?/g, '')
      .trim();
    
    const brief = JSON.parse(cleanedText);
    
    // More aggressive deduplication and generic section removal
    if (brief.structure?.sections) {
      const uniqueSections: any[] = [];
      const seenH2s = new Set<string>();
      const genericH2s = ['introduction', 'main content', 'conclusion', 'overview', 'summary', 'final thoughts'];
      
      brief.structure.sections.forEach((section: any) => {
        const h2Normalized = section.h2?.toLowerCase().trim();
        
        // Skip if duplicate
        if (seenH2s.has(h2Normalized)) {
          console.log(`[GEMINI] ⚠️ Skipping duplicate H2: ${section.h2}`);
          return;
        }
        
        // Skip if generic
        if (genericH2s.includes(h2Normalized)) {
          console.log(`[GEMINI] ⚠️ Skipping generic H2: ${section.h2}`);
          return;
        }
        
        seenH2s.add(h2Normalized);
        uniqueSections.push(section);
      });
      
      brief.structure.sections = uniqueSections;
      console.log(`[GEMINI] ✅ Structure validated: ${uniqueSections.length} unique sections (removed ${brief.structure.sections.length - uniqueSections.length} duplicates/generic)`);
      
      // Warn if still contains generic content
      const hasGeneric = uniqueSections.some(s => 
        genericH2s.some(g => s.h2?.toLowerCase().includes(g))
      );
      if (hasGeneric) {
        console.log(`[GEMINI] ⚠️ WARNING: Brief may still contain some generic sections`);
      }
    }
    
    console.log(`[GEMINI] ✅ Brief synthesis complete`);
    console.log(`[GEMINI] Primary keyword: ${brief.seoData?.primaryKeyword}`);
    console.log(`[GEMINI] Recommended word count: ${brief.targetSpecs?.wordCount}`);
    console.log(`[GEMINI] Structure sections: ${brief.structure?.sections?.length || 0}`);
    
    // Validate the brief has all required fields
    if (!brief.seoData || !brief.targetSpecs || !brief.structure || 
        !brief.competitorAnalysis || !brief.contentRequirements || 
        !brief.writingInstructions || !brief.metaData) {
      throw new Error('Generated brief is missing required fields');
    }
    
    // Validate that we're not using generic template content
    const genericPhrases = [
      'Fluff content', 'Outdated information', 'Overly technical jargon',
      'Introduction', 'Main Content', 'Conclusion', 'Main benefits',
      'How-to instructions', 'Related topic', 'Authority sources'
    ];
    
    const hasGenericContent = genericPhrases.some(phrase => 
      JSON.stringify(brief).toLowerCase().includes(phrase.toLowerCase())
    );
    
    if (hasGenericContent) {
      console.log(`[GEMINI] ⚠️ WARNING: Brief may contain generic template content`);
      console.log(`[GEMINI] ⚠️ This suggests AI analysis may not be working properly`);
    }
    
    return brief;
    
  } catch (error) {
    console.error(`[GEMINI] ❌ Brief synthesis failed:`, error);
    
    // Create a basic fallback brief
    console.log(`[GEMINI] 🔄 Creating fallback brief...`);
    
    const avgWordCount = Math.round(
      analyses.reduce((sum, a) => sum + a.wordCount, 0) / analyses.length
    );
    
    const allKeywords = analyses.flatMap(a => a.primaryKeywords);
    const uniqueKeywords = Array.from(new Set(allKeywords));
    
    const allTopics = analyses.flatMap(a => a.keyTopics);
    const uniqueTopics = Array.from(new Set(allTopics));
    
    const allH2s = analyses.flatMap(a => a.structure.h2s);
    
    return {
      seoData: {
        title: `The Ultimate Guide to ${topic}`,
        primaryKeyword: uniqueKeywords[0] || topic,
        secondaryKeywords: uniqueKeywords.slice(1, 4),
        searchIntent: 'informational',
        difficulty: 'medium'
      },
      targetSpecs: {
        wordCount: `${avgWordCount - 200}-${avgWordCount + 200} words`,
        readingLevel: 'Grade 8-10',
        tone: analyses[0]?.tone || 'professional',
        format: analyses[0]?.style || 'comprehensive guide'
      },
      structure: {
        h1: `${topic}: A Complete Guide`,
        sections: allH2s.slice(0, 6).map((h2, index) => ({
          h2: h2 || `Section ${index + 1}`,
          h3s: [`Understanding ${h2}`, `Benefits of ${h2}`, `Implementation strategies`]
        }))
      },
      competitorAnalysis: {
        commonTopics: uniqueTopics.slice(0, 5),
        avgWordCount: `${avgWordCount} words`,
        gaps: ['Practical examples', 'Step-by-step tutorials', 'Expert insights']
      },
      contentRequirements: {
        mustInclude: uniqueTopics.slice(0, 4),
        internalLinks: [`${topic} resources`, `${topic} tools`, `${topic} strategies`],
        externalLinks: [`${topic} research`, `${topic} case studies`, `${topic} industry reports`],
        visuals: [`${topic} infographic`, `${topic} comparison chart`, `${topic} workflow diagram`]
      },
      writingInstructions: {
        audience: `${topic} professionals and decision makers`,
        voice: 'Expert and authoritative',
        keyPoints: uniqueTopics.slice(0, 3),
        avoid: [`Generic ${topic} advice`, `Outdated ${topic} information`, `Vague ${topic} recommendations`],
        cta: `Get started with ${topic} today`
      },
      metaData: {
        title: `${topic}: Expert Guide & Best Practices`,
        description: `Master ${topic} with expert insights, proven strategies, and actionable tips from industry professionals.`
      }
    };
  }
}

