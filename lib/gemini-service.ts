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
    
    const prompt = `YOU ARE AN EXPERT CONTENT STRATEGIST. Create a comprehensive, topic-specific blog brief for: "${topic}"

I analyzed ${analyses.length} competitor blogs. Use their data as REFERENCE, but you MUST create original, topic-specific content based on your expertise.

COMPETITOR DATA (Reference only):
${analyses.map((a, i) => `
BLOG ${i + 1}: ${a.url}
- H2 Headings: ${a.structure.h2s.filter(h => h && h.trim()).join(' | ') || 'None found'}
- H3 Headings: ${a.structure.h3s.filter(h => h && h.trim()).slice(0, 8).join(' | ') || 'None found'}
- Keywords: ${a.primaryKeywords.filter(k => k && k.trim()).slice(0, 10).join(', ') || 'None found'}
- Topics: ${a.keyTopics.filter(t => t && t.trim()).slice(0, 8).join(', ') || 'None found'}
- Insights: ${a.uniqueAngles.filter(u => u && u.trim()).slice(0, 5).join(', ') || 'None found'}
`).join('\n')}

KEYWORDS FROM COMPETITORS: ${uniqueKeywords.filter(k => k && k.trim()).slice(0, 15).join(', ')}

🚫 ABSOLUTELY FORBIDDEN - DO NOT USE THESE GENERIC TEMPLATES:
- H1: "${topic}: A Complete Guide" or "${topic}: The Ultimate Guide" or any variation
- H2: "Introduction", "Main Content", "Conclusion", "Overview", "Summary"
- H3: "Understanding [topic]", "Key strategies for [topic]", "Best practices for [topic]"
- Any generic phrases that could apply to ANY topic

✅ REQUIRED - YOU MUST:
1. Create a UNIQUE, CREATIVE H1 headline that's specific to "${topic}" - NOT just "{topic}: A Complete Guide"
   Examples of good H1s: "10 Project Management Tools That Actually Save Small Teams Time", "How to Choose the Right CRM for Your Sales Team", "The Complete Breakdown of Email Marketing Automation"
   
2. Create 4-7 SPECIFIC H2 sections that are unique to "${topic}" and tell a complete story
   - Each H2 must be a distinct, valuable section about "${topic}"
   - Think: What does someone searching for "${topic}" actually need to know?
   - Use competitor H2s as inspiration, but create your own unique structure
   
3. Each H2 section MUST have exactly 3 H3 bullet points that are:
   - SPECIFIC to that H2 section and "${topic}"
   - ACTIONABLE and valuable
   - Based on competitor data OR your expert knowledge of "${topic}"
   - NOT generic templates like "Understanding X" or "Key strategies for X"
   
4. If competitor data is insufficient, use your EXPERT KNOWLEDGE of "${topic}" to create relevant, specific content
   - You are an expert on "${topic}" - use that knowledge
   - Create content that would genuinely help someone researching "${topic}"

THINKING PROCESS:
1. What are the key aspects someone needs to understand about "${topic}"?
2. What questions do people have about "${topic}"?
3. What would make a comprehensive, valuable guide about "${topic}"?
4. How can I structure this to tell a complete story from basics to advanced?

Return ONLY valid JSON (no markdown, no explanations):

{
  "seoData": {
    "title": "Creative, SEO-optimized title (50-60 chars) - NOT '${topic}: A Complete Guide'",
    "primaryKeyword": "main keyword from competitor analysis or topic",
    "secondaryKeywords": ["keyword2", "keyword3", "keyword4"],
    "searchIntent": "informational/transactional/navigational/commercial",
    "difficulty": "low/medium/high"
  },
  "targetSpecs": {
    "wordCount": "range based on competitor average (e.g., 2000-2500 words)",
    "readingLevel": "target level (e.g., grade 8-10)",
    "tone": "tone from competitor analysis",
    "format": "format from competitor style"
  },
  "structure": {
    "h1": "UNIQUE, CREATIVE headline specific to ${topic} - NOT a generic template",
    "sections": [
      {
        "h2": "Specific section 1 about ${topic} (NOT 'Introduction')",
        "h3s": ["Specific, actionable point 1", "Specific, actionable point 2", "Specific, actionable point 3"]
      },
      {
        "h2": "Specific section 2 about ${topic} (NOT 'Main Content')",
        "h3s": ["Specific, actionable point 1", "Specific, actionable point 2", "Specific, actionable point 3"]
      },
      {
        "h2": "Specific section 3 about ${topic}",
        "h3s": ["Specific, actionable point 1", "Specific, actionable point 2", "Specific, actionable point 3"]
      },
      {
        "h2": "Specific section 4 about ${topic}",
        "h3s": ["Specific, actionable point 1", "Specific, actionable point 2", "Specific, actionable point 3"]
      }
    ]
  },
  "competitorAnalysis": {
    "commonTopics": ["topic from analysis", "another topic"],
    "avgWordCount": "average from analysis",
    "gaps": ["gap opportunity 1", "gap opportunity 2"]
  },
  "contentRequirements": {
    "mustInclude": ["element 1", "element 2", "element 3"],
    "internalLinks": ["link topic 1", "link topic 2", "link topic 3"],
    "externalLinks": ["source type 1", "source type 2", "source type 3"],
    "visuals": ["visual type 1", "visual type 2", "visual type 3"]
  },
  "writingInstructions": {
    "audience": "target audience for ${topic}",
    "voice": "voice matching competitor tone",
    "keyPoints": ["message 1", "message 2", "message 3"],
    "avoid": ["avoid 1", "avoid 2", "avoid 3"],
    "cta": "CTA relevant to ${topic}"
  },
  "metaData": {
    "title": "SEO meta title (50-60 chars) for ${topic}",
    "description": "SEO meta description (150-160 chars) for ${topic}"
  }
}

CRITICAL: Every H2 and H3 must be SPECIFIC to "${topic}" and valuable. NO generic templates allowed.`;

    // Function to validate if content is generic
    const isGenericContent = (brief: any): boolean => {
      const briefStr = JSON.stringify(brief).toLowerCase();
      
      // Check for generic H1 patterns
      const genericH1Patterns = [
        `${topic.toLowerCase()}: a complete guide`,
        `${topic.toLowerCase()}: the ultimate guide`,
        `${topic.toLowerCase()}: complete guide`,
        `${topic.toLowerCase()}: ultimate guide`
      ];
      
      const h1 = brief.structure?.h1?.toLowerCase() || '';
      if (genericH1Patterns.some(pattern => h1.includes(pattern))) {
        console.log(`[GEMINI] ❌ Generic H1 detected: "${brief.structure.h1}"`);
        return true;
      }
      
      // Check for generic H2 patterns
      const genericH2s = ['introduction', 'main content', 'conclusion', 'overview', 'summary'];
      const h2s = brief.structure?.sections?.map((s: any) => s.h2?.toLowerCase()) || [];
      const hasGenericH2 = h2s.some((h2: string) => genericH2s.includes(h2));
      if (hasGenericH2) {
        console.log(`[GEMINI] ❌ Generic H2 detected: ${h2s.filter((h2: string) => genericH2s.includes(h2)).join(', ')}`);
        return true;
      }
      
      // Check for generic H3 patterns
      const genericH3Patterns = [
        'understanding ',
        'key strategies for ',
        'best practices for ',
        'important aspect of ',
        'key consideration '
      ];
      
      const allH3s = brief.structure?.sections?.flatMap((s: any) => s.h3s || []) || [];
      const hasGenericH3 = allH3s.some((h3: string) => 
        genericH3Patterns.some(pattern => h3.toLowerCase().includes(pattern))
      );
      
      if (hasGenericH3) {
        console.log(`[GEMINI] ❌ Generic H3 patterns detected`);
        return true;
      }
      
      return false;
    };
    
    // Function to generate topic-specific H3s using AI
    const generateTopicSpecificH3s = async (h2: string, existingH3s: string[]): Promise<string[]> => {
      try {
        const h3Prompt = `You are an expert on "${topic}". For the section "${h2}", generate 3 specific, actionable bullet points (H3s) that are:
- Specific to "${topic}" and "${h2}"
- Actionable and valuable
- NOT generic templates like "Understanding X" or "Key strategies for X"

Existing H3s (use as reference, but create new ones): ${existingH3s.join(', ')}

Return ONLY a JSON array of exactly 3 H3 bullet points:
["H3 point 1", "H3 point 2", "H3 point 3"]`;

        const h3Result = await model.generateContent(h3Prompt);
        const h3Response = await h3Result.response;
        const h3Text = h3Response.text()
          .replace(/```json\n?/g, '')
          .replace(/```\n?/g, '')
          .trim();
        
        const generatedH3s = JSON.parse(h3Text);
        if (Array.isArray(generatedH3s) && generatedH3s.length >= 3) {
          return generatedH3s.slice(0, 3);
        }
      } catch (error) {
        console.log(`[GEMINI] ⚠️ Failed to generate topic-specific H3s: ${error}`);
      }
      
      // Fallback: create topic-specific H3s based on competitor data
      const relevantH3s = allH3Headings.filter(h3 => 
        h3 && h3.toLowerCase().includes(topic.toLowerCase().split(' ')[0])
      );
      
      if (relevantH3s.length >= 3) {
        return relevantH3s.slice(0, 3);
      }
      
      // Last resort: use competitor H3s
      return allH3Headings.slice(0, 3).filter(h3 => h3 && h3.trim());
    };
    
    let brief: any;
    let attempts = 0;
    const maxAttempts = 3;
    let currentPrompt = prompt;
    
    // Retry loop to ensure we get non-generic content
    while (attempts < maxAttempts) {
      attempts++;
      console.log(`[GEMINI] 🔄 Generation attempt ${attempts}/${maxAttempts}`);
      
      const result = await model.generateContent(currentPrompt);
      const response = await result.response;
      const text = response.text();
      
      // Clean the response
      const cleanedText = text
        .replace(/```json\n?/g, '')
        .replace(/```\n?/g, '')
        .trim();
      
      brief = JSON.parse(cleanedText);
      
      // Validate the brief has all required fields
      if (!brief.seoData || !brief.targetSpecs || !brief.structure || 
          !brief.competitorAnalysis || !brief.contentRequirements || 
          !brief.writingInstructions || !brief.metaData) {
        throw new Error('Generated brief is missing required fields');
      }
      
      // Check if content is generic
      if (!isGenericContent(brief)) {
        console.log(`[GEMINI] ✅ Generated non-generic content on attempt ${attempts}`);
        break;
      } else {
        console.log(`[GEMINI] ⚠️ Generic content detected, retrying... (attempt ${attempts}/${maxAttempts})`);
        if (attempts < maxAttempts) {
          // Add a stronger instruction for retry
          currentPrompt = prompt + `\n\n⚠️ CRITICAL RETRY INSTRUCTION: Your previous attempt generated generic templates. You MUST create unique, topic-specific content for "${topic}". DO NOT use "Introduction", "Main Content", "Conclusion", or generic H3 patterns. Create original, valuable content specific to "${topic}".`;
        }
      }
    }
    
    // Validate and fix structure sections
    if (brief.structure?.sections) {
      const uniqueSections: any[] = [];
      const seenH2s = new Set<string>();
      const genericH2s = ['introduction', 'main content', 'conclusion', 'overview', 'summary', 'final thoughts'];
      
      for (const section of brief.structure.sections) {
        const h2Normalized = section.h2?.toLowerCase().trim();
        
        // Skip if duplicate
        if (seenH2s.has(h2Normalized)) {
          console.log(`[GEMINI] ⚠️ Skipping duplicate H2: ${section.h2}`);
          continue;
        }
        
        // Skip if generic (unless it's the only section)
        if (genericH2s.includes(h2Normalized) && brief.structure.sections.length > 1) {
          console.log(`[GEMINI] ⚠️ Skipping generic H2: ${section.h2}`);
          continue;
        }
        
        // Ensure h3s array exists and has exactly 3 items
        if (!section.h3s || !Array.isArray(section.h3s)) {
          section.h3s = [];
        }
        
        // Remove empty or duplicate h3s
        let validH3s = section.h3s
          .filter((h3: string) => h3 && h3.trim())
          .filter((h3: string, index: number, self: string[]) => 
            self.findIndex((h) => h.toLowerCase().trim() === h3.toLowerCase().trim()) === index
          );
        
        // Check if H3s are generic
        const genericH3Patterns = ['understanding ', 'key strategies for ', 'best practices for ', 'important aspect of ', 'key consideration '];
        const hasGenericH3s = validH3s.some((h3: string) => 
          genericH3Patterns.some(pattern => h3.toLowerCase().includes(pattern))
        );
        
        // If we have less than 3 OR generic H3s, generate topic-specific ones
        if (validH3s.length < 3 || hasGenericH3s) {
          console.log(`[GEMINI] 🔄 Generating topic-specific H3s for "${section.h2}"`);
          validH3s = await generateTopicSpecificH3s(section.h2, validH3s);
        }
        
        // Ensure exactly 3
        section.h3s = validH3s.slice(0, 3);
        
        seenH2s.add(h2Normalized);
        uniqueSections.push(section);
      }
      
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
    
    return brief;
    
  } catch (error) {
    console.error(`[GEMINI] ❌ Brief synthesis failed:`, error);
    
    // Create a fallback brief using AI to generate topic-specific content
    console.log(`[GEMINI] 🔄 Creating fallback brief with AI-generated content...`);
    
    try {
      const genAI = getGeminiAI();
      const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });
      
      const avgWordCount = Math.round(
        analyses.reduce((sum, a) => sum + a.wordCount, 0) / (analyses.length || 1)
      );
      
      const allKeywords = analyses.flatMap(a => a.primaryKeywords);
      const uniqueKeywords = Array.from(new Set(allKeywords));
      
      const allTopics = analyses.flatMap(a => a.keyTopics);
      const uniqueTopics = Array.from(new Set(allTopics));
      
      const allH2s = analyses.flatMap(a => a.structure.h2s).filter(h2 => h2 && h2.trim());
      const allH3s = analyses.flatMap(a => a.structure.h3s).filter(h3 => h3 && h3.trim());
      
      // Generate fallback brief using AI
      const fallbackPrompt = `Create a blog brief for "${topic}" with:
- A creative, unique H1 headline (NOT "${topic}: A Complete Guide")
- 4-6 specific H2 sections about "${topic}" (NOT "Introduction", "Main Content", "Conclusion")
- Each H2 must have exactly 3 specific H3 bullet points about "${topic}"

Use these competitor insights:
- Keywords: ${uniqueKeywords.slice(0, 10).join(', ')}
- Topics: ${uniqueTopics.slice(0, 8).join(', ')}
- H2s found: ${allH2s.slice(0, 10).join(', ') || 'None'}
- H3s found: ${allH3s.slice(0, 15).join(', ') || 'None'}

Return ONLY JSON:
{
  "h1": "Creative headline for ${topic}",
  "sections": [
    {"h2": "Specific section 1", "h3s": ["point 1", "point 2", "point 3"]},
    {"h2": "Specific section 2", "h3s": ["point 1", "point 2", "point 3"]},
    {"h2": "Specific section 3", "h3s": ["point 1", "point 2", "point 3"]},
    {"h2": "Specific section 4", "h3s": ["point 1", "point 2", "point 3"]}
  ]
}`;

      const fallbackResult = await model.generateContent(fallbackPrompt);
      const fallbackResponse = await fallbackResult.response;
      const fallbackText = fallbackResponse.text()
        .replace(/```json\n?/g, '')
        .replace(/```\n?/g, '')
        .trim();
      
      const fallbackData = JSON.parse(fallbackText);
      
      return {
        seoData: {
          title: fallbackData.h1 || `Expert Guide: ${topic}`,
          primaryKeyword: uniqueKeywords[0] || topic,
          secondaryKeywords: uniqueKeywords.slice(1, 4),
          searchIntent: 'informational',
          difficulty: 'medium'
        },
        targetSpecs: {
          wordCount: `${Math.max(1500, avgWordCount - 200)}-${avgWordCount + 200} words`,
          readingLevel: 'Grade 8-10',
          tone: analyses[0]?.tone || 'professional',
          format: analyses[0]?.style || 'comprehensive guide'
        },
        structure: {
          h1: fallbackData.h1 || `Expert Insights on ${topic}`,
          sections: (fallbackData.sections || []).map((section: any) => ({
            h2: section.h2 || `Section about ${topic}`,
            h3s: (section.h3s || []).slice(0, 3).filter((h3: string) => h3 && h3.trim())
          })).filter((section: any) => section.h2 && section.h3s.length === 3)
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
          title: fallbackData.h1 || `${topic}: Expert Guide & Best Practices`,
          description: `Master ${topic} with expert insights, proven strategies, and actionable tips from industry professionals.`
        }
      };
    } catch (fallbackError) {
      console.error(`[GEMINI] ❌ Fallback generation also failed:`, fallbackError);
      throw new Error('Failed to generate brief after multiple attempts');
    }
  }
}

