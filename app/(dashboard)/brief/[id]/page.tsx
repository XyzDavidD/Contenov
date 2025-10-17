"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Download,
  BarChart3,
  Target,
  FileText,
  Search,
  Lightbulb,
  PenTool,
  Tag,
  TrendingUp,
  Loader2,
  AlertCircle,
  ArrowLeft,
} from "lucide-react";
import { cn } from "@/lib/utils";
import jsPDF from "jspdf";

// Types matching the database structure
interface BriefData {
  id: string;
  topic: string;
  created_at: string;
  seo_data: {
    title: string;
    primaryKeyword: string;
    secondaryKeywords: string[];
    searchIntent: string;
    difficulty: string;
  };
  target_specs: {
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
  competitor_analysis: {
    commonTopics: string[];
    avgWordCount: string;
    gaps: string[];
  };
  content_requirements: {
    mustInclude: string[];
    internalLinks: string[];
    externalLinks: string[];
    visuals: string[];
  };
  writing_instructions: {
    audience: string;
    voice: string;
    keyPoints: string[];
    avoid: string[];
    cta: string;
  };
  meta_data: {
    title: string;
    description: string;
    sources?: Array<{ url: string; title: string }>;
    sourcesAnalyzed?: number;
    totalSourcesFound?: number;
  };
}

// Editable section component
function EditableSection({
  title,
  icon: Icon,
  children,
}: {
  title: string;
  icon: any;
  children: React.ReactNode;
}) {
  return (
    <section className="mb-10">
      <div className="flex items-center gap-2 mb-4">
        <Icon className="h-5 w-5 text-primary" />
        <h2 className="text-lg font-bold gradient-text">{title}</h2>
      </div>
      <div className="border-b border-border mb-4" />
      <div className="text-secondary/90 leading-relaxed">{children}</div>
    </section>
  );
}

export default function BriefPage() {
  const params = useParams();
  const router = useRouter();
  const briefId = params.id as string;

  const [brief, setBrief] = useState<BriefData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch brief on mount
  useEffect(() => {
    async function fetchBrief() {
      try {
        setLoading(true);
        const response = await fetch(`/api/briefs/${briefId}`);
        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || 'Failed to load brief');
        }

        setBrief(data.brief);
      } catch (err) {
        console.error('Error loading brief:', err);
        setError(err instanceof Error ? err.message : 'Failed to load brief');
      } finally {
        setLoading(false);
      }
    }

    if (briefId) {
      fetchBrief();
    }
  }, [briefId]);

  const handleExportPDF = () => {
    if (!brief) return;

    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const margin = 20;
    const maxWidth = pageWidth - 2 * margin;
    let yPosition = margin;

    // Helper function to add text with line breaks
    const addText = (text: string, fontSize: number = 10, isBold: boolean = false) => {
      doc.setFontSize(fontSize);
      doc.setFont('helvetica', isBold ? 'bold' : 'normal');
      
      const lines = doc.splitTextToSize(text, maxWidth);
      lines.forEach((line: string) => {
        if (yPosition > pageHeight - 20) {
          doc.addPage();
          yPosition = margin;
        }
        doc.text(line, margin, yPosition);
        yPosition += fontSize * 0.5;
      });
      yPosition += 5;
    };

    const addSection = (title: string, content: string[] | string) => {
      // Section title
      addText(title, 14, true);
      yPosition += 2;
      
      // Section content
      if (Array.isArray(content)) {
        content.forEach(item => {
          addText(`• ${item}`, 10);
        });
      } else {
        addText(content, 10);
      }
      yPosition += 8;
    };

    // Title
    doc.setFontSize(20);
    doc.setFont('helvetica', 'bold');
    doc.text('Content Brief', margin, yPosition);
    yPosition += 10;

    doc.setFontSize(16);
    doc.text(brief.topic, margin, yPosition);
    yPosition += 15;

    // SEO Data
    addSection('SEO Data', [
      `Title: ${brief.seo_data.title}`,
      `Primary Keyword: ${brief.seo_data.primaryKeyword}`,
      `Secondary Keywords: ${brief.seo_data.secondaryKeywords.join(', ')}`,
      `Search Intent: ${brief.seo_data.searchIntent}`,
      `Difficulty: ${brief.seo_data.difficulty}`
    ]);

    // Target Specifications
    addSection('Target Specifications', [
      `Word Count: ${brief.target_specs.wordCount}`,
      `Reading Level: ${brief.target_specs.readingLevel}`,
      `Tone: ${brief.target_specs.tone}`,
      `Format: ${brief.target_specs.format}`
    ]);

    // Structure
    addText('Recommended Structure', 14, true);
    yPosition += 2;
    addText(`H1: ${brief.structure.h1}`, 10);
    brief.structure.sections.forEach((section, index) => {
      addText(`H2: ${section.h2}`, 11, true);
      section.h3s.forEach(h3 => {
        addText(`  H3: ${h3}`, 10);
      });
    });
    yPosition += 8;

    // Competitor Analysis
    addSection('Competitor Analysis', [
      `Common Topics: ${brief.competitor_analysis.commonTopics.join(', ')}`,
      `Average Word Count: ${brief.competitor_analysis.avgWordCount}`,
      `Content Gaps: ${brief.competitor_analysis.gaps.join(', ')}`
    ]);

    // Content Requirements
    addText('Content Requirements', 14, true);
    yPosition += 2;
    addText('Must Include:', 11, true);
    brief.content_requirements.mustInclude.forEach(item => addText(`• ${item}`, 10));
    addText('Internal Links:', 11, true);
    brief.content_requirements.internalLinks.forEach(item => addText(`• ${item}`, 10));
    addText('External Links:', 11, true);
    brief.content_requirements.externalLinks.forEach(item => addText(`• ${item}`, 10));
    addText('Visuals:', 11, true);
    brief.content_requirements.visuals.forEach(item => addText(`• ${item}`, 10));
    yPosition += 8;

    // Writing Instructions
    addSection('Writing Instructions', [
      `Audience: ${brief.writing_instructions.audience}`,
      `Voice: ${brief.writing_instructions.voice}`,
      `Key Points: ${brief.writing_instructions.keyPoints.join(', ')}`,
      `Avoid: ${brief.writing_instructions.avoid.join(', ')}`,
      `CTA: ${brief.writing_instructions.cta}`
    ]);

    // Meta Data
    addSection('Meta Data', [
      `Meta Title: ${brief.meta_data.title}`,
      `Meta Description: ${brief.meta_data.description}`
    ]);

    // Save the PDF
    doc.save(`${brief.topic.replace(/[^a-z0-9]/gi, '_')}_brief.pdf`);
  };

  const handleBack = () => {
    router.push('/exports');
  };


  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto mb-4" />
          <p className="text-muted-foreground">Loading your brief...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error || !brief) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center max-w-md">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-secondary mb-2">Failed to Load Brief</h2>
          <p className="text-muted-foreground mb-6">{error || 'Brief not found'}</p>
          <Button onClick={() => router.push('/dashboard')}>
            Go to Dashboard
          </Button>
        </div>
      </div>
    );
  }

  // Format created date
  const createdDate = new Date(brief.created_at);
  const timeAgo = getTimeAgo(createdDate);

  return (
    <div className="min-h-screen bg-white">
      {/* Top Action Bar */}
      <div className="sticky top-0 z-10 bg-white border-b border-border">
        <div className="max-w-[900px] mx-auto px-6 py-4">
          <div className="flex items-center justify-between mb-4">
            <Button onClick={handleBack} className="gap-2">
              <ArrowLeft className="h-4 w-4" />
              Back to Exports
            </Button>
            
            <Button onClick={handleExportPDF} className="gap-2">
              <Download className="h-4 w-4" />
              Export to PDF
            </Button>
          </div>
          
          {/* Brief Header */}
          <div>
            <p className="text-sm text-muted-foreground mb-1">Brief for:</p>
            <h1 className="text-2xl font-bold text-secondary mb-2">{brief.topic}</h1>
            <p className="text-sm text-muted-foreground">Generated {timeAgo}</p>
          </div>
        </div>
      </div>


      {/* Main Content */}
      <div className="max-w-[900px] mx-auto px-6 py-10">
        
        {/* Sources Section - Show which blogs were analyzed */}
        {brief.meta_data?.sources && brief.meta_data.sources.length > 0 && (
          <div className="mb-8 bg-blue-50 border border-blue-200 rounded-lg p-6">
            <h3 className="font-semibold text-secondary mb-3 flex items-center gap-2">
              <span className="text-xl">📚</span>
              Sources Analyzed
            </h3>
            <ul className="space-y-2">
              {brief.meta_data.sources.map((source: any, index: number) => (
                <li key={index} className="text-sm">
                  <span className="text-muted-foreground mr-2">•</span>
                  <a 
                    href={source.url} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:text-blue-800 hover:underline"
                  >
                    {source.title || source.url}
                  </a>
                </li>
              ))}
            </ul>
            <div className="mt-3 pt-3 border-t border-blue-200">
              <p className="text-xs text-muted-foreground">
                Quality: {brief.meta_data.sourcesAnalyzed || 0}/{brief.meta_data.totalSourcesFound || brief.meta_data.sources.length} sources successfully analyzed
              </p>
            </div>
          </div>
        )}

        {/* SEO Data Section */}
        <EditableSection title="SEO Data" icon={BarChart3}>
          <div className="space-y-6">
            <div>
              <h3 className="font-semibold text-secondary mb-2">Recommended Title</h3>
              <p className="bg-muted/50 p-3 rounded-lg">{brief.seo_data.title}</p>
            </div>

            <div>
              <h3 className="font-semibold text-secondary mb-2">Primary Keyword</h3>
              <div className="bg-muted/50 p-4 rounded-lg">
                <div className="flex items-center justify-between">
                  <span className="font-medium text-primary">{brief.seo_data.primaryKeyword}</span>
                </div>
              </div>
            </div>

            <div>
              <h3 className="font-semibold text-secondary mb-2">Secondary Keywords</h3>
              <div className="flex flex-wrap gap-2">
                {brief.seo_data.secondaryKeywords.map((keyword, index) => (
                  <span
                    key={index}
                    className="px-3 py-1 bg-muted/50 rounded-full text-sm"
                  >
                    {keyword}
                    </span>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <h3 className="font-semibold text-secondary mb-2">Search Intent</h3>
                <p className="bg-muted/50 p-3 rounded-lg">{brief.seo_data.searchIntent}</p>
              </div>
              <div>
                <h3 className="font-semibold text-secondary mb-2">Difficulty</h3>
                <p className="bg-muted/50 p-3 rounded-lg">{brief.seo_data.difficulty}</p>
              </div>
            </div>
          </div>
        </EditableSection>

        {/* Target Specifications */}
        <EditableSection title="Target Specifications" icon={Target}>
          <div className="grid grid-cols-2 gap-6">
            <div>
              <h3 className="font-semibold text-secondary mb-2">Word Count</h3>
              <p className="bg-muted/50 p-3 rounded-lg">{brief.target_specs.wordCount}</p>
            </div>
            <div>
              <h3 className="font-semibold text-secondary mb-2">Reading Level</h3>
              <p className="bg-muted/50 p-3 rounded-lg">{brief.target_specs.readingLevel}</p>
            </div>
            <div>
              <h3 className="font-semibold text-secondary mb-2">Tone</h3>
              <p className="bg-muted/50 p-3 rounded-lg">{brief.target_specs.tone}</p>
            </div>
            <div>
              <h3 className="font-semibold text-secondary mb-2">Format</h3>
              <p className="bg-muted/50 p-3 rounded-lg">{brief.target_specs.format}</p>
            </div>
          </div>
        </EditableSection>

        {/* Recommended Structure */}
        <EditableSection title="Recommended Structure" icon={FileText}>
          <div className="space-y-4">
            <div>
              <h3 className="font-semibold text-secondary mb-2">Main Headline (H1)</h3>
              <p className="text-lg font-semibold text-primary bg-muted/50 p-3 rounded-lg">
                {brief.structure.h1}
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-secondary mb-3">Content Sections</h3>
              <div className="space-y-4">
                {brief.structure.sections.map((section, index) => (
                  <div key={index} className="bg-muted/50 p-4 rounded-lg">
                    <p className="font-semibold text-secondary mb-2">
                      H2: {section.h2}
                    </p>
                    {section.h3s.length > 0 && (
                      <ul className="ml-4 space-y-1">
                        {section.h3s.map((h3, h3Index) => (
                          <li key={h3Index} className="text-sm text-muted-foreground flex items-start">
                            <span className="mr-2">•</span>
                            H3: {h3}
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </EditableSection>

        {/* Competitor Analysis */}
        <EditableSection title="Competitor Analysis" icon={Search}>
          <div className="space-y-6">
            <div>
              <h3 className="font-semibold text-secondary mb-2">Common Topics Covered</h3>
              <ul className="space-y-2">
                {brief.competitor_analysis.commonTopics.map((topic, index) => (
                  <li key={index} className="flex items-start">
                    <TrendingUp className="h-4 w-4 text-primary mr-2 mt-1 flex-shrink-0" />
                    <span>{topic}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h3 className="font-semibold text-secondary mb-2">Average Word Count</h3>
              <p className="bg-muted/50 p-3 rounded-lg">{brief.competitor_analysis.avgWordCount}</p>
              </div>

            <div>
              <h3 className="font-semibold text-secondary mb-2">Content Gaps (Opportunities)</h3>
              <ul className="space-y-2">
                {brief.competitor_analysis.gaps.map((gap, index) => (
                  <li key={index} className="flex items-start">
                    <Lightbulb className="h-4 w-4 text-primary mr-2 mt-1 flex-shrink-0" />
                    <span>{gap}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </EditableSection>

        {/* Content Requirements */}
        <EditableSection title="Content Requirements" icon={Target}>
          <div className="space-y-6">
            <div>
              <h3 className="font-semibold text-secondary mb-2">Must Include</h3>
              <ul className="space-y-2">
                {brief.content_requirements.mustInclude.map((item, index) => (
                  <li key={index} className="flex items-start">
                    <span className="text-primary mr-2">✓</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h3 className="font-semibold text-secondary mb-2">Internal Links (Suggested)</h3>
              <ul className="space-y-2">
                {brief.content_requirements.internalLinks.map((link, index) => (
                  <li key={index} className="flex items-start">
                    <span className="text-primary mr-2">→</span>
                    <span>{link}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h3 className="font-semibold text-secondary mb-2">External Links (Suggested Types)</h3>
              <ul className="space-y-2">
                {brief.content_requirements.externalLinks.map((link, index) => (
                  <li key={index} className="flex items-start">
                    <span className="text-primary mr-2">→</span>
                    <span>{link}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h3 className="font-semibold text-secondary mb-2">Visual Elements</h3>
              <ul className="space-y-2">
                {brief.content_requirements.visuals.map((visual, index) => (
                  <li key={index} className="flex items-start">
                    <span className="text-primary mr-2">📷</span>
                    <span>{visual}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </EditableSection>

        {/* Writing Instructions */}
        <EditableSection title="Writing Instructions" icon={PenTool}>
          <div className="space-y-6">
            <div>
              <h3 className="font-semibold text-secondary mb-2">Target Audience</h3>
              <p className="bg-muted/50 p-3 rounded-lg">{brief.writing_instructions.audience}</p>
            </div>

            <div>
              <h3 className="font-semibold text-secondary mb-2">Brand Voice</h3>
              <p className="bg-muted/50 p-3 rounded-lg">{brief.writing_instructions.voice}</p>
            </div>

            <div>
              <h3 className="font-semibold text-secondary mb-2">Key Points to Emphasize</h3>
              <ul className="space-y-2">
                {brief.writing_instructions.keyPoints.map((point, index) => (
                  <li key={index} className="flex items-start">
                    <span className="text-primary mr-2">•</span>
                    <span>{point}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h3 className="font-semibold text-secondary mb-2">What to Avoid</h3>
              <ul className="space-y-2">
                {brief.writing_instructions.avoid.map((item, index) => (
                  <li key={index} className="flex items-start">
                    <span className="text-red-500 mr-2">×</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h3 className="font-semibold text-secondary mb-2">Call to Action</h3>
              <p className="bg-primary/10 border border-primary/20 p-3 rounded-lg text-primary font-medium">
                {brief.writing_instructions.cta}
              </p>
            </div>
          </div>
        </EditableSection>

        {/* Meta Data */}
        <EditableSection title="Meta Data (For SEO)" icon={Tag}>
          <div className="space-y-4">
            <div>
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-semibold text-secondary">Meta Title</h3>
                <span className={cn(
                  "text-xs font-medium px-2 py-1 rounded",
                  brief.meta_data.title.length >= 50 && brief.meta_data.title.length <= 60
                    ? "bg-green-100 text-green-700"
                    : "bg-yellow-100 text-yellow-700"
                )}>
                  {brief.meta_data.title.length} chars
                </span>
              </div>
              <p className="bg-muted/50 p-3 rounded-lg">{brief.meta_data.title}</p>
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-semibold text-secondary">Meta Description</h3>
                <span className={cn(
                  "text-xs font-medium px-2 py-1 rounded",
                  brief.meta_data.description.length >= 150 && brief.meta_data.description.length <= 160
                    ? "bg-green-100 text-green-700"
                    : "bg-yellow-100 text-yellow-700"
                )}>
                  {brief.meta_data.description.length} chars
                </span>
              </div>
              <p className="bg-muted/50 p-3 rounded-lg">{brief.meta_data.description}</p>
            </div>
          </div>
        </EditableSection>

        {/* Footer */}
        <div className="mt-12 pt-8 border-t border-border">
          <p className="text-center text-sm text-muted-foreground">
            End of brief • Generated by Contenov AI • {new Date(brief.created_at).toLocaleDateString()}
          </p>
        </div>
      </div>
    </div>
  );
}

// Helper function to calculate time ago
function getTimeAgo(date: Date): string {
  const seconds = Math.floor((new Date().getTime() - date.getTime()) / 1000);
  
  if (seconds < 60) return 'just now';
  
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes} minute${minutes === 1 ? '' : 's'} ago`;
  
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} hour${hours === 1 ? '' : 's'} ago`;
  
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days} day${days === 1 ? '' : 's'} ago`;
  
  const months = Math.floor(days / 30);
  if (months < 12) return `${months} month${months === 1 ? '' : 's'} ago`;
  
  const years = Math.floor(months / 12);
  return `${years} year${years === 1 ? '' : 's'} ago`;
}
