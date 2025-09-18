import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { exportToPDF, exportToDOCX, exportToMarkdown, generateFilename } from '@/lib/export-service';
import { ExportRequest } from '@/types';

export async function POST(request: NextRequest) {
  try {
    const body: ExportRequest & { content_md?: string; kind?: 'resume' | 'cover_letter' } = await request.json();
    
    if ((!body.document_id && !body.content_md) || !body.format) {
      return NextResponse.json(
        { error: 'document_id or content_md (one required) and format are required' },
        { status: 400 }
      );
    }
    let markdownContent = body.content_md || '';
    let candidateName = 'Candidate';
    let role = 'Position';
    let company = 'Company';
    let kind: 'resume' | 'cover_letter' = body.kind || 'resume';

    let documentFound = false;

    if (body.document_id && !body.content_md) {
      // Fetch the document
      const document = await prisma.document.findUnique({
        where: { id: body.document_id },
        include: {
          profile: true
        }
      });

      if (!document) {
        if (!body.content_md) {
          return NextResponse.json(
            { error: 'Document not found' },
            { status: 404 }
          );
        }
      } else {
        documentFound = true;
        markdownContent = document.content_md;
        const profile = document.profile;
        const profileHeader = profile.header as any;
        const fitAnalysis = document.fit_analysis as any;
        candidateName = profileHeader?.name || candidateName;
        role = fitAnalysis?.role || role;
        company = fitAnalysis?.company || company;
        kind = document.kind as 'resume' | 'cover_letter';
      }
    }
    
    // Extract job details for filename
    const filename = generateFilename(
      candidateName,
      role,
      company,
      kind,
      body.format
    );

    let blob: Blob;
    let contentType: string;

    switch (body.format) {
      case 'pdf':
        blob = await exportToPDF(markdownContent, filename);
        contentType = 'text/html'; // Changed to HTML since we're generating HTML for browser PDF conversion
        break;
      
      case 'docx':
        blob = await exportToDOCX(markdownContent, filename);
        contentType = 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
        break;
      
      case 'md':
        blob = exportToMarkdown(markdownContent, filename);
        contentType = 'text/markdown';
        break;
      
      default:
        return NextResponse.json(
          { error: 'Unsupported format' },
          { status: 400 }
        );
    }

    // Convert blob to buffer for response
    const buffer = await blob.arrayBuffer();

    return new NextResponse(buffer, {
      headers: {
        'Content-Type': contentType,
        'Content-Disposition': `attachment; filename="${filename}"`,
        'Content-Length': buffer.byteLength.toString(),
      },
    });
  } catch (error) {
    console.error('Error exporting document:', error);
    console.error('Error stack:', error instanceof Error ? error.stack : 'No stack trace');
    return NextResponse.json(
      { error: 'Failed to export document', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
