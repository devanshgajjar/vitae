'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams, useSearchParams } from 'next/navigation';
import ProfileForm from '@/components/profile/profile-form';
import { ProfileFormData } from '@/types';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Save, Loader2, CheckCircle } from 'lucide-react';
import Link from 'next/link';

export default function ProfileEditPage() {
  const router = useRouter();
  const params = useParams();
  const searchParams = useSearchParams();
  const profileId = params.id as string;
  
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingProfile, setIsLoadingProfile] = useState(true);
  const [profileData, setProfileData] = useState<ProfileFormData | null>(null);
  const [profileName, setProfileName] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [showImportSuccess, setShowImportSuccess] = useState(false);

  // Check if this is a redirect from import
  useEffect(() => {
    const imported = searchParams.get('imported');
    if (imported) {
      setShowImportSuccess(true);
      // Hide the message after 5 seconds
      setTimeout(() => setShowImportSuccess(false), 5000);
    }
  }, [searchParams]);

  useEffect(() => {
    loadProfile();
  }, [profileId]);

  const loadProfile = async () => {
    if (!profileId) return;
    
    setIsLoadingProfile(true);
    setError(null);
    
    try {
      const response = await fetch(`/api/profiles/${profileId}`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to load profile');
      }

      const profile = data.profile;
      setProfileName(profile.name);
      
      // Transform database profile to form data
      const formData: ProfileFormData = {
        header: profile.header,
        experience: profile.experience || [],
        education: profile.education || [],
        skills: profile.skills || { hard_skills: [], soft_skills: [] },
        projects: profile.projects || [],
        evidence: profile.evidence || []
      };
      
      setProfileData(formData);
    } catch (err) {
      console.error('Error loading profile:', err);
      setError(err instanceof Error ? err.message : 'Failed to load profile');
    } finally {
      setIsLoadingProfile(false);
    }
  };

  const handleSaveProfile = async (formData: ProfileFormData) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`/api/profiles/${profileId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: profileName,
          profile_data: formData
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update profile');
      }

      const result = await response.json();
      console.log('Profile updated:', result);
      
      // Show success message and redirect
      alert('Profile updated successfully!');
      router.push('/dashboard');
    } catch (error) {
      console.error('Error updating profile:', error);
      setError(error instanceof Error ? error.message : 'Failed to update profile');
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoadingProfile) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-blue-600" />
          <p className="text-gray-600">Loading profile...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center max-w-md">
          <div className="bg-red-50 border border-red-200 rounded-lg p-6">
            <h2 className="text-lg font-semibold text-red-900 mb-2">Error Loading Profile</h2>
            <p className="text-red-700 mb-4">{error}</p>
            <div className="space-x-4">
              <Link href="/dashboard">
                <Button variant="outline">Back to Dashboard</Button>
              </Link>
              <Button onClick={loadProfile}>Try Again</Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!profileData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600">Profile not found</p>
          <Link href="/dashboard">
            <Button className="mt-4">Back to Dashboard</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between py-4">
            <div className="flex items-center">
              <Link href="/dashboard">
                <Button variant="ghost" className="mr-4">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Dashboard
                </Button>
              </Link>
              <div>
                <h1 className="text-xl font-semibold">Edit Profile</h1>
                <p className="text-sm text-gray-500">{profileName}</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <input
                type="text"
                value={profileName}
                onChange={(e) => setProfileName(e.target.value)}
                className="px-3 py-1 border border-gray-300 rounded-md text-sm"
                placeholder="Profile name"
              />
              <Link href={`/create?profile_id=${profileId}`}>
                <Button variant="outline">Generate Documents</Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      {showImportSuccess && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex items-center">
            <CheckCircle className="w-5 h-5 text-green-600 mr-3" />
            <div>
              <p className="text-green-800 font-medium">Import Successful!</p>
              <p className="text-green-700 text-sm">Your profile has been populated with imported data. Review and edit as needed.</p>
            </div>
          </div>
        </div>
      )}

      {error && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-red-700">{error}</p>
          </div>
        </div>
      )}

      <main className="py-8">
        <ProfileForm 
          initialData={profileData}
          onSave={handleSaveProfile}
          isLoading={isLoading}
        />
      </main>
    </div>
  );
}
