import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { ProfileFormData } from '@/types';
import { transformLinkedInData, enhanceProfileWithAI, LinkedInProfileData } from '@/lib/linkedin-parser';

// LinkedIn OAuth configuration
const LINKEDIN_CLIENT_ID = process.env.LINKEDIN_CLIENT_ID;
const LINKEDIN_CLIENT_SECRET = process.env.LINKEDIN_CLIENT_SECRET;
const LINKEDIN_REDIRECT_URI = process.env.LINKEDIN_REDIRECT_URI || 'http://localhost:3000/api/import/linkedin/callback';

// GET: Initiate LinkedIn OAuth flow
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

    if (!LINKEDIN_CLIENT_ID) {
      return NextResponse.json(
        { error: 'LinkedIn OAuth not configured' },
        { status: 500 }
      );
    }

    // Generate OAuth URL
    const scopes = ['openid', 'profile', 'email'];
    const state = Buffer.from(JSON.stringify({ userId })).toString('base64');
    
    const authUrl = new URL('https://www.linkedin.com/oauth/v2/authorization');
    authUrl.searchParams.set('response_type', 'code');
    authUrl.searchParams.set('client_id', LINKEDIN_CLIENT_ID);
    authUrl.searchParams.set('redirect_uri', LINKEDIN_REDIRECT_URI);
    authUrl.searchParams.set('state', state);
    authUrl.searchParams.set('scope', scopes.join(' '));

    return NextResponse.json({ auth_url: authUrl.toString() });
  } catch (error) {
    console.error('Error initiating LinkedIn OAuth:', error);
    return NextResponse.json(
      { error: 'Failed to initiate LinkedIn OAuth' },
      { status: 500 }
    );
  }
}

// POST: Process LinkedIn profile data manually (for development/testing)
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { user_id, linkedin_data, enhance_with_ai = false }: {
      user_id: string;
      linkedin_data: LinkedInProfileData;
      enhance_with_ai?: boolean;
    } = body;

    if (!user_id || !linkedin_data) {
      return NextResponse.json(
        { error: 'user_id and linkedin_data are required' },
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

    // Transform LinkedIn data to our profile format
    let profileData = transformLinkedInData(linkedin_data);
    
    // Optionally enhance with AI
    if (enhance_with_ai) {
      profileData = await enhanceProfileWithAI(profileData);
    }

    // Create or update profile
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
        where: { id: user_id },
        update: {
          ...(profileData.header.name && { name: profileData.header.name })
        },
        create: {
          id: user_id,
          email: profileData.header.email || `${user_id}@imported.local`,
          name: profileData.header.name || 'LinkedIn User'
        }
      });
    } catch (userError: any) {
      // If email constraint fails, create user with unique email
      if (userError.code === 'P2002' && userError.meta?.target?.includes('email')) {
        await prisma.user.upsert({
          where: { id: user_id },
          update: {
            ...(profileData.header.name && { name: profileData.header.name })
          },
          create: {
            id: user_id,
            email: `${user_id}@imported.local`,
            name: profileData.header.name || 'LinkedIn User'
          }
        });
      } else {
        throw userError;
      }
    }

    const profile = await prisma.profile.create({
      data: {
        user_id,
        name: 'LinkedIn Import',
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
      message: 'LinkedIn profile imported successfully' 
    });
  } catch (error) {
    console.error('Error processing LinkedIn data:', error);
    return NextResponse.json(
      { error: 'Failed to process LinkedIn data' },
      { status: 500 }
    );
  }
}

