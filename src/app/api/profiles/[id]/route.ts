import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { ProfileFormData } from '@/types';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const profile = await prisma.profile.findUnique({
      where: { id },
      include: {
        user: {
          select: { email: true, name: true }
        }
      }
    });

    if (!profile) {
      return NextResponse.json(
        { error: 'Profile not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ profile });
  } catch (error) {
    console.error('Error fetching profile:', error);
    return NextResponse.json(
      { error: 'Failed to fetch profile' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { name, profile_data }: {
      name?: string;
      profile_data: ProfileFormData;
    } = body;

    if (!profile_data) {
      return NextResponse.json(
        { error: 'profile_data is required' },
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

    // Process data and ensure IDs exist
    const processedData = {
      header: profile_data.header,
      experience: profile_data.experience.map((exp, index) => ({
        id: exp.id || `exp_${Date.now()}_${index}`,
        ...exp
      })),
      education: profile_data.education.map((edu, index) => ({
        id: edu.id || `edu_${Date.now()}_${index}`,
        ...edu
      })),
      skills: profile_data.skills,
      projects: profile_data.projects.map((proj, index) => ({
        id: proj.id || `proj_${Date.now()}_${index}`,
        ...proj
      })),
      evidence: profile_data.evidence.map((ev, index) => ({
        id: ev.id || `ev_${Date.now()}_${index}`,
        ...ev
      }))
    };

    const updateData: any = {
      header: processedData.header,
      experience: processedData.experience,
      education: processedData.education,
      skills: processedData.skills,
      projects: processedData.projects,
      evidence: processedData.evidence
    };

    if (name) {
      updateData.name = name;
    }

    const profile = await prisma.profile.update({
      where: { id },
      data: updateData
    });

    return NextResponse.json({ profile });
  } catch (error) {
    console.error('Error updating profile:', error);
    return NextResponse.json(
      { error: 'Failed to update profile' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await prisma.profile.delete({
      where: { id }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting profile:', error);
    return NextResponse.json(
      { error: 'Failed to delete profile' },
      { status: 500 }
    );
  }
}
