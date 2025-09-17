'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import ProfileForm from '@/components/profile/profile-form';
import { ProfileFormData } from '@/types';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Upload, FileText, Download, Linkedin } from 'lucide-react';
import Link from 'next/link';

export default function OnboardingPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [currentStep, setCurrentStep] = useState<'method' | 'form'>('method');

  const handleSaveProfile = async (profileData: ProfileFormData) => {
    setIsLoading(true);
    try {
      // TODO: Get actual user ID from authentication
      const userId = 'demo-user-123';
      
      const response = await fetch('/api/profiles', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          user_id: userId,
          name: 'Default Profile',
          profile_data: profileData
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to save profile');
      }

      const result = await response.json();
      console.log('Profile saved:', result);
      
      // Redirect to dashboard
      router.push('/dashboard');
    } catch (error) {
      console.error('Error saving profile:', error);
      alert('Failed to save profile. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleImportMethod = (method: 'linkedin' | 'upload' | 'manual' | 'import-page') => {
    if (method === 'manual') {
      setCurrentStep('form');
    } else if (method === 'import-page') {
      router.push('/import');
    } else {
      // TODO: Implement LinkedIn and file upload
      alert(`${method} import coming soon! For now, please use manual entry.`);
      setCurrentStep('form');
    }
  };

  if (currentStep === 'form') {
    return (
      <div className="min-h-screen bg-gray-50">
        <header className="bg-white shadow-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between py-4">
              <div className="flex items-center">
                <Button
                  variant="ghost"
                  onClick={() => setCurrentStep('method')}
                  className="mr-4"
                >
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back
                </Button>
                <h1 className="text-xl font-semibold">Create Your Profile</h1>
              </div>
              <Link href="/">
                <Button variant="outline">Cancel</Button>
              </Link>
            </div>
          </div>
        </header>

        <main className="py-8">
          <ProfileForm 
            onSave={handleSaveProfile}
            isLoading={isLoading}
          />
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between py-4">
            <h1 className="text-xl font-semibold">Welcome to Vitae AI</h1>
            <Link href="/">
              <Button variant="outline">Back to Home</Button>
            </Link>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Let&apos;s Build Your Professional Profile
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Choose how you&apos;d like to get started. You can always add more information later.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Import Options */}
          <div className="bg-white rounded-lg shadow-md p-8 text-center border-2 border-transparent hover:border-blue-500 transition-colors cursor-pointer"
               onClick={() => handleImportMethod('import-page')}>
            <div className="bg-blue-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-6">
              <Download className="w-8 h-8 text-blue-600" />
            </div>
            <h3 className="text-xl font-semibold mb-3">Import Profile</h3>
            <p className="text-gray-600 mb-4">
              Import from LinkedIn, upload your resume, or paste content to get started quickly.
            </p>
            <div className="text-sm text-blue-600 font-medium">
              Available Now
            </div>
          </div>

          {/* LinkedIn Import - Legacy */}
          <div className="bg-white rounded-lg shadow-md p-8 text-center border-2 border-transparent hover:border-green-500 transition-colors cursor-pointer"
               onClick={() => handleImportMethod('import-page')}>
            <div className="bg-green-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-6">
              <Linkedin className="w-8 h-8 text-green-600" />
            </div>
            <h3 className="text-xl font-semibold mb-3">LinkedIn & Resume</h3>
            <p className="text-gray-600 mb-4">
              Connect LinkedIn or upload resume files for automatic data extraction.
            </p>
            <div className="text-sm text-green-600 font-medium">
              Try Import Options
            </div>
          </div>

          {/* Manual Entry */}
          <div className="bg-white rounded-lg shadow-md p-8 text-center border-2 border-transparent hover:border-purple-500 transition-colors cursor-pointer"
               onClick={() => handleImportMethod('manual')}>
            <div className="bg-purple-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-6">
              <FileText className="w-8 h-8 text-purple-600" />
            </div>
            <h3 className="text-xl font-semibold mb-3">Manual Entry</h3>
            <p className="text-gray-600 mb-4">
              Fill out the form manually with your professional information and experience.
            </p>
            <div className="text-sm text-purple-600 font-medium">
              Start Now
            </div>
          </div>
        </div>

        <div className="mt-12 text-center">
          <p className="text-gray-500 text-sm">
            All your data is encrypted and secure. We never share your information with third parties.
          </p>
        </div>
      </main>
    </div>
  );
}
