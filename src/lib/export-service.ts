import { Document, Packer, Paragraph, TextRun, HeadingLevel } from 'docx';
import MarkdownIt from 'markdown-it';

const md = new MarkdownIt();

export async function exportToPDF(markdownContent: string, filename: string): Promise<Blob> {
  // Parse markdown and convert to Harvard-style formatted HTML
  const html = md.render(markdownContent);
  
  // Create Harvard-style formatted HTML for PDF generation
  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>${filename}</title>
      <style>
        @page {
          size: A4;
          margin: 1in 0.75in;
        }
        
        body {
          font-family: "Times New Roman", Times, serif;
          font-size: 11pt;
          line-height: 1.15;
          color: #000000;
          margin: 0;
          padding: 0;
        }
        
        /* Harvard Style Header */
        .header {
          text-align: center;
          margin-bottom: 0.5in;
          border-bottom: none;
        }
        
        .header h1 {
          font-size: 14pt;
          font-weight: bold;
          margin: 0 0 8pt 0;
          text-transform: uppercase;
          letter-spacing: 1pt;
        }
        
        .contact-info {
          font-size: 10pt;
          margin: 4pt 0;
          line-height: 1.2;
        }
        
        .contact-info a {
          color: #000000;
          text-decoration: none;
        }
        
        /* Section Headers - Harvard Style */
        h2 {
          font-size: 11pt;
          font-weight: bold;
          text-transform: uppercase;
          letter-spacing: 0.5pt;
          margin: 16pt 0 8pt 0;
          border-bottom: 1pt solid #000000;
          padding-bottom: 2pt;
          page-break-after: avoid;
        }
        
        /* Subsection Headers */
        h3 {
          font-size: 11pt;
          font-weight: bold;
          margin: 12pt 0 4pt 0;
          page-break-after: avoid;
        }
        
        /* Experience Entries */
        .experience-entry {
          margin-bottom: 12pt;
          page-break-inside: avoid;
        }
        
        .job-header {
          margin-bottom: 4pt;
        }
        
        .job-title {
          font-weight: bold;
          display: inline;
        }
        
        .company-date {
          float: right;
          font-weight: normal;
        }
        
        /* Bullet Points */
        ul {
          margin: 4pt 0 8pt 0;
          padding-left: 18pt;
          page-break-inside: avoid;
          break-inside: avoid;
        }
        
        li {
          margin: 2pt 0;
          line-height: 1.15;
          page-break-inside: avoid;
          break-inside: avoid;
        }
        
        /* Professional Summary */
        .summary {
          margin: 12pt 0;
          text-align: justify;
        }
        
        /* Skills Section */
        .skills-section {
          margin: 8pt 0;
        }
        
        .skill-category {
          margin: 4pt 0;
        }
        
        .skill-category strong {
          font-weight: bold;
        }
        
        /* Education */
        .education-entry {
          margin: 8pt 0;
        }
        
        .degree {
          font-weight: bold;
        }
        
        /* Links */
        a {
          color: #000000;
          text-decoration: underline;
        }
        
        /* Ensure consistent spacing */
        p {
          margin: 4pt 0;
        }
        
        /* Remove default margins from first/last elements */
        h1:first-child,
        h2:first-child,
        p:first-child {
          margin-top: 0;
        }
        
        /* Page breaks */
        .page-break {
          page-break-before: always;
          break-before: page;
        }
        
        .no-break {
          page-break-inside: avoid;
          break-inside: avoid;
        }
        
        /* Avoid breaking immediately after headers */
        h1, h2, h3 {
          break-after: avoid;
          page-break-after: avoid;
        }
        
        /* Keep header block together */
        .header { page-break-inside: avoid; break-inside: avoid; }
        
        /* Keep common sections together */
        .summary, .skills-section, .education-entry, .experience-entry, .skill-category {
          page-break-inside: avoid; break-inside: avoid;
        }
        
        /* Prevent single lines at page start/end */
        p, li { orphans: 2; widows: 2; }
        
        /* Print optimizations */
        @media print {
          body {
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
          }
        }
      </style>
    </head>
    <body>
      ${formatHarvardStyle(html)}
    </body>
    </html>
  `;

  // For production PDF generation, we'd use Puppeteer or similar
  // For now, return formatted HTML that browsers can print to PDF
  return new Blob([htmlContent], { type: 'text/html' });
}

function formatHarvardStyle(html: string): string {
  // Transform the HTML to match Harvard CV formatting conventions
  let formatted = html;
  
  // Transform headers to Harvard style
  formatted = formatted.replace(/<h1[^>]*>(.*?)<\/h1>/gi, '<div class="header"><h1>$1</h1></div>');
  
  // Format contact information
  formatted = formatted.replace(
    /(<p[^>]*>.*?@.*?<\/p>|<p[^>]*>.*?phone.*?<\/p>|<p[^>]*>.*?linkedin.*?<\/p>)/gi, 
    '<div class="contact-info">$1</div>'
  );
  
  // Format experience sections
  formatted = formatted.replace(
    /<h3[^>]*>(.*?)<\/h3>/gi,
    '<div class="experience-entry"><div class="job-header"><span class="job-title">$1</span></div>'
  );
  
  // Format company and date lines
  formatted = formatted.replace(
    /<p[^>]*><strong>(.*?)<\/strong>\s*\|\s*(.*?)<\/p>/gi,
    '<div class="company-date">$1 | $2</div></div>'
  );
  
  return formatted;
}

export async function exportToDOCX(markdownContent: string, filename: string): Promise<Blob> {
  try {
    // Parse markdown and convert to DOCX format
    const lines = markdownContent.split('\n');
    const docElements: any[] = [];

    let currentSection: any[] = [];
    
    for (const line of lines) {
      const trimmedLine = line.trim();
      
      if (!trimmedLine) {
        if (currentSection.length > 0) {
          docElements.push(new Paragraph({
            children: currentSection,
            spacing: { after: 120 }
          }));
          currentSection = [];
        }
        continue;
      }

      // Headers
      if (trimmedLine.startsWith('# ')) {
        if (currentSection.length > 0) {
          docElements.push(new Paragraph({ children: currentSection }));
          currentSection = [];
        }
        docElements.push(new Paragraph({
          text: trimmedLine.substring(2),
          heading: HeadingLevel.HEADING_1,
          spacing: { before: 240, after: 120 }
        }));
      } else if (trimmedLine.startsWith('## ')) {
        if (currentSection.length > 0) {
          docElements.push(new Paragraph({ children: currentSection }));
          currentSection = [];
        }
        docElements.push(new Paragraph({
          text: trimmedLine.substring(3),
          heading: HeadingLevel.HEADING_2,
          spacing: { before: 200, after: 100 }
        }));
      } else if (trimmedLine.startsWith('### ')) {
        if (currentSection.length > 0) {
          docElements.push(new Paragraph({ children: currentSection }));
          currentSection = [];
        }
        docElements.push(new Paragraph({
          text: trimmedLine.substring(4),
          heading: HeadingLevel.HEADING_3,
          spacing: { before: 160, after: 80 }
        }));
      }
      // Bullet points
      else if (trimmedLine.startsWith('- ') || trimmedLine.startsWith('* ')) {
        if (currentSection.length > 0) {
          docElements.push(new Paragraph({ children: currentSection }));
          currentSection = [];
        }
        docElements.push(new Paragraph({
          text: `• ${trimmedLine.substring(2)}`,
          spacing: { after: 60 },
          indent: { left: 360 }
        }));
      }
      // Bold text
      else if (trimmedLine.includes('**')) {
        const parts = trimmedLine.split('**');
        const textRuns: TextRun[] = [];
        
        for (let i = 0; i < parts.length; i++) {
          if (i % 2 === 0) {
            if (parts[i]) textRuns.push(new TextRun(parts[i]));
          } else {
            if (parts[i]) textRuns.push(new TextRun({ text: parts[i], bold: true }));
          }
        }
        
        if (textRuns.length > 0) {
          currentSection.push(...textRuns);
        }
      }
      // Regular text
      else {
        currentSection.push(new TextRun(trimmedLine + ' '));
      }
    }

    // Add any remaining content
    if (currentSection.length > 0) {
      docElements.push(new Paragraph({ children: currentSection }));
    }

    const doc = new Document({
      sections: [{
        properties: {
          page: {
            margin: {
              top: 720,    // 0.5 inch
              right: 720,
              bottom: 720,
              left: 720,
            },
          },
        },
        children: docElements,
      }],
    });

    const buffer = await Packer.toBuffer(doc);
    return new Blob([new Uint8Array(buffer)], {
      type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    });
  } catch (error) {
    console.error('Error creating DOCX:', error);
    throw new Error('Failed to create DOCX document');
  }
}

export function exportToMarkdown(content: string, filename: string): Blob {
  return new Blob([content], { type: 'text/markdown' });
}

export function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

// Utility function to generate filename
export function generateFilename(
  candidateName: string,
  role: string,
  company: string,
  documentType: 'resume' | 'cover_letter',
  format: 'pdf' | 'docx' | 'md'
): string {
  const cleanName = candidateName.replace(/[^a-zA-Z0-9]/g, '');
  const cleanRole = role.replace(/[^a-zA-Z0-9]/g, '');
  const cleanCompany = company.replace(/[^a-zA-Z0-9]/g, '');
  const date = new Date().toISOString().split('T')[0].replace(/-/g, '');
  
  const docTypeMap = {
    resume: 'Resume',
    cover_letter: 'CoverLetter'
  };
  
  return `${cleanName}_${docTypeMap[documentType]}_${cleanRole}_${cleanCompany}_${date}.${format}`;
}
