import jsPDF from 'jspdf';

interface BriefData {
  topic: string;
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

/**
 * Generates a PDF buffer from brief data using jsPDF
 */
export async function generateBriefPDF(brief: BriefData): Promise<Buffer> {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 20;
  const maxWidth = pageWidth - 2 * margin;
  let yPosition = margin;

  // Helper function to add text with word wrapping
  const addText = (text: string, fontSize: number = 10, bold: boolean = false) => {
    doc.setFontSize(fontSize);
    doc.setFont('helvetica', bold ? 'bold' : 'normal');
    doc.setTextColor(0, 0, 0); // Always black

    // Split text into lines that fit the page width
    const lines = doc.splitTextToSize(text, maxWidth);
    
    // Check if we need a new page
    if (yPosition + (lines.length * fontSize * 0.4) > pageHeight - margin) {
      doc.addPage();
      yPosition = margin;
    }

    doc.text(lines, margin, yPosition, { maxWidth });
    yPosition += lines.length * fontSize * 0.4 + 3;
  };

  // Helper function to add section header (simple, bold, no emojis)
  const addSectionHeader = (title: string) => {
    if (yPosition > pageHeight - 30) {
      doc.addPage();
      yPosition = margin;
    }
    yPosition += 8;
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(0, 0, 0); // Black
    const titleLines = doc.splitTextToSize(title, maxWidth);
    doc.text(titleLines, margin, yPosition, { maxWidth });
    yPosition += titleLines.length * 5 + 5;
  };

  // Title - Centered and within margins
  doc.setFontSize(20);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(0, 0, 0); // Black
  const titleText = 'Content Brief';
  // Use pageWidth / 2 as x position with align center
  doc.text(titleText, pageWidth / 2, yPosition, { align: 'center' });
  yPosition += 12;
  
  // Topic - Centered and wrapped within margins
  doc.setFontSize(16);
  doc.setFont('helvetica', 'normal');
  const topicLines = doc.splitTextToSize(brief.topic, maxWidth);
  // Center each line of the topic
  topicLines.forEach((line: string) => {
    doc.text(line, pageWidth / 2, yPosition, { align: 'center' });
    yPosition += 7;
  });
  yPosition += 10;

  // SEO Data
  addSectionHeader('SEO Data');
  addText(`Title: ${brief.seo_data.title}`, 11, true);
  addText(`Primary Keyword: ${brief.seo_data.primaryKeyword}`, 10);
  addText(`Secondary Keywords: ${brief.seo_data.secondaryKeywords.join(', ')}`, 10);
  addText(`Search Intent: ${brief.seo_data.searchIntent}`, 10);
  addText(`Difficulty: ${brief.seo_data.difficulty}`, 10);

  // Target Specifications
  addSectionHeader('Target Specifications');
  addText(`Word Count: ${brief.target_specs.wordCount}`, 10);
  addText(`Reading Level: ${brief.target_specs.readingLevel}`, 10);
  addText(`Tone: ${brief.target_specs.tone}`, 10);
  addText(`Format: ${brief.target_specs.format}`, 10);

  // Recommended Structure
  addSectionHeader('Recommended Structure');
  addText(`H1: ${brief.structure.h1}`, 12, true);
  yPosition += 2;
  brief.structure.sections.forEach((section) => {
    addText(`H2: ${section.h2}`, 11, true);
    section.h3s.forEach((h3) => {
      addText(`  • H3: ${h3}`, 10);
    });
    yPosition += 2;
  });

  // Competitor Analysis
  addSectionHeader('Competitor Analysis');
  addText(`Common Topics: ${brief.competitor_analysis.commonTopics.join(', ')}`, 10);
  addText(`Average Word Count: ${brief.competitor_analysis.avgWordCount}`, 10);
  addText('Content Gaps:', 11, true);
  brief.competitor_analysis.gaps.forEach((gap) => {
    addText(`  • ${gap}`, 10);
  });

  // Content Requirements
  addSectionHeader('Content Requirements');
  addText('Must Include:', 11, true);
  brief.content_requirements.mustInclude.forEach((item) => {
    addText(`  • ${item}`, 10);
  });
  yPosition += 2;
  addText('Internal Links:', 11, true);
  brief.content_requirements.internalLinks.forEach((item) => {
    addText(`  • ${item}`, 10);
  });
  yPosition += 2;
  addText('External Links:', 11, true);
  brief.content_requirements.externalLinks.forEach((item) => {
    addText(`  • ${item}`, 10);
  });
  yPosition += 2;
  addText('Visuals:', 11, true);
  brief.content_requirements.visuals.forEach((item) => {
    addText(`  • ${item}`, 10);
  });

  // Writing Instructions
  addSectionHeader('Writing Instructions');
  addText(`Audience: ${brief.writing_instructions.audience}`, 10);
  addText(`Voice: ${brief.writing_instructions.voice}`, 10);
  addText('Key Points:', 11, true);
  brief.writing_instructions.keyPoints.forEach((point) => {
    addText(`  • ${point}`, 10);
  });
  yPosition += 2;
  addText('Avoid:', 11, true);
  brief.writing_instructions.avoid.forEach((item) => {
    addText(`  • ${item}`, 10);
  });
  yPosition += 2;
  addText(`CTA: ${brief.writing_instructions.cta}`, 10);

  // Meta Data
  addSectionHeader('Meta Data');
  addText(`Meta Title: ${brief.meta_data.title}`, 10);
  addText(`Meta Description: ${brief.meta_data.description}`, 10);

  // Sources (if available)
  if (brief.meta_data.sources && brief.meta_data.sources.length > 0) {
    addSectionHeader('Sources Analyzed');
    brief.meta_data.sources.forEach((source, index) => {
      addText(`${index + 1}. ${source.title || source.url}`, 10);
      addText(`   ${source.url}`, 9);
      yPosition += 2;
    });
    if (brief.meta_data.sourcesAnalyzed) {
      addText(
        `Quality: ${brief.meta_data.sourcesAnalyzed}/${brief.meta_data.totalSourcesFound || brief.meta_data.sources.length} sources analyzed`,
        9
      );
    }
  }

  // Add footer to all pages
  const pageCount = doc.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(0, 0, 0); // Black
    doc.text(
      `Generated by Contenov • Page ${i} of ${pageCount}`,
      pageWidth / 2,
      pageHeight - 10,
      { align: 'center' }
    );
  }

  // Convert to buffer
  const pdfOutput = doc.output('arraybuffer');
  return Buffer.from(pdfOutput);
}

