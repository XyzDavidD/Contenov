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
    
    const prompt = `CREATE A COMPREHENSIVE BLOG BRIEF FOR: "${topic}"

I analyzed ${analyses.length} competitor blogs on this topic. Use this competitor data as INSPIRATION and GUIDANCE, but you are an expert content strategist - use your knowledge to create a logical, coherent structure that tells a complete story.

COMPETITOR DATA (Use as reference, not strict requirement):
${analyses.map((a, i) => `
BLOG ${i + 1}: ${a.url}
- H2 Headings Found: ${a.structure.h2s.filter(h => h && h.trim()).join(' | ') || 'None found'}
- H3 Headings Found: ${a.structure.h3s.filter(h => h && h.trim()).slice(0, 5).join(' | ') || 'None found'}
- Keywords: ${a.primaryKeywords.filter(k => k && k.trim()).join(', ') || 'None found'}
- Word Count: ${a.wordCount}
- Tone: ${a.tone}
- Main Topics: ${a.keyTopics.filter(t => t && t.trim()).join(', ') || 'None found'}
- Unique Insights: ${a.uniqueAngles.filter(u => u && u.trim()).join(', ') || 'None found'}
`).join('\n')}

KEYWORDS FROM COMPETITORS (Use as inspiration):
${uniqueKeywords.filter(k => k && k.trim()).join(', ')}

CRITICAL REQUIREMENTS FOR CONTENT SECTIONS:
1. Create 4-7 sections that tell a logical, coherent story about "${topic}"
2. Each section MUST have exactly 3 bullet points (h3s) - NO EXCEPTIONS
3. Sections should flow logically (e.g., Introduction → Core Concepts → Implementation → Advanced Tips → Conclusion)
4. Avoid repetition - each section should cover a distinct aspect of the topic
5. If competitor blogs don't have enough detail, use your expert knowledge to create relevant, specific bullet points
6. Make bullet points actionable and specific to "${topic}" - avoid generic advice
7. Ensure sections build upon each other to create a complete narrative

STRUCTURE GUIDELINES:
- Think like a content strategist: What would a reader need to know about "${topic}"?
- Start with foundational concepts, then move to practical application
- Each section should be distinct and valuable on its own
- Bullet points should be specific, actionable, and relevant to the section's theme
- Use competitor data to understand what's commonly covered, but don't limit yourself to only what they wrote

Return a comprehensive brief as JSON (no markdown, no explanation):

{
  "seoData": {
    "title": "SEO-optimized blog title (50-60 characters) for topic: ${topic}",
    "primaryKeyword": "main target keyword (use competitor keywords as inspiration)",
    "secondaryKeywords": ["keyword2", "keyword3", "keyword4"],
    "searchIntent": "informational/transactional/navigational/commercial",
    "difficulty": "low/medium/high"
  },
  "targetSpecs": {
    "wordCount": "recommended word count range based on competitor average (e.g., 2000-2500 words)",
    "readingLevel": "target reading level (e.g., grade 8-10)",
    "tone": "recommended tone based on competitor analysis (e.g., professional, conversational)",
    "format": "article format based on competitor style (e.g., how-to guide, listicle, comparison)"
  },
  "structure": {
    "h1": "Compelling main headline for the article about ${topic}",
    "sections": [
      {
        "h2": "Section heading 1 (foundational/conceptual)",
        "h3s": ["Specific bullet point 1", "Specific bullet point 2", "Specific bullet point 3"]
      },
      {
        "h2": "Section heading 2 (practical/implementation)",
        "h3s": ["Specific bullet point 1", "Specific bullet point 2", "Specific bullet point 3"]
      },
      {
        "h2": "Section heading 3 (advanced/detailed)",
        "h3s": ["Specific bullet point 1", "Specific bullet point 2", "Specific bullet point 3"]
      }
    ]
  },
  "competitorAnalysis": {
    "commonTopics": ["topic all competitors cover", "another common topic"],
    "avgWordCount": "average word count across analyzed blogs",
    "gaps": ["topic competitors missed", "another gap opportunity"]
  },
  "contentRequirements": {
    "mustInclude": ["essential element 1", "essential element 2", "essential element 3"],
    "internalLinks": ["suggested internal link topic 1", "suggested topic 2", "suggested topic 3"],
    "externalLinks": ["type of external source to link 1", "type 2", "type 3"],
    "visuals": ["recommended visual type 1", "recommended type 2", "recommended type 3"]
  },
  "writingInstructions": {
    "audience": "target audience description based on topic and competitor analysis",
    "voice": "brand voice description matching competitor tone",
    "keyPoints": ["key message 1", "key message 2", "key message 3"],
    "avoid": ["what not to do 1", "what not to do 2", "what not to do 3"],
    "cta": "suggested call-to-action relevant to ${topic}"
  },
  "metaData": {
    "title": "SEO meta title (50-60 characters) for ${topic}",
    "description": "SEO meta description (150-160 characters) for ${topic}"
  }
}

ABSOLUTE REQUIREMENTS:
- Return ONLY the JSON object, no markdown formatting, no explanation text
- structure.sections MUST have 4-7 sections
- Each section.h3s MUST have exactly 3 items (no more, no less)
- All bullet points must be specific to "${topic}" and actionable
- Sections must flow logically and tell a complete story
- Use competitor data as inspiration, but fill gaps with your expert knowledge
- Avoid generic phrases like "Introduction", "Conclusion", "Main Content" unless they truly fit the narrative`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    
    // Clean the response
    const cleanedText = text
      .replace(/```json\n?/g, '')
      .replace(/```\n?/g, '')
      .trim();
    
    const brief = JSON.parse(cleanedText);
    
    // Validate and fix structure sections
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
        
        // Skip if generic (unless it's the only section)
        if (genericH2s.includes(h2Normalized) && brief.structure.sections.length > 1) {
          console.log(`[GEMINI] ⚠️ Skipping generic H2: ${section.h2}`);
          return;
        }
        
        // Ensure h3s array exists and has exactly 3 items
        if (!section.h3s || !Array.isArray(section.h3s)) {
          section.h3s = [];
        }
        
        // Remove empty or duplicate h3s
        const validH3s = section.h3s
          .filter((h3: string) => h3 && h3.trim())
          .filter((h3: string, index: number, self: string[]) => 
            self.findIndex((h) => h.toLowerCase().trim() === h3.toLowerCase().trim()) === index
          );
        
        // If we have less than 3, pad with topic-specific suggestions
        while (validH3s.length < 3) {
          const placeholder = `Important aspect of ${section.h2 || topic}`;
          if (!validH3s.some(h3 => h3.toLowerCase().includes(placeholder.toLowerCase()))) {
            validH3s.push(placeholder);
          } else {
            validH3s.push(`Key consideration ${validH3s.length + 1} for ${section.h2 || topic}`);
          }
        }
        
        // Keep exactly 3
        section.h3s = validH3s.slice(0, 3);
        
        seenH2s.add(h2Normalized);
        uniqueSections.push(section);
      });
      
      // Ensure we have at least 4 sections
      if (uniqueSections.length < 4) {
        console.log(`[GEMINI] ⚠️ WARNING: Only ${uniqueSections.length} sections found (recommended: 4-7)`);
      }
      
      brief.structure.sections = uniqueSections;
      console.log(`[GEMINI] ✅ Structure validated: ${uniqueSections.length} unique sections, all with 3 bullet points`);
      
      // Log validation results
      uniqueSections.forEach((section, index) => {
        console.log(`[GEMINI]   Section ${index + 1}: "${section.h2}" - ${section.h3s?.length || 0} bullet points`);
      });
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
          h3s: [
            `Understanding ${h2 || topic}`,
            `Key strategies for ${h2 || topic}`,
            `Best practices for ${h2 || topic}`
          ]
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

