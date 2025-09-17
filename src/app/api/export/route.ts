import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { exportToPDF, exportToDOCX, exportToMarkdown, generateFilename } from '@/lib/export-service';
import { ExportRequest } from '@/types';

export async function POST(request: NextRequest) {
  try {
    const body: ExportRequest = await request.json();
    
    if (!body.document_id || !body.format) {
      return NextResponse.json(
        { error: 'document_id and format are required' },
        { status: 400 }
      );
    }

    // Fetch the document
    const document = await prisma.document.findUnique({
      where: { id: body.document_id },
      include: {
        profile: true
      }
    });

    if (!document) {
      return NextResponse.json(
        { error: 'Document not found' },
        { status: 404 }
      );
    }

    const profile = document.profile;
    const profileHeader = profile.header as any;
    const fitAnalysis = document.fit_analysis as any;
    
    // Extract job details for filename
    const candidateName = profileHeader?.name || 'Candidate';
    const role = fitAnalysis?.role || 'Position';
    const company = fitAnalysis?.company || 'Company';
    
    const filename = generateFilename(
      candidateName,
      role,
      company,
      document.kind as 'resume' | 'cover_letter',
      body.format
    );

    let blob: Blob;
    let contentType: string;

    switch (body.format) {
      case 'pdf':
        blob = await exportToPDF(document.content_md, filename);
        contentType = 'text/html'; // Changed to HTML since we're generating HTML for browser PDF conversion
        break;
      
      case 'docx':
        blob = await exportToDOCX(document.content_md, filename);
        contentType = 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
        break;
      
      case 'md':
        blob = exportToMarkdown(document.content_md, filename);
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
