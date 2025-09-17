import { NextRequest, NextResponse } from 'next/server';
import { parseJobDescription, hashJobDescription } from '@/lib/jd-parser';
import { prisma } from '@/lib/prisma';
import { ParseJDRequest, ParseJDResponse } from '@/types';

export async function POST(request: NextRequest) {
  try {
    const body: ParseJDRequest = await request.json();
    
    if (!body.job_description || typeof body.job_description !== 'string') {
      return NextResponse.json(
        { error: 'job_description is required and must be a string' },
        { status: 400 }
      );
    }

    const jdText = body.job_description.trim();
    if (jdText.length < 50) {
      return NextResponse.json(
        { error: 'Job description too short (minimum 50 characters)' },
        { status: 400 }
      );
    }

    // Generate hash for caching
    const jdHash = hashJobDescription(jdText);

    // Check if we've already parsed this JD
    const cached = await prisma.jobDescriptionCache.findUnique({
      where: { jd_hash: jdHash }
    });

    let parsedJD;
    if (cached) {
      // Update access count and return cached result
      await prisma.jobDescriptionCache.update({
        where: { jd_hash: jdHash },
        data: { 
          access_count: { increment: 1 },
          updated_at: new Date()
        }
      });
      parsedJD = cached.parsed_data as any;
    } else {
      // Parse the JD using AI
      parsedJD = await parseJobDescription(jdText);
      
      // Cache the result
      await prisma.jobDescriptionCache.create({
        data: {
          jd_hash: jdHash,
          parsed_data: parsedJD as any,
          fit_analyses: {}
        }
      });
    }

    const response: ParseJDResponse = {
      jd: parsedJD
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('Error in parse-jd API:', error);
    return NextResponse.json(
      { error: 'Failed to parse job description' },
      { status: 500 }
    );
  }
}
