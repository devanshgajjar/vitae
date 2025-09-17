'use client';

import React, { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { isFeatureEnabled } from '@/lib/feature-flags';
import { 
  Upload, 
  Linkedin, 
  FileText, 
  CheckCircle, 
  AlertCircle, 
  Loader2,
  ArrowLeft,
  User,
  Edit3
} from 'lucide-react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';

export default function ImportPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // For MVP, redirect to manual entry if imports are disabled
  React.useEffect(() => {
    if (!isFeatureEnabled('enableLinkedInImport') && !isFeatureEnabled('enableResumeImport')) {
      router.push('/create');
      return;
    }
  }, [router]);
  
  const [importMethod, setImportMethod] = useState<'linkedin' | 'resume' | 'manual' | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [manualText, setManualText] = useState('');

  // Don't render if imports are disabled (will redirect)
  if (!isFeatureEnabled('enableLinkedInImport') && !isFeatureEnabled('enableResumeImport')) {
    return null;
  }

  // Handle URL parameters for OAuth callbacks
  React.useEffect(() => {
    const error = searchParams.get('error');
    const success = searchParams.get('success');
    const profileId = searchParams.get('profile_id');

    if (error) {
      switch (error) {
        case 'linkedin_oauth_denied':
          setError('LinkedIn authorization was denied. Please try again.');
          break;
        case 'invalid_oauth_response':
          setError('Invalid response from LinkedIn. Please try again.');
          break;
        case 'invalid_state':
          setError('Security validation failed. Please try again.');
          break;
        case 'import_failed':
          setError('Import failed. Please try again or contact support.');
          break;
        default:
          setError('An error occurred during import. Please try again.');
      }
    }

    if (success === 'linkedin' && profileId) {
      setSuccess('LinkedIn profile imported successfully!');
      setTimeout(() => {
        router.push(`/create?profile_id=${profileId}`);
      }, 2000);
    }
  }, [searchParams, router]);

  const handleLinkedInImport = async () => {
    setIsLoading(true);
    setError(null);

    try {
      // For demo purposes, use a hardcoded user ID
      // In production, you'd get this from authentication
      const userId = 'demo-user-' + Date.now();

      const response = await fetch(`/api/import/linkedin?user_id=${userId}`);
      const data = await response.json();

      if (!response.ok) {
        if (data.error === 'LinkedIn OAuth not configured') {
          setError('LinkedIn OAuth is not configured. Please set up LinkedIn Developer App credentials in your .env file, or try the resume upload option instead.');
        } else {
          throw new Error(data.error || 'Failed to initiate LinkedIn import');
        }
        setIsLoading(false);
        return;
      }

      // Redirect to LinkedIn OAuth
      window.location.href = data.auth_url;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to start LinkedIn import');
      setIsLoading(false);
    }
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      setError(null);
    }
  };

  const handleResumeImport = async () => {
    if (!file) {
      setError('Please select a file to upload');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('user_id', 'demo-user-' + Date.now());

      const response = await fetch('/api/import/resume', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to import resume');
      }

      setSuccess('Resume imported successfully! Redirecting to profile editor...');
      setTimeout(() => {
        router.push(`/profile/${data.profile.id}`);
      }, 1500);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to import resume');
    } finally {
      setIsLoading(false);
    }
  };

  const handleManualImport = async () => {
    if (!manualText.trim()) {
      setError('Please paste your resume content');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      // Create a blob and file from the text for consistent processing
      const blob = new Blob([manualText], { type: 'text/plain' });
      const file = new File([blob], 'manual-resume.txt', { type: 'text/plain' });

      const formData = new FormData();
      formData.append('file', file);
      formData.append('user_id', 'demo-user-' + Date.now());

      const response = await fetch('/api/import/resume', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to process resume text');
      }

      setSuccess('Resume content processed successfully! Redirecting to profile editor...');
      setTimeout(() => {
        router.push(`/profile/${data.profile.id}`);
      }, 1500);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to process resume text');
    } finally {
      setIsLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
          <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Import Successful!</h2>
          <p className="text-gray-600 mb-4">{success}</p>
          <div className="flex justify-center">
            <Loader2 className="w-6 h-6 animate-spin text-blue-500" />
            <span className="ml-2 text-sm text-gray-500">Redirecting to profile editor...</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="mb-8">
          <Link 
            href="/dashboard" 
            className="inline-flex items-center text-blue-600 hover:text-blue-800 mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Dashboard
          </Link>
          
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Import Your Profile</h1>
          <p className="text-gray-600">
            Get started quickly by importing your existing profile information
          </p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start">
            <AlertCircle className="w-5 h-5 text-red-500 mt-0.5 mr-3 flex-shrink-0" />
            <p className="text-red-700">{error}</p>
          </div>
        )}

        {!importMethod ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* LinkedIn Import */}
            {isFeatureEnabled('enableLinkedInImport') && (
              <div className="bg-white rounded-lg shadow-sm border p-6 hover:shadow-md transition-shadow">
                <div className="text-center">
                  <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Linkedin className="w-8 h-8 text-blue-600" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">Import from LinkedIn</h3>
                  <p className="text-gray-600 mb-6">
                    Connect your LinkedIn account to automatically import your profile, experience, and education.
                  </p>
                  <Button 
                    onClick={() => setImportMethod('linkedin')}
                    className="w-full"
                    variant="outline"
                  >
                    Choose LinkedIn Import
                  </Button>
                </div>
              </div>
            )}

            {/* Resume Upload */}
            {isFeatureEnabled('enableResumeImport') && (
              <div className="bg-white rounded-lg shadow-sm border p-6 hover:shadow-md transition-shadow">
                <div className="text-center">
                  <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Upload className="w-8 h-8 text-green-600" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">Upload Resume</h3>
                  <p className="text-gray-600 mb-6">
                    Upload your existing resume in PDF, DOCX, or TXT format and we'll extract the information.
                  </p>
                  <Button 
                    onClick={() => setImportMethod('resume')}
                    className="w-full"
                    variant="outline"
                  >
                    Choose File Upload
                  </Button>
                </div>
              </div>
            )}

            {/* Manual Entry */}
            {isFeatureEnabled('enableResumeImport') && (
              <div className="bg-white rounded-lg shadow-sm border p-6 hover:shadow-md transition-shadow">
                <div className="text-center">
                  <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <FileText className="w-8 h-8 text-purple-600" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">Paste Resume Text</h3>
                  <p className="text-gray-600 mb-6">
                    Copy and paste your resume content directly for quick parsing and extraction.
                  </p>
                  <Button 
                    onClick={() => setImportMethod('manual')}
                    className="w-full"
                    variant="outline"
                  >
                    Choose Manual Entry
                  </Button>
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="max-w-2xl mx-auto">
            {/* Back button */}
            <Button 
              variant="ghost" 
              onClick={() => setImportMethod(null)}
              className="mb-6"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Choose Different Method
            </Button>

            {importMethod === 'linkedin' && (
              <div className="bg-white rounded-lg shadow-sm border p-8">
                <div className="text-center">
                  <Linkedin className="w-16 h-16 text-blue-600 mx-auto mb-4" />
                  <h2 className="text-2xl font-bold text-gray-900 mb-4">Connect LinkedIn Account</h2>
                  <p className="text-gray-600 mb-8">
                    You'll be redirected to LinkedIn to authorize access to your profile information. 
                    We'll only import basic profile data, work experience, and education.
                  </p>
                  
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                    <h4 className="font-semibold text-blue-900 mb-2">What we'll import:</h4>
                    <ul className="text-sm text-blue-800 text-left">
                      <li>• Basic profile information (name, email, location)</li>
                      <li>• Work experience and job titles</li>
                      <li>• Education background</li>
                      <li>• Skills and endorsements</li>
                    </ul>
                  </div>

                  <Button 
                    onClick={handleLinkedInImport}
                    disabled={isLoading}
                    className="w-full max-w-xs"
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Connecting...
                      </>
                    ) : (
                      <>
                        <Linkedin className="w-4 h-4 mr-2" />
                        Connect LinkedIn
                      </>
                    )}
                  </Button>
                </div>
              </div>
            )}

            {importMethod === 'resume' && (
              <div className="bg-white rounded-lg shadow-sm border p-8">
                <div className="text-center mb-8">
                  <Upload className="w-16 h-16 text-green-600 mx-auto mb-4" />
                  <h2 className="text-2xl font-bold text-gray-900 mb-4">Upload Your Resume</h2>
                  <p className="text-gray-600">
                    Upload your resume file and we'll extract the information automatically.
                  </p>
                </div>

                <div className="space-y-6">
                  <div>
                    <Label htmlFor="resume-file">Select Resume File</Label>
                    <Input
                      ref={fileInputRef}
                      id="resume-file"
                      type="file"
                      accept=".pdf,.doc,.docx,.txt"
                      onChange={handleFileUpload}
                      className="mt-2"
                    />
                    <p className="text-sm text-gray-500 mt-2">
                      Supported formats: PDF, DOC, DOCX, TXT (max 10MB)
                    </p>
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-sm">
                      <p className="font-medium text-blue-900 mb-1">💡 Best results:</p>
                      <ul className="text-blue-800 space-y-1">
                        <li>• <strong>TXT files</strong> - Most reliable parsing</li>
                        <li>• <strong>Copy-paste method</strong> - Use "Paste Resume Text" below for best accuracy</li>
                        <li>• If file upload fails, try the manual text import instead</li>
                      </ul>
                    </div>
                  </div>

                  {file && (
                    <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                      <div className="flex items-center">
                        <FileText className="w-5 h-5 text-gray-400 mr-2" />
                        <span className="text-sm font-medium text-gray-900">{file.name}</span>
                        <span className="text-sm text-gray-500 ml-2">
                          ({(file.size / 1024 / 1024).toFixed(2)} MB)
                        </span>
                      </div>
                    </div>
                  )}

                  <Button 
                    onClick={handleResumeImport}
                    disabled={!file || isLoading}
                    className="w-full"
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Processing Resume...
                      </>
                    ) : (
                      <>
                        <Upload className="w-4 h-4 mr-2" />
                        Import Resume
                      </>
                    )}
                  </Button>
                </div>
              </div>
            )}

            {importMethod === 'manual' && (
              <div className="bg-white rounded-lg shadow-sm border p-8">
                <div className="text-center mb-8">
                  <FileText className="w-16 h-16 text-purple-600 mx-auto mb-4" />
                  <h2 className="text-2xl font-bold text-gray-900 mb-4">Paste Resume Content</h2>
                  <p className="text-gray-600">
                    Copy and paste your resume text below. We'll extract the key information automatically.
                  </p>
                </div>

                <div className="space-y-6">
                  <div>
                    <Label htmlFor="resume-text">Resume Content</Label>
                    <Textarea
                      id="resume-text"
                      value={manualText}
                      onChange={(e) => setManualText(e.target.value)}
                      placeholder="Paste your resume content here..."
                      className="mt-2 min-h-[300px]"
                    />
                    <p className="text-sm text-gray-500 mt-2">
                      Include your contact information, work experience, education, and skills.
                    </p>
                  </div>

                  <Button 
                    onClick={handleManualImport}
                    disabled={!manualText.trim() || isLoading}
                    className="w-full"
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Processing Content...
                      </>
                    ) : (
                      <>
                        <User className="w-4 h-4 mr-2" />
                        Process Resume Content
                      </>
                    )}
                  </Button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Create from scratch option */}
        <div className="mt-12 text-center">
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-gray-50 text-gray-500">Or</span>
            </div>
          </div>
          
          <div className="mt-6">
            <p className="text-gray-600 mb-4">Prefer to start from scratch?</p>
            <Link href="/create">
              <Button variant="outline">
                Create Profile Manually
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
