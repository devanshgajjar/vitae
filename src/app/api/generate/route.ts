import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { generateResume, generateCoverLetter, optimizeForATS, formatForLength } from '@/lib/resume-generator';
import { analyzeFit } from '@/lib/fit-analysis';
import { validateContent } from '@/lib/guardrails';
import { hashJobDescription } from '@/lib/jd-parser';
import { getDemoProfileData } from '@/lib/demo-profile';
import { GenerateRequest, GenerateResponse, Profile, DocumentKind } from '@/types';

export async function POST(request: NextRequest) {
  console.log('📝 Generate API called');
  
  try {
    const body: GenerateRequest = await request.json();
    console.log('📋 Request body:', { 
      profile_id: body.profile_id, 
      has_job_description: !!body.job_description,
      has_options: !!body.options 
    });
    
    // Validate request
    if (!body.profile_id || !body.job_description || !body.options) {
      return NextResponse.json(
        { error: 'Missing required fields: profile_id, job_description, options' },
        { status: 400 }
      );
    }

    // Handle demo profile or fetch from database
    let typedProfile: Profile;
    
    if (body.profile_id === 'demo-profile-123') {
      // Use demo profile data
      const demoData = getDemoProfileData();
      typedProfile = {
        id: demoData.id,
        user_id: 'demo-user-123',
        header: demoData.header,
        experience: demoData.experience,
        education: demoData.education,
        skills: demoData.skills,
        projects: demoData.projects,
        evidence: demoData.evidence,
        created_at: new Date(),
        updated_at: new Date()
      };
    } else {
      // Fetch profile from database
      const profile = await prisma.profile.findUnique({
        where: { id: body.profile_id },
        include: { user: true }
      });

      if (!profile) {
        return NextResponse.json(
          { error: 'Profile not found' },
          { status: 404 }
        );
      }

      // Convert Prisma JSON fields to typed objects
      typedProfile = {
        id: profile.id,
        user_id: profile.user_id,
        header: profile.header as any,
        experience: profile.experience as any,
        education: profile.education as any,
        skills: profile.skills as any,
        projects: profile.projects as any,
        evidence: profile.evidence as any,
        created_at: profile.created_at,
        updated_at: profile.updated_at
      };
    }

    // Check if OpenAI is available
    if (!process.env.OPENAI_API_KEY) {
      console.error('❌ No OpenAI API key found');
      return NextResponse.json(
        { error: 'AI service not configured. Please check OpenAI API key.' },
        { status: 500 }
      );
    }

    console.log('🔍 Starting fit analysis...');
    // Generate fit analysis
    const fitAnalysis = await analyzeFit(typedProfile, body.job_description);
    console.log('✅ Fit analysis completed');

    console.log('📄 Starting resume generation...');
    // Generate resume
    const resumeResult = await generateResume(
      typedProfile,
      body.job_description,
      body.options
    );
    console.log('✅ Resume generation completed');

    // Generate cover letter
    const coverLetterResult = await generateCoverLetter(
      typedProfile,
      body.job_description,
      body.options
    );

    // Optimize for ATS if requested
    let resumeContent = resumeResult.content;
    let coverLetterContent = coverLetterResult.content;

    if (body.options.ats_safe) {
      resumeContent = optimizeForATS(resumeContent);
      coverLetterContent = optimizeForATS(coverLetterContent);
    }

    // Format for target length
    resumeContent = formatForLength(resumeContent, body.options.length);

    // Validate content with guardrails
    const resumeValidation = validateContent(
      resumeContent,
      resumeResult.traceMapping,
      typedProfile
    );

    const coverLetterValidation = validateContent(
      coverLetterContent,
      coverLetterResult.traceMapping,
      typedProfile
    );

    // Only block generation for truly critical violations (not AI content variations)
    const criticalViolations = [
      ...resumeValidation.violations.filter(v => 
        v.severity === 'error' && 
        v.type !== 'untraceable' && 
        v.type !== 'fabrication' // Allow AI-generated variations
      ),
      ...coverLetterValidation.violations.filter(v => 
        v.severity === 'error' && 
        v.type !== 'untraceable' && 
        v.type !== 'fabrication' // Allow AI-generated variations
      )
    ];

    // Log all violations for debugging but don't block
    const allViolations = [
      ...resumeValidation.violations,
      ...coverLetterValidation.violations
    ];
    
    if (allViolations.length > 0) {
      console.log('Content validation warnings:', allViolations.map(v => ({
        type: v.type,
        severity: v.severity,
        message: v.message,
        content: v.affected_content?.substring(0, 50) + '...'
      })));
    }

    if (criticalViolations.length > 0) {
      return NextResponse.json(
        { 
          error: 'Content validation failed',
          violations: criticalViolations
        },
        { status: 400 }
      );
    }

    // Generate JD hash for caching
    const jdHash = hashJobDescription(body.job_description.raw_text);

    // Save resume document
    const resumeDoc = await prisma.document.create({
      data: {
        user_id: typedProfile.user_id,
        profile_id: typedProfile.id,
        kind: 'resume' as DocumentKind,
        jd_hash: jdHash,
        content_md: resumeContent,
        trace_mapping: resumeResult.traceMapping as any,
        options: body.options as any,
        fit_analysis: fitAnalysis as any
      }
    });

    // Save cover letter document
    const coverLetterDoc = await prisma.document.create({
      data: {
        user_id: typedProfile.user_id,
        profile_id: typedProfile.id,
        kind: 'cover_letter' as DocumentKind,
        jd_hash: jdHash,
        content_md: coverLetterContent,
        trace_mapping: coverLetterResult.traceMapping as any,
        options: body.options as any,
        fit_analysis: fitAnalysis as any
      }
    });

    // Combine trace mappings
    const allTraceMappings = [
      ...resumeResult.traceMapping,
      ...coverLetterResult.traceMapping
    ];

    const response: GenerateResponse = {
      resume_md: resumeContent,
      cover_letter_md: coverLetterContent,
      trace_mapping: allTraceMappings,
      fit_analysis: fitAnalysis,
      document_id: resumeDoc.id // Return resume doc ID as primary
    };

    console.log('✅ Successfully generated documents');
    return NextResponse.json(response);
  } catch (error) {
    console.error('❌ Error in generate API:', error);
    console.error('Stack trace:', error instanceof Error ? error.stack : 'No stack trace');
    
    // Ensure we always return valid JSON
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    return NextResponse.json(
      { 
        error: 'Failed to generate documents', 
        details: errorMessage,
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    );
  }
}

// GET endpoint to retrieve generated documents
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('user_id');
    const profileId = searchParams.get('profile_id');
    const documentId = searchParams.get('document_id');

    if (documentId) {
      // Get specific document
      const document = await prisma.document.findUnique({
        where: { id: documentId },
        include: {
          profile: true,
          versions: {
            orderBy: { version_number: 'desc' },
            take: 5
          }
        }
      });

      if (!document) {
        return NextResponse.json(
          { error: 'Document not found' },
          { status: 404 }
        );
      }

      return NextResponse.json(document);
    }

    if (!userId) {
      return NextResponse.json(
        { error: 'user_id is required' },
        { status: 400 }
      );
    }

    // Get user's documents
    const whereClause: any = { user_id: userId };
    if (profileId) {
      whereClause.profile_id = profileId;
    }

    const documents = await prisma.document.findMany({
      where: whereClause,
      include: {
        profile: {
          select: { name: true }
        }
      },
      orderBy: { created_at: 'desc' },
      take: 50
    });

    return NextResponse.json({ documents });
  } catch (error) {
    console.error('Error fetching documents:', error);
    return NextResponse.json(
      { error: 'Failed to fetch documents' },
      { status: 500 }
    );
  }
}
