import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { ProfileFormData } from '@/types';

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

    const profiles = await prisma.profile.findMany({
      where: { user_id: userId },
      orderBy: { created_at: 'desc' }
    });

    return NextResponse.json({ profiles });
  } catch (error) {
    console.error('Error fetching profiles:', error);
    return NextResponse.json(
      { error: 'Failed to fetch profiles' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  let user_id = '';
  let profile_data: ProfileFormData | null = null;
  
  try {
    const body = await request.json();
    const parsed = body as {
      user_id: string;
      name?: string;
      profile_data: ProfileFormData;
    };
    
    user_id = parsed.user_id;
    profile_data = parsed.profile_data;
    const name = parsed.name || 'Default Profile';

    if (!user_id || !profile_data) {
      return NextResponse.json(
        { error: 'user_id and profile_data are required' },
        { status: 400 }
      );
    }

    // Check profile limit (max 5 profiles per user)
    const existingProfiles = await prisma.profile.count({
      where: { user_id: user_id }
    });

    if (existingProfiles >= 5) {
      return NextResponse.json(
        { error: 'Maximum of 5 profiles allowed. Please delete an existing profile to add a new one.' },
        { status: 400 }
      );
    }

    // Validate required fields
    if (!profile_data.header.name || !profile_data.header.email) {
      return NextResponse.json(
        { error: 'Name and email are required' },
        { status: 400 }
      );
    }

    // Add IDs to experience, education, projects, and evidence
    const timestamp = Date.now();
    const processedData = {
      header: profile_data.header,
      experience: profile_data.experience.map((exp, index) => ({
        id: `exp_${timestamp}_${index}`,
        ...exp
      })),
      education: profile_data.education.map((edu, index) => ({
        id: `edu_${timestamp}_${index}`,
        ...edu
      })),
      skills: profile_data.skills,
      projects: profile_data.projects.map((proj, index) => ({
        id: `proj_${timestamp}_${index}`,
        ...proj
      })),
      evidence: profile_data.evidence.map((ev, index) => ({
        id: `ev_${timestamp}_${index}`,
        ...ev
      }))
    };

    // Create user if it doesn't exist (for demo purposes)
    await prisma.user.upsert({
      where: { id: user_id },
      update: {},
      create: {
        id: user_id,
        email: profile_data.header.email,
        name: profile_data.header.name
      }
    });

    const profile = await prisma.profile.create({
      data: {
        user_id,
        name,
        header: processedData.header as any,
        experience: processedData.experience as any,
        education: processedData.education as any,
        skills: processedData.skills as any,
        projects: processedData.projects as any,
        evidence: processedData.evidence as any
      }
    });

    return NextResponse.json({ profile });
  } catch (error) {
    console.error('Error creating profile:', error);
    console.error('Error details:', {
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : 'No stack trace',
      user_id,
      profile_data_keys: Object.keys(profile_data || {}),
      header_keys: Object.keys(profile_data?.header || {})
    });
    return NextResponse.json(
      { error: 'Failed to create profile', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
