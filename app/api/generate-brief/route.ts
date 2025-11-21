import { NextRequest, NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { findBlogPosts } from '@/lib/serp-service';
import { extractMultipleBlogContents } from '@/lib/jina-service';
import { analyzeBlogIndividually, synthesizeFinalBrief } from '@/lib/gemini-service';
import { supabaseAdmin } from '@/lib/supabase';
import { generateBriefPDF } from '@/lib/pdf-service';
import { sendBriefEmail } from '@/lib/email-service';

export async function POST(request: NextRequest) {
  console.log('\n🚀 ========================================');
  console.log('🚀 STARTING BRIEF GENERATION PIPELINE');
  console.log('🚀 ========================================\n');
  
  const startTime = Date.now();
  
  try {
    // 1. Verify authentication
    const supabase = createRouteHandlerClient({ cookies });
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      console.error('❌ Authentication failed');
      return NextResponse.json(
        { error: 'Unauthorized. Please sign in.' },
        { status: 401 }
      );
    }
    
    console.log(`👤 User: ${user.email} (${user.id})\n`);
    
    // 2. Check subscription status and credits
    const { data: userData, error: userError } = await supabaseAdmin
      .from('users')
      .select('credits_remaining, subscription_status, plan_type')
      .eq('id', user.id)
      .single();
    
    if (userError || !userData) {
      console.error('❌ Failed to fetch user data:', userError);
      return NextResponse.json(
        { error: 'Failed to verify account status' },
        { status: 500 }
      );
    }
    
    // Check subscription status
    if (userData.subscription_status !== 'active') {
      console.error('❌ No active subscription');
      return NextResponse.json(
        { 
          error: 'No active subscription. Please subscribe to a plan to generate briefs.',
          code: 'NO_SUBSCRIPTION'
        },
        { status: 403 }
      );
    }
    
    // Check credits
    if (userData.credits_remaining < 1) {
      console.error('❌ Insufficient credits');
      return NextResponse.json(
        { 
          error: 'Out of credits. Your credits will reset on your next billing cycle, or upgrade your plan for more.',
          code: 'NO_CREDITS',
          creditsRemaining: 0
        },
        { status: 403 }
      );
    }
    
    console.log(`💳 Credits remaining: ${userData.credits_remaining}`);
    console.log(`📦 Plan: ${userData.plan_type}\n`);
    
    // 3. Parse request body
    const body = await request.json();
    const { topic } = body;
    
    if (!topic || typeof topic !== 'string' || topic.trim().length < 3) {
      return NextResponse.json(
        { error: 'Topic must be at least 3 characters long' },
        { status: 400 }
      );
    }
    
    console.log(`📝 Topic: "${topic}"\n`);
    
    // 2. Find blog posts using SERP API (multi-layer fallback)
    console.log('🔍 STEP 1: Finding relevant blog posts...');
    console.log('─────────────────────────────────────────');
    
    let blogResults;
    try {
      blogResults = await findBlogPosts(topic);
      console.log(`✅ Step 1 complete: Found ${blogResults.length} blog URLs`);
      console.log('📚 Blog URLs discovered:');
      blogResults.forEach((result, index) => {
        console.log(`   ${index + 1}. ${result.title}`);
        console.log(`      ${result.url}`);
      });
      console.log('');
    } catch (error) {
      console.error('❌ Step 1 failed:', error);
      return NextResponse.json(
        { 
          error: error instanceof Error ? error.message : 'Failed to find blog posts',
          step: 'blog_search'
        },
        { status: 500 }
      );
    }
    
    // 3. Extract content from blogs using Jina.ai
    console.log('📄 STEP 2: Extracting content from blog posts...');
    console.log('─────────────────────────────────────────');
    
    const urlsToExtract = blogResults.map(r => r.url);
    let extractedContents;
    
    try {
      extractedContents = await extractMultipleBlogContents(urlsToExtract);
      console.log(`✅ Step 2 complete: Extracted ${extractedContents.length} blog contents`);
      console.log('✓ Successfully extracted content from:');
      extractedContents.forEach((content, index) => {
        console.log(`   ${index + 1}. ${content.title.substring(0, 60)}... (${content.wordCount} words)`);
        console.log(`      ${content.url}`);
      });
      console.log('');
    } catch (error) {
      console.error('❌ Step 2 failed:', error);
      return NextResponse.json(
        { 
          error: error instanceof Error ? error.message : 'Failed to extract blog content',
          step: 'content_extraction'
        },
        { status: 500 }
      );
    }
    
    // 4. Analyze each blog individually with Gemini
    console.log('🔍 STEP 3: Analyzing each blog post...');
    console.log('─────────────────────────────────────────');
    
    const analyses = [];
    
    for (let i = 0; i < extractedContents.length; i++) {
      const extracted = extractedContents[i];
      try {
        console.log(`🤖 Analyzing blog ${i + 1}/${extractedContents.length}: ${extracted.title.substring(0, 50)}...`);
        const analysis = await analyzeBlogIndividually(
          extracted.content,
          extracted.url,
          extracted.title
        );
        analyses.push(analysis);
        console.log(`✓ Analysis ${i + 1} complete: ${analysis.primaryKeywords.slice(0, 3).join(', ')}`);
        
        // Small delay between AI calls to avoid rate limiting
        await new Promise(resolve => setTimeout(resolve, 500));
        
      } catch (error) {
        console.error(`⚠️  Failed to analyze ${extracted.url}, skipping...`);
        // Continue with other blogs even if one fails
      }
    }
    
    if (analyses.length === 0) {
      console.error('❌ Step 3 failed: No blogs could be analyzed');
      return NextResponse.json(
        { 
          error: 'Failed to analyze any blog posts',
          step: 'blog_analysis'
        },
        { status: 500 }
      );
    }
    
    console.log(`✅ Step 3 complete: Analyzed ${analyses.length} blogs\n`);
    
    // 5. Synthesize final comprehensive brief
    console.log('🎯 STEP 4: Synthesizing final brief...');
    console.log('─────────────────────────────────────────');
    
    let finalBrief;
    
    try {
      finalBrief = await synthesizeFinalBrief(analyses, topic);
      console.log(`✅ Step 4 complete: Brief synthesized\n`);
    } catch (error) {
      console.error('❌ Step 4 failed:', error);
      
      // Retry once
      console.log('🔄 Retrying brief synthesis...');
      try {
        await new Promise(resolve => setTimeout(resolve, 2000));
        finalBrief = await synthesizeFinalBrief(analyses, topic);
        console.log(`✅ Retry successful: Brief synthesized\n`);
      } catch (retryError) {
        console.error('❌ Retry failed:', retryError);
        return NextResponse.json(
          { 
            error: 'Failed to generate brief after retry',
            step: 'brief_synthesis'
          },
          { status: 500 }
        );
      }
    }
    
    // 6. Save to database and deduct credit
    console.log('💾 STEP 5: Saving brief to database...');
    console.log('─────────────────────────────────────────');
    
    try {
      const { data: savedBrief, error: saveError } = await supabaseAdmin
        .from('briefs')
        .insert({
          user_id: user.id,
          topic: topic,
          seo_data: finalBrief.seoData,
          target_specs: finalBrief.targetSpecs,
          structure: finalBrief.structure,
          competitor_analysis: finalBrief.competitorAnalysis,
          content_requirements: finalBrief.contentRequirements,
          writing_instructions: finalBrief.writingInstructions,
          meta_data: {
            ...finalBrief.metaData,
            sources: blogResults.map(r => ({ url: r.url, title: r.title })),
            sourcesAnalyzed: analyses.length,
            totalSourcesFound: blogResults.length
          }
        })
        .select()
        .single();
      
      if (saveError) throw saveError;
      
      console.log(`✅ Step 5 complete: Brief saved with ID: ${savedBrief.id}\n`);
      
      // 7. Generate PDF and upload to Supabase Storage
      console.log('📄 STEP 6: Generating PDF and uploading to storage...');
      console.log('─────────────────────────────────────────');
      
      let pdfUrl: string | null = null;
      
      try {
        // Generate PDF
        const pdfBuffer = await generateBriefPDF({
          topic: topic,
          seo_data: finalBrief.seoData,
          target_specs: finalBrief.targetSpecs,
          structure: finalBrief.structure,
          competitor_analysis: finalBrief.competitorAnalysis,
          content_requirements: finalBrief.contentRequirements,
          writing_instructions: finalBrief.writingInstructions,
          meta_data: {
            ...finalBrief.metaData,
            sources: blogResults.map(r => ({ url: r.url, title: r.title })),
            sourcesAnalyzed: analyses.length,
            totalSourcesFound: blogResults.length
          }
        });
        
        // Upload to Supabase Storage
        const fileName = `briefs/${user.id}/${savedBrief.id}.pdf`;
        const { data: uploadData, error: uploadError } = await supabaseAdmin.storage
          .from('brief-pdfs')
          .upload(fileName, pdfBuffer, {
            contentType: 'application/pdf',
            upsert: false
          });
        
        if (uploadError) {
          console.error('⚠️  Warning: Failed to upload PDF:', uploadError);
        } else {
          // Get public URL
          const { data: urlData } = supabaseAdmin.storage
            .from('brief-pdfs')
            .getPublicUrl(fileName);
          
          pdfUrl = urlData.publicUrl;
          
          // Update brief with PDF URL
          await supabaseAdmin
            .from('briefs')
            .update({ pdf_url: pdfUrl })
            .eq('id', savedBrief.id);
          
          console.log(`✅ Step 6 complete: PDF uploaded. URL: ${pdfUrl}\n`);
        }
      } catch (error) {
        console.error('⚠️  Warning: PDF generation/upload failed:', error);
        // Don't fail the request if PDF generation fails - brief was already generated
      }
      
      // 8. Deduct 1 credit
      console.log('💳 STEP 7: Deducting credit...');
      console.log('─────────────────────────────────────────');
      
      const newCreditsRemaining = userData.credits_remaining - 1;
      
      const { error: creditError } = await supabaseAdmin
        .from('users')
        .update({ 
          credits_remaining: newCreditsRemaining,
          updated_at: new Date().toISOString()
        })
        .eq('id', user.id);
      
      if (creditError) {
        console.error('⚠️  Warning: Failed to deduct credit:', creditError);
        // Don't fail the request if credit deduction fails - brief was already generated
      } else {
        console.log(`✅ Step 7 complete: Credit deducted. New balance: ${newCreditsRemaining}\n`);
      }
      
      // 9. Send email notification (async, don't wait for it)
      if (pdfUrl) {
        console.log('📧 STEP 8: Sending email notification...');
        console.log('─────────────────────────────────────────');
        
        // Get user's name and email
        const { data: userInfo } = await supabaseAdmin
          .from('users')
          .select('name, email')
          .eq('id', user.id)
          .single();
        
        if (userInfo?.email) {
          sendBriefEmail({
            to: userInfo.email,
            userName: userInfo.name || 'there',
            briefTopic: topic,
            pdfUrl: pdfUrl,
            briefId: savedBrief.id,
          }).then((result) => {
            if (result.success) {
              console.log('✅ Email sent successfully\n');
            } else {
              console.error('⚠️  Warning: Failed to send email:', result.error);
            }
          }).catch((error) => {
            console.error('⚠️  Warning: Email sending error:', error);
          });
        }
      }
      
      const endTime = Date.now();
      const totalTime = ((endTime - startTime) / 1000).toFixed(2);
      
      console.log('🎉 ========================================');
      console.log('🎉 BRIEF GENERATION COMPLETE!');
      console.log(`🎉 Total time: ${totalTime} seconds`);
      console.log(`🎉 Brief ID: ${savedBrief.id}`);
      if (pdfUrl) {
        console.log(`🎉 PDF URL: ${pdfUrl}`);
      }
      console.log('🎉 ========================================\n');
      
      return NextResponse.json({
        success: true,
        briefId: savedBrief.id,
        brief: finalBrief,
        creditsRemaining: newCreditsRemaining,
        pdfUrl: pdfUrl || undefined,
        metadata: {
          blogsAnalyzed: analyses.length,
          totalTime: `${totalTime}s`,
          topic: topic
        },
        debug: {
          sourcesFound: blogResults.length,
          sourcesExtracted: extractedContents.length,
          sourcesAnalyzed: analyses.length,
          blogUrls: blogResults.map(r => r.url),
          extractedTitles: extractedContents.map(b => b.title),
          extractedWordCounts: extractedContents.map(b => ({
            url: b.url,
            words: b.wordCount
          }))
        }
      });
      
    } catch (error) {
      console.error('❌ Step 5 failed:', error);
      return NextResponse.json(
        { 
          error: 'Failed to save brief to database',
          step: 'database_save',
          details: error instanceof Error ? error.message : 'Unknown error'
        },
        { status: 500 }
      );
    }
    
  } catch (error) {
    console.error('\n❌ ========================================');
    console.error('❌ PIPELINE FAILED');
    console.error('❌ ========================================');
    console.error(error);
    console.error('❌ ========================================\n');
    
    return NextResponse.json(
      { 
        error: 'An unexpected error occurred',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

