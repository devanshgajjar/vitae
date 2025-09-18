'use client';

import { useState, useEffect, Suspense } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import ExportInstructions from '@/components/ui/export-instructions';
import MarkdownPreview from '@/components/ui/markdown-preview';
import { 
  FileText, 
  ArrowLeft, 
  Download, 
  Clock,
  Sparkles,
  Loader2
} from 'lucide-react';
import Link from 'next/link';
// Fit analysis removed

interface Profile {
  id: string;
  name: string;
  header: {
    name?: string;
    email?: string;
    phone?: string;
    location?: string;
  };
  created_at: string;
}

interface GeneratedDocuments {
  document_id: string;
  resume_md: string;
  cover_letter_md: string;
  trace_mapping: Array<{
    output_bullet: string;
    source_id: string;
    source_type: string;
    confidence: string;
  }>;
}

function CreatePageContent() {
  const searchParams = useSearchParams();
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [selectedProfile, setSelectedProfile] = useState<string>('');
  const [jobDescription, setJobDescription] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  // Fit analysis removed
  const [generatedDocuments, setGeneratedDocuments] = useState<GeneratedDocuments | null>(null);
  const [activePreview, setActivePreview] = useState<'resume' | 'cover_letter'>('resume');
  const [isLoadingProfiles, setIsLoadingProfiles] = useState(true);
  const [, setSelectedProfileData] = useState<Profile | null>(null);
  const [isDemoProfileLoaded, setIsDemoProfileLoaded] = useState(false);

  // Auth state to ensure cookie is present before fetching
  const { loading: authLoading } = useAuth();

  useEffect(() => {
    if (!authLoading) {
      loadProfiles();
    }
  }, [authLoading]);

  // Handle profile_id from import redirect
  useEffect(() => {
    const profileId = searchParams.get('profile_id');
    if (profileId && profiles.length > 0) {
      const profileExists = profiles.find(p => p.id === profileId);
      if (profileExists) {
        setSelectedProfile(profileId);
      }
    }
  }, [searchParams, profiles]);

  const calculateProfileCompletion = (profile: Profile): number => {
    if (!profile.header) return 0;
    
    let total = 0;
    let completed = 0;
    
    // Header fields (40%)
    const headerFields = ['name', 'email', 'phone', 'location'];
    headerFields.forEach(field => {
      total += 10;
      if (profile.header[field as keyof typeof profile.header]) completed += 10;
    });
    
    // Check if we have profile data in profile_data field (from database)
    const profileData = (profile as Profile & { profile_data?: Record<string, unknown> }).profile_data || profile;
    
    // Experience (30%)
    total += 30;
    if ((profileData as any).experience && (profileData as any).experience.length > 0) {
      completed += 30;
    }
    
    // Skills (20%)
    total += 20;
    if ((profileData as any).skills && 
        ((profileData as any).skills.hard_skills?.length > 0 || (profileData as any).skills.soft_skills?.length > 0)) {
      completed += 20;
    }
    
    // Education (10%)
    total += 10;
    if ((profileData as any).education && (profileData as any).education.length > 0) {
      completed += 10;
    }
    
    return Math.round((completed / total) * 100);
  };

  const loadProfiles = async () => {
    try {
      const response = await fetch('/api/profiles', {
        method: 'GET',
        credentials: 'include',
        cache: 'no-store',
        headers: { 'Accept': 'application/json' }
      });
      if (response.ok) {
        const data = await response.json();
        setProfiles(data.profiles || []);
        console.log('Loaded profiles:', data.profiles?.length || 0);
      } else {
        console.error('Failed to load profiles:', response.status);
      }
    } catch (error) {
      console.error('Failed to load profiles:', error);
    } finally {
      setIsLoadingProfiles(false);
    }
  };

  const loadDemoProfile = () => {
    // Create a demo profile that matches the full data structure for completion calculation
    const demoProfile: Profile & { profile_data?: any } = {
      id: 'demo-profile-123',
      name: 'Alex Chen - Software Engineer',
      header: {
        name: 'Alex Chen',
        email: 'alex.chen@email.com',
        phone: '+1 (555) 123-4567',
        location: 'San Francisco, CA'
      },
      created_at: new Date().toISOString(),
      profile_data: {
        header: {
          fullName: 'Alex Chen',
          email: 'alex.chen@email.com',
          phone: '+1 (555) 123-4567',
          location: 'San Francisco, CA'
        },
        experience: [
          { id: '1', company: 'TechStart Inc.', position: 'Senior Full Stack Engineer' },
          { id: '2', company: 'Digital Solutions Corp', position: 'Full Stack Developer' },
          { id: '3', company: 'InnovateLab', position: 'Software Developer' }
        ],
        education: [
          { id: '1', institution: 'UC Berkeley', degree: 'BS Computer Science' }
        ],
        skills: {
          technical: ['JavaScript', 'TypeScript', 'React', 'Node.js', 'Python'],
          soft: ['Team Leadership', 'Problem Solving', 'Communication']
        },
        projects: [
          { id: '1', name: 'E-commerce Platform' },
          { id: '2', name: 'Real-time Chat Application' }
        ]
      }
    };

    // Add demo profile to the list if not already there
    if (!profiles.find(p => p.id === 'demo-profile-123')) {
      setProfiles(prev => [demoProfile, ...prev]);
    }
    
    // Select the demo profile
    setSelectedProfile('demo-profile-123');
    setSelectedProfileData(demoProfile);
    setIsDemoProfileLoaded(true);

    // Also load a sample job description
    setJobDescription(`Senior Full Stack Engineer - TechCorp Inc.

About the Role:
We are seeking a talented Senior Full Stack Engineer to join our growing engineering team. You will be responsible for building and maintaining our web applications using modern technologies.

Key Responsibilities:
• Design and develop scalable web applications using React, Node.js, and TypeScript
• Collaborate with cross-functional teams to deliver high-quality software solutions
• Write clean, maintainable, and well-tested code
• Participate in code reviews and mentor junior developers
• Optimize application performance and user experience

Required Qualifications:
• 5+ years of experience in full-stack web development
• Strong proficiency in JavaScript/TypeScript, React, and Node.js
• Experience with RESTful APIs and database design (PostgreSQL, MongoDB)
• Familiarity with cloud platforms (AWS, Azure, or GCP)
• Knowledge of CI/CD pipelines and DevOps practices
• Bachelor's degree in Computer Science or related field

Preferred Qualifications:
• Experience with Next.js, Express.js, and GraphQL
• Knowledge of containerization (Docker, Kubernetes)
• Experience with Agile development methodologies
• Previous startup or fast-paced environment experience

What We Offer:
• Competitive salary ($120,000 - $160,000)
• Equity package
• Health, dental, and vision insurance
• Flexible work arrangements
• Professional development budget
• Modern tech stack and tools`);
  };

  // Fit analysis removed

  const handleGenerate = async () => {
    if (!selectedProfile || !jobDescription.trim()) {
      alert('Please select a profile and enter a job description');
      return;
    }

    setIsGenerating(true);
    try {
      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          profile_id: selectedProfile,
          job_description: {
            raw_text: jobDescription.trim(),
            // These would typically come from the parsed JD
            must_haves: ["React", "TypeScript", "3+ years experience"],
            nice_to_haves: ["Node.js", "GraphQL"],
            responsibilities: ["Build user interfaces", "Collaborate with team"],
            keywords: ["frontend", "React", "TypeScript"],
            company: "Tech Company",
            role: "Frontend Developer"
          },
          options: {
            resume_style: "reverse_chronological",
            length: "1p",
            tone: "factual",
            include_summary: true,
            ats_safe: true
          }
        }),
      });

      if (!response.ok) {
        const responseText = await response.text();
        console.error('API Error Response:', responseText);
        
        let errorMessage = 'Failed to generate documents';
        try {
          const errorData = JSON.parse(responseText);
          errorMessage = errorData.error || errorMessage;
        } catch {
          errorMessage = `API Error (${response.status}): ${responseText || 'No response body'}`;
        }
        
        throw new Error(errorMessage);
      }

      const responseText = await response.text();
      console.log('API Response:', responseText);
      
      if (!responseText.trim()) {
        throw new Error('Empty response from server');
      }
      
      let data;
      try {
        data = JSON.parse(responseText);
      } catch (parseError) {
        console.error('JSON Parse Error:', parseError);
        throw new Error(`Invalid JSON response: ${responseText.substring(0, 100)}...`);
      }
      
      setGeneratedDocuments(data);
      
    } catch (error) {
      console.error('Generation error:', error);
      alert(`Failed to generate documents: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleExport = async (documentId: string, format: 'pdf' | 'docx' | 'md') => {
    try {
      const response = await fetch('/api/export', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          document_id: documentId,
          format: format
        }),
      });

      if (!response.ok) {
        throw new Error('Export failed');
      }

      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      
      // Generate appropriate filename
      const timestamp = new Date().toISOString().split('T')[0];
      const docType = activePreview === 'resume' ? 'Resume' : 'CoverLetter';
      
      if (format === 'pdf') {
        // For PDF, open the HTML in a new window for printing
        const newWindow = window.open(url, '_blank');
        if (newWindow) {
          newWindow.onload = () => {
            // Add a print dialog after the page loads
            setTimeout(() => {
              newWindow.print();
            }, 500);
          };
        }
      } else {
        // For other formats, download directly
        const link = document.createElement('a');
        link.href = url;
        link.download = `${docType}_${format.toUpperCase()}_${timestamp}.${format === 'md' ? 'md' : format}`;
        
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      }
      
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Export error:', error);
      alert(`Failed to export ${format.toUpperCase()}. Please try again.`);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900" style={{colorScheme: 'light'}}>
      {/* Header */}
      <header className="bg-white dark:bg-white shadow-sm border-b border-gray-200 dark:border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center">
              <Link href="/dashboard">
                <Button variant="ghost" size="sm" className="mr-3 text-gray-600 hover:text-gray-900 hover:bg-gray-100">
                  <ArrowLeft className="w-4 h-4 mr-1" />
                  Back
                </Button>
              </Link>
              <FileText className="h-8 w-8 text-blue-700 mr-3" />
              <h1 className="text-2xl font-bold text-gray-900">Create Resume & Cover Letter</h1>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left Column - JD Input & Analysis */}
          <div className="space-y-6">
            {/* Profile Selection */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
              <h3 className="text-sm font-medium text-gray-900 mb-3">Select Profile</h3>
              
              {isLoadingProfiles ? (
                <div className="animate-pulse">
                  <div className="h-10 bg-gray-200 rounded"></div>
                </div>
              ) : profiles.length === 0 ? (
                <div className="text-center py-4 text-gray-500 bg-gray-50 rounded border border-dashed border-gray-300">
                  <p className="text-sm mb-2">No profiles found</p>
                  <Link href="/onboarding">
                    <Button size="sm" className="bg-blue-600 hover:bg-blue-700 text-xs">
                      Create Profile
                    </Button>
                  </Link>
                </div>
              ) : (
                <select
                  value={selectedProfile}
                  onChange={(e) => {
                    setSelectedProfile(e.target.value);
                    const profile = profiles.find(p => p.id === e.target.value);
                    setSelectedProfileData(profile || null);
                  }}
                  className="w-full p-2 border border-gray-300 rounded-md bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-blue-600 text-sm"
                >
                  <option value="">Select a profile...</option>
                  {profiles.map(profile => {
                    const completion = calculateProfileCompletion(profile);
                    return (
                      <option key={profile.id} value={profile.id}>
                        {profile.name} ({completion}% complete)
                      </option>
                    );
                  })}
                </select>
              )}

              {/* Demo Profile Button */}
              <div className="mt-3 pt-3 border-t border-gray-200">
                <Button
                  onClick={loadDemoProfile}
                  variant="outline"
                  size="sm"
                  className="w-full text-xs bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200 text-blue-700 hover:from-blue-100 hover:to-indigo-100 hover:border-blue-300"
                >
                  <Sparkles className="w-3 h-3 mr-2" />
                  {isDemoProfileLoaded ? 'Demo Profile Loaded' : 'Try with Demo Profile'}
                </Button>
                {isDemoProfileLoaded && (
                  <p className="text-xs text-green-600 mt-1 text-center">
                    ✓ Demo profile and job description loaded!
                  </p>
                )}
              </div>
            </div>

            {/* Job Description Input */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h2 className="text-lg font-semibold mb-4 text-gray-900">Job Description</h2>
              
              <div className="space-y-4">

                <div>
                  <Label htmlFor="job-description" className="text-sm font-medium text-gray-700 dark:text-gray-700">Paste Job Description</Label>
                  <Textarea
                    id="job-description"
                    value={jobDescription}
                    onChange={(e) => setJobDescription(e.target.value)}
                    placeholder="Paste the full job description here..."
                    rows={8}
                    className="mt-1 border-gray-300 dark:border-gray-300 focus:border-blue-600 focus:ring-blue-600 text-gray-900 dark:text-gray-900 placeholder-gray-500 dark:placeholder-gray-500 bg-white dark:bg-white"
                  />
                </div>

                <div className="flex gap-3">
                  <Button 
                    onClick={handleGenerate}
                    disabled={!selectedProfile || !jobDescription.trim() || isGenerating}
                    className="flex-1"
                  >
                    {isGenerating ? (
                      <>
                        <Clock className="w-4 h-4 mr-2 animate-spin" />
                        Generating...
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-4 h-4 mr-2" />
                        Generate Resume and CV
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </div>

            {/* Fit Analysis removed */}
          </div>

          {/* Right Column - Preview */}
          <div className="space-y-6">
            {generatedDocuments ? (
              <>
                <ExportInstructions />
                
                {/* Toggle and Export Controls */}
                <div className="bg-white dark:bg-white rounded-lg shadow-sm border border-gray-200 dark:border-gray-200 p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-4">
                      <h2 className="text-lg font-semibold text-gray-900">Preview</h2>
                      <div className="flex items-center gap-1 p-1 bg-gray-100 rounded-lg">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => setActivePreview('resume')}
                          className={`px-4 ${activePreview === 'resume' ? 'bg-white shadow-sm text-blue-600 font-medium' : 'hover:bg-white/60 text-gray-600'}`}
                        >
                          Resume
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => setActivePreview('cover_letter')}
                          className={`px-4 ${activePreview === 'cover_letter' ? 'bg-white shadow-sm text-blue-600 font-medium' : 'hover:bg-white/60 text-gray-600'}`}
                        >
                          Cover Letter
                        </Button>
                      </div>
                    </div>
                    
                    <div className="flex gap-2">
                      <Button 
                        size="sm" 
                        onClick={() => handleExport(generatedDocuments.document_id || 'demo-doc-id', 'pdf')}
                        className="bg-blue-600 hover:bg-blue-700 text-white"
                      >
                        <Download className="w-3 h-3 mr-1" />
                        PDF
                      </Button>
                      <Button 
                        size="sm" 
                        variant="outline" 
                        onClick={() => handleExport(generatedDocuments.document_id || 'demo-doc-id', 'docx')}
                      >
                        <Download className="w-3 h-3 mr-1" />
                        DOCX
                      </Button>
                      <Button 
                        size="sm" 
                        variant="outline" 
                        onClick={() => handleExport(generatedDocuments.document_id || 'demo-doc-id', 'md')}
                      >
                        <Download className="w-3 h-3 mr-1" />
                        MD
                      </Button>
                    </div>
                  </div>

                  {/* Preview Content */}
                  <div className="border border-gray-200 rounded-lg overflow-hidden">
                    <div className="max-h-96 overflow-y-auto">
                      {activePreview === 'resume' ? (
                        <MarkdownPreview 
                          content={generatedDocuments.resume_md}
                          className="h-full"
                        />
                      ) : (
                        <div className="bg-white p-6">
                          <div className="prose prose-sm max-w-none">
                            {generatedDocuments.cover_letter_md.split('\n').map((line: string, index: number) => (
                              <p key={index} className="mb-3 text-sm leading-relaxed text-gray-700">
                                {line.trim()}
                              </p>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </>
            ) : (
              <div className="bg-white dark:bg-white rounded-lg shadow-sm border border-gray-200 dark:border-gray-200 p-8">
                <div className="text-center py-12 text-gray-500">
                  <FileText className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No documents generated yet</h3>
                  <p className="text-gray-500">Select a profile, paste a job description, and click &quot;Generate&quot; to create your tailored resume and cover letter.</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function CreatePage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
    </div>}>
      <CreatePageContent />
    </Suspense>
  );
}
