"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/hooks/use-auth";
import { useCredits } from "@/lib/hooks/use-credits";
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { ArrowRight, Lightbulb, AlertCircle, Loader2, CreditCard } from "lucide-react";
import Swal from 'sweetalert2';
import { cn } from "@/lib/utils";

type LoadingStep = 'searching' | 'extracting' | 'analyzing' | 'generating';

const loadingMessages = {
  searching: 'Searching for relevant blog posts...',
  extracting: 'Extracting content from blogs...',
  analyzing: 'Analyzing blog posts with AI...',
  generating: 'Generating your comprehensive brief...'
};

export default function FindPage() {
  const router = useRouter();
  const { user } = useAuth();
  const { credits, planType, updateCredits } = useCredits();
  const supabase = createClientComponentClient();
  
  const [topic, setTopic] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [loadingStep, setLoadingStep] = useState<LoadingStep>('searching');
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsGenerating(true);
    setError(null);
    setLoadingStep('searching');
    
    // Show SweetAlert notification
    Swal.fire({
      title: 'Please don\'t close this window',
      html: `
        <div style="text-align: left;">
          <p style="margin-bottom: 10px; font-size: 16px;">Brief generation typically takes around <strong>5 minutes</strong>.</p>
          <p style="margin: 0; font-size: 14px; color: #6b7280;">If it takes longer than 10 minutes, please contact us.</p>
        </div>
      `,
      icon: 'info',
      showConfirmButton: true,
      confirmButtonText: 'Got it!',
      confirmButtonColor: '#3b82f6',
      background: '#ffffff',
      customClass: {
        popup: 'rounded-xl',
        title: 'text-gray-900',
        htmlContainer: 'text-gray-600'
      },
      timer: 20000,
      timerProgressBar: true,
      allowOutsideClick: false,
      allowEscapeKey: false
    });

    try {
      // Call the generate brief API
      const response = await fetch('/api/generate-brief', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ topic: topic.trim() }),
      });

      const data = await response.json();

      if (!response.ok) {
        // Handle specific error codes
        if (data.code === 'NO_CREDITS') {
          throw new Error('Out of credits! Your credits will reset on your next billing cycle, or you can upgrade your plan.');
        } else if (data.code === 'NO_SUBSCRIPTION') {
          throw new Error('No active subscription. Please subscribe to a plan to generate briefs.');
        }
        throw new Error(data.error || 'Failed to generate brief');
      }

      // Success! Update local credits and log debug data
      if (data.creditsRemaining !== undefined) {
        updateCredits(data.creditsRemaining);
        console.log(`💳 Credits updated: ${data.creditsRemaining}`);
      }

      console.log('🎉 ========================================');
      console.log('🎉 BRIEF GENERATION COMPLETE!');
      console.log('🎉 ========================================');
      console.log(`📝 Topic: "${data.metadata?.topic}"`);
      console.log(`⏱️  Total Time: ${data.metadata?.totalTime}`);
      console.log(`💳 Credits Remaining: ${data.creditsRemaining}`);
      console.log(`📚 Sources Found: ${data.debug?.sourcesFound || 0}`);
      console.log(`📄 Sources Extracted: ${data.debug?.sourcesExtracted || 0}`);
      console.log(`🤖 Sources Analyzed: ${data.debug?.sourcesAnalyzed || 0}`);
      console.log('');
      console.log('🔗 Blog URLs Analyzed:');
      data.debug?.blogUrls?.forEach((url: string, index: number) => {
        console.log(`   ${index + 1}. ${url}`);
      });
      console.log('');
      console.log('📊 Content Extracted:');
      data.debug?.extractedWordCounts?.forEach((item: any, index: number) => {
        const title = data.debug?.extractedTitles?.[index] || 'Unknown';
        console.log(`   ${index + 1}. ${title.substring(0, 50)}... (${item.words} words)`);
      });
      console.log('🎉 ========================================\n');
      
      router.push(`/brief/${data.briefId}`);

    } catch (err) {
      console.error('Error generating brief:', err);
      setError(err instanceof Error ? err.message : 'An unexpected error occurred');
      setIsGenerating(false);
    }
  };

  // Simulate loading step progression for better UX
  // In production, you might want to use server-sent events or websockets for real progress
  if (isGenerating && !error) {
    setTimeout(() => {
      if (loadingStep === 'searching') setLoadingStep('extracting');
      else if (loadingStep === 'extracting') setLoadingStep('analyzing');
      else if (loadingStep === 'analyzing') setLoadingStep('generating');
    }, 3000);
  }

  return (
    <div className="flex items-center justify-center min-h-[600px]">
      <div className="w-full max-w-2xl">
        {/* Credit Info Banner */}
        {credits !== null && (
          <div className={cn(
            "mb-6 p-4 rounded-lg border-2",
            credits < 5 ? "bg-red-50 border-red-200" : "bg-blue-50 border-blue-200"
          )}>
            <div className="flex items-center gap-3">
              <CreditCard className={cn("h-5 w-5", credits < 5 ? "text-red-600" : "text-blue-600")} />
              <div>
                <p className={cn("font-semibold", credits < 5 ? "text-red-900" : "text-blue-900")}>
                  {credits} {credits === 1 ? 'credit' : 'credits'} remaining
                </p>
                <p className={cn("text-sm", credits < 5 ? "text-red-700" : "text-blue-700")}>
                  {credits === 0 
                    ? 'Out of credits. Upgrade your plan or wait for monthly renewal.'
                    : credits < 5 
                    ? 'Running low on credits!'
                    : `Each brief costs 1 credit. You can generate ${credits} more ${credits === 1 ? 'brief' : 'briefs'}.`
                  }
                </p>
              </div>
            </div>
          </div>
        )}

        <Card className="rounded-xl">
          <CardHeader className="text-center pb-6">
            <CardTitle className="text-2xl font-bold text-secondary mb-2">
              Generate Your Blog Brief
            </CardTitle>
            <CardDescription className="text-base">
              What blog topic would you like to create a brief for?
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="topic" className="sr-only">Blog Topic</Label>
                <textarea
                  id="topic"
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                  placeholder='e.g., "best project management tools for small teams"'
                  className="w-full min-h-[120px] p-4 text-base border border-input rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 bg-background"
                  rows={3}
                />
              </div>

              <Button 
                type="submit" 
                size="lg" 
                className="w-full group"
                disabled={!topic.trim() || isGenerating}
              >
                {isGenerating ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />
                    {loadingMessages[loadingStep]}
                  </>
                ) : (
                  <>
                    Generate Brief
                    <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                  </>
                )}
              </Button>

              {/* Error Message */}
              {error && (
                <div className="flex items-start gap-3 p-4 bg-red-50 border border-red-200 rounded-lg mt-4">
                  <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-red-900">Generation Failed</p>
                    <p className="text-sm text-red-700 mt-1">{error}</p>
                    <button
                      onClick={() => setError(null)}
                      className="text-sm text-red-600 hover:text-red-800 font-medium mt-2"
                    >
                      Dismiss
                    </button>
                  </div>
                </div>
              )}
            </form>
          </CardContent>
        </Card>

        {/* Quick Tips */}
        <Card className="mt-8 rounded-xl">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Lightbulb className="h-5 w-5 text-primary" />
              Quick Tips
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-3 text-sm text-muted-foreground">
              <li className="flex items-start gap-2">
                <span className="text-primary font-semibold">•</span>
                Be specific with your blog topic
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary font-semibold">•</span>
                Include your target audience if relevant
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary font-semibold">•</span>
                Use natural language
              </li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

