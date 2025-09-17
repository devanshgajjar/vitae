import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { ProfileFormData } from '@/types';
import { extractTextFromFile, parseResumeText } from '@/lib/resume-parser';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const userId = formData.get('user_id') as string;

    if (!file || !userId) {
      return NextResponse.json(
        { error: 'File and user_id are required' },
        { status: 400 }
      );
    }

    // Validate file type
    const allowedTypes = [
      'application/pdf',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/msword',
      'text/plain'
    ];

    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { error: 'Only PDF, DOCX, DOC, and TXT files are supported' },
        { status: 400 }
      );
    }

    // Validate file size (10MB limit)
    if (file.size > 10 * 1024 * 1024) {
      return NextResponse.json(
        { error: 'File size must be less than 10MB' },
        { status: 400 }
      );
    }

    // Check profile limit (max 5 profiles per user)
    const existingProfiles = await prisma.profile.count({
      where: { user_id: userId }
    });

    if (existingProfiles >= 5) {
      return NextResponse.json(
        { error: 'Maximum of 5 profiles allowed. Please delete an existing profile to add a new one.' },
        { status: 400 }
      );
    }

    // Parse the resume using improved parser
    const extractedText = await extractTextFromFile(file);
    const profileData = await parseResumeText(extractedText);

    // Save the parsed profile
    const timestamp = Date.now();
    const processedData = {
      header: profileData.header,
      experience: profileData.experience.map((exp, index) => ({
        id: `exp_${timestamp}_${index}`,
        ...exp
      })),
      education: profileData.education.map((edu, index) => ({
        id: `edu_${timestamp}_${index}`,
        ...edu
      })),
      skills: profileData.skills,
      projects: profileData.projects.map((proj, index) => ({
        id: `proj_${timestamp}_${index}`,
        ...proj
      })),
      evidence: profileData.evidence.map((ev, index) => ({
        id: `ev_${timestamp}_${index}`,
        ...ev
      }))
    };

    // Create user if it doesn't exist, handling email conflicts
    try {
      await prisma.user.upsert({
        where: { id: userId },
        update: {
          // Update name if provided and not empty
          ...(profileData.header.name && { name: profileData.header.name })
        },
        create: {
          id: userId,
          email: profileData.header.email || `${userId}@imported.local`,
          name: profileData.header.name || 'Imported User'
        }
      });
    } catch (userError: any) {
      // If email constraint fails, create user with unique email
      if (userError.code === 'P2002' && userError.meta?.target?.includes('email')) {
        await prisma.user.upsert({
          where: { id: userId },
          update: {
            ...(profileData.header.name && { name: profileData.header.name })
          },
          create: {
            id: userId,
            email: `${userId}@imported.local`,
            name: profileData.header.name || 'Imported User'
          }
        });
      } else {
        throw userError;
      }
    }

    const profile = await prisma.profile.create({
      data: {
        user_id: userId,
        name: 'Resume Import',
        header: processedData.header,
        experience: processedData.experience,
        education: processedData.education,
        skills: processedData.skills,
        projects: processedData.projects,
        evidence: processedData.evidence
      }
    });

    return NextResponse.json({ 
      profile,
      extracted_text: extractedText,
      message: 'Resume imported successfully' 
    });

  } catch (error) {
    console.error('Error importing resume:', error);
    
    // Provide more specific error messages
    let errorMessage = 'Failed to import resume';
    if (error instanceof Error) {
      if (error.message.includes('PDF parsing not available')) {
        errorMessage = 'PDF parsing is not available. Please try uploading a TXT file or using the manual text import option.';
      } else if (error.message.includes('Failed to parse PDF')) {
        errorMessage = 'Could not parse PDF file. Please try converting to text format or using copy-paste import.';
      } else if (error.message.includes('Failed to parse DOCX')) {
        errorMessage = 'Could not parse DOCX file. Please try converting to text format or using copy-paste import.';
      } else if (error.message.includes('Could not extract readable text')) {
        errorMessage = 'Could not extract readable text from the document. Please try copy-pasting the content manually.';
      } else {
        errorMessage = `Import failed: ${error.message}`;
      }
    }
    
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
}

