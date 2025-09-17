import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('user_id');

    if (!userId) {
      return NextResponse.json(
        { error: 'user_id is required' },
        { status: 400 }
      );
    }

    // Get documents with their associated profiles
    const documents = await prisma.document.findMany({
      where: {
        profile: {
          user_id: userId
        }
      },
      include: {
        profile: {
          select: {
            name: true,
            header: true
          }
        }
      },
      orderBy: { created_at: 'desc' }
    });

    // Transform the data to include additional fields for the UI
    const transformedDocuments = documents.map(doc => ({
      id: doc.id,
      kind: doc.kind,
      created_at: doc.created_at,
      jd_hash: doc.jd_hash,
      profile_id: doc.profile_id, // Include profile_id for filtering
      profile: {
        name: doc.profile.name
      },
      content_md: doc.content_md, // Fix: use correct field name
      // Extract company and position from mapping if available
      company_name: getCompanyFromMapping(doc.trace_mapping), // Fix: use correct field name
      position_title: getPositionFromMapping(doc.trace_mapping), // Fix: use correct field name
      // Calculate fit score from mapping if available
      fit_score: getFitScoreFromMapping(doc.trace_mapping) // Fix: use correct field name
    }));

    return NextResponse.json({ documents: transformedDocuments });
  } catch (error) {
    console.error('Error fetching documents:', error);
    return NextResponse.json(
      { error: 'Failed to fetch documents' },
      { status: 500 }
    );
  }
}

// Helper functions to extract metadata from document mapping
function getCompanyFromMapping(mapping: any): string | undefined {
  try {
    if (typeof mapping === 'object' && mapping !== null) {
      // Look for company information in the mapping
      const mappingStr = JSON.stringify(mapping);
      const companyMatch = mappingStr.match(/"company":\s*"([^"]+)"/i);
      return companyMatch ? companyMatch[1] : undefined;
    }
  } catch (error) {
    console.error('Error extracting company from mapping:', error);
  }
  return undefined;
}

function getPositionFromMapping(mapping: any): string | undefined {
  try {
    if (typeof mapping === 'object' && mapping !== null) {
      // Look for position/role information in the mapping
      const mappingStr = JSON.stringify(mapping);
      const positionMatch = mappingStr.match(/"(?:position|role|title)":\s*"([^"]+)"/i);
      return positionMatch ? positionMatch[1] : undefined;
    }
  } catch (error) {
    console.error('Error extracting position from mapping:', error);
  }
  return undefined;
}

function getFitScoreFromMapping(mapping: any): number | undefined {
  try {
    if (typeof mapping === 'object' && mapping !== null) {
      // Look for fit score information in the mapping
      if (mapping.fit_score && typeof mapping.fit_score === 'number') {
        return mapping.fit_score;
      }
      if (mapping.overall_score && typeof mapping.overall_score === 'number') {
        return mapping.overall_score;
      }
    }
  } catch (error) {
    console.error('Error extracting fit score from mapping:', error);
  }
  return undefined;
}
