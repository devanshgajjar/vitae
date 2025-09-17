import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { transformLinkedInData, LinkedInProfileData } from '@/lib/linkedin-parser';

const LINKEDIN_CLIENT_ID = process.env.LINKEDIN_CLIENT_ID;
const LINKEDIN_CLIENT_SECRET = process.env.LINKEDIN_CLIENT_SECRET;
const LINKEDIN_REDIRECT_URI = process.env.LINKEDIN_REDIRECT_URI || 'http://localhost:3000/api/import/linkedin/callback';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const code = searchParams.get('code');
    const state = searchParams.get('state');
    const error = searchParams.get('error');

    if (error) {
      return NextResponse.redirect(`${process.env.NEXT_PUBLIC_BASE_URL}/import?error=linkedin_oauth_denied`);
    }

    if (!code || !state) {
      return NextResponse.redirect(`${process.env.NEXT_PUBLIC_BASE_URL}/import?error=invalid_oauth_response`);
    }

    // Decode state to get user ID
    let userId: string;
    try {
      const stateData = JSON.parse(Buffer.from(state, 'base64').toString());
      userId = stateData.userId;
    } catch {
      return NextResponse.redirect(`${process.env.NEXT_PUBLIC_BASE_URL}/import?error=invalid_state`);
    }

    // Exchange code for access token
    const tokenResponse = await fetch('https://www.linkedin.com/oauth/v2/accessToken', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        grant_type: 'authorization_code',
        code,
        client_id: LINKEDIN_CLIENT_ID!,
        client_secret: LINKEDIN_CLIENT_SECRET!,
        redirect_uri: LINKEDIN_REDIRECT_URI,
      }),
    });

    if (!tokenResponse.ok) {
      throw new Error('Failed to exchange code for token');
    }

    const tokenData = await tokenResponse.json();
    const accessToken = tokenData.access_token;

    // Fetch LinkedIn profile data
    const profileData = await fetchLinkedInProfile(accessToken);

    // Transform and save the profile
    const transformedData = await saveLinkedInProfile(userId, profileData);

    // Redirect to profile editor with success message
    return NextResponse.redirect(
      `${process.env.NEXT_PUBLIC_BASE_URL}/profile/${transformedData.profile.id}?imported=linkedin`
    );

  } catch (error) {
    console.error('LinkedIn OAuth callback error:', error);
    return NextResponse.redirect(`${process.env.NEXT_PUBLIC_BASE_URL}/import?error=import_failed`);
  }
}

async function fetchLinkedInProfile(accessToken: string) {
  const baseUrl = 'https://api.linkedin.com/v2';
  
  // Fetch basic profile
  const profileResponse = await fetch(`${baseUrl}/people/~`, {
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'X-Restli-Protocol-Version': '2.0.0',
    },
  });

  if (!profileResponse.ok) {
    throw new Error('Failed to fetch LinkedIn profile');
  }

  const profile = await profileResponse.json();

  // Fetch email
  const emailResponse = await fetch(`${baseUrl}/emailAddress?q=members&projection=(elements*(handle~))`, {
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'X-Restli-Protocol-Version': '2.0.0',
    },
  });

  let emailData = null;
  if (emailResponse.ok) {
    emailData = await emailResponse.json();
  }

  // Note: LinkedIn's v2 API has restricted access to detailed profile data
  // For full work experience, education, and skills, you need special permissions
  // This is a simplified version that works with basic permissions

  return {
    ...profile,
    emailAddress: emailData?.elements?.[0]?.['handle~']?.emailAddress || '',
  };
}

async function saveLinkedInProfile(userId: string, linkedinData: LinkedInProfileData) {
  // Transform LinkedIn data to our profile format using improved parser
  const profileData = transformLinkedInData(linkedinData);
  const timestamp = Date.now();

  const processedData = {
        header: profileData.header as any,
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
        ...(profileData.header.name && { name: profileData.header.name })
      },
      create: {
        id: userId,
        email: profileData.header.email || `${userId}@linkedin.local`,
        name: profileData.header.name || 'LinkedIn User'
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
          email: `${userId}@linkedin.local`,
          name: profileData.header.name || 'LinkedIn User'
        }
      });
    } else {
      throw userError;
    }
  }

  const profile = await prisma.profile.create({
    data: {
      user_id: userId,
      name: 'LinkedIn Import',
      header: processedData.header as any,
      experience: processedData.experience as any,
      education: processedData.education as any,
      skills: processedData.skills as any,
      projects: processedData.projects as any,
      evidence: processedData.evidence as any
    }
  });

  return { profile };
}
