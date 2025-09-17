'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import ExportInstructions from '@/components/ui/export-instructions';
import CompletionBadge from '@/components/ui/completion-badge';
import MarkdownPreview from '@/components/ui/markdown-preview';
import { 
  FileText, 
  ArrowLeft, 
  Search, 
  Download, 
  Eye, 
  Clock,
  CheckCircle,
  ToggleLeft,
  ToggleRight,
  Sparkles,
  Target
} from 'lucide-react';
import Link from 'next/link';

interface Profile {
  id: string;
  name: string;
  header: any;
  created_at: string;
}

export default function CreatePage() {
  const searchParams = useSearchParams();
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [selectedProfile, setSelectedProfile] = useState<string>('');
  const [jobDescription, setJobDescription] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [isParsing, setIsParsing] = useState(false);
  const [fitAnalysis, setFitAnalysis] = useState<any>(null);
  const [generatedDocuments, setGeneratedDocuments] = useState<any>(null);
  const [activePreview, setActivePreview] = useState<'resume' | 'cover_letter'>('resume');
  const [isLoadingProfiles, setIsLoadingProfiles] = useState(true);
  const [selectedProfileData, setSelectedProfileData] = useState<Profile | null>(null);

  // TODO: Replace with actual user ID from authentication
  const userId = 'demo-user-123';

  useEffect(() => {
    console.log('Component mounted, loading profiles...');
    loadProfiles();
  }, []);

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
      if (profile.header[field]) completed += 10;
    });
    
    // Check if we have profile data in profile_data field (from database)
    const profileData = (profile as any).profile_data || profile;
    
    // Experience (30%)
    total += 30;
    if (profileData.experience && profileData.experience.length > 0) {
      completed += 30;
    }
    
    // Skills (20%)
    total += 20;
    if (profileData.skills && 
        (profileData.skills.hard_skills?.length > 0 || profileData.skills.soft_skills?.length > 0)) {
      completed += 20;
    }
    
    // Education (10%)
    total += 10;
    if (profileData.education && profileData.education.length > 0) {
      completed += 10;
    }
    
    return Math.round((completed / total) * 100);
  };

  const loadProfiles = async () => {
    try {
      const response = await fetch(`/api/profiles?user_id=${userId}`);
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

  const handleParseJD = async () => {
    if (!jobDescription.trim()) return;
    
    setIsParsing(true);
    try {
      const response = await fetch('/api/parse-jd', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          job_description: jobDescription.trim()
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to parse job description');
      }

      const data = await response.json();
      
      // Now run fit analysis with the parsed JD
      await runFitAnalysis(data.job_description);
      
    } catch (error) {
      console.error('Parse JD error:', error);
      alert('Failed to parse job description. Please try again.');
    } finally {
      setIsParsing(false);
    }
  };

  const runFitAnalysis = async (parsedJD: any) => {
    if (!selectedProfile) {
      alert('Please select a profile first');
      return;
    }

    try {
      const response = await fetch('/api/fit-analysis', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          profile_id: selectedProfile,
          job_description: parsedJD
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to analyze fit');
      }

      const data = await response.json();
      setFitAnalysis(data.fit_analysis);
      
    } catch (error) {
      console.error('Fit analysis error:', error);
      alert('Failed to analyze fit. Please try again.');
    }
  };

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
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to generate documents');
      }

      const data = await response.json();
      setGeneratedDocuments(data);
      
    } catch (error) {
      console.error('Generation error:', error);
      alert(`Failed to generate documents: ${error.message}`);
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
                    onClick={handleParseJD}
                    disabled={!jobDescription.trim() || isParsing}
                    variant="outline"
                    className="flex-1"
                  >
                    {isParsing ? (
                      <>
                        <Clock className="w-4 h-4 mr-2 animate-spin" />
                        Analyzing...
                      </>
                    ) : (
                      <>
                        <Target className="w-4 h-4 mr-2" />
                        Analyze Fit
                      </>
                    )}
                  </Button>
                  
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
                        Generate
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </div>

            {/* Fit Analysis */}
            {fitAnalysis && (
              <div className="bg-white dark:bg-white rounded-lg shadow-sm border border-gray-200 dark:border-gray-200 p-6">
                <h3 className="text-lg font-semibold mb-4 text-gray-900">Fit Analysis</h3>
                
                <div className="mb-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-gray-700">Overall Match</span>
                    <span className="text-lg font-bold text-blue-700">
                      {fitAnalysis.overall_score}%
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-3">
                    <div 
                      className="bg-blue-600 h-3 rounded-full transition-all duration-300" 
                      style={{ width: `${fitAnalysis.overall_score}%` }}
                    ></div>
                  </div>
                </div>

                <div className="space-y-3">
                  <div>
                    <h4 className="font-medium text-sm mb-2 text-gray-700">Skill Matches</h4>
                    <div className="space-y-1">
                      {fitAnalysis.skill_matches.map((match: any, index: number) => (
                        <div key={index} className="flex items-center justify-between text-sm">
                          <span className="text-gray-900">{match.skill}</span>
                          <span className={`px-2 py-1 rounded text-xs font-medium ${
                            match.status === 'exact' ? 'bg-green-100 text-green-800 border border-green-200' :
                            match.status === 'related' ? 'bg-yellow-100 text-yellow-800 border border-yellow-200' :
                            'bg-red-100 text-red-800 border border-red-200'
                          }`}>
                            {match.status}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {fitAnalysis.gaps.length > 0 && (
                    <div>
                      <h4 className="font-medium text-sm mb-2 text-orange-600">Gaps to Address</h4>
                      <div className="space-y-1">
                        {fitAnalysis.gaps.map((gap: any, index: number) => (
                          <div key={index} className="text-sm">
                            <div className="flex items-center justify-between">
                              <span className="text-red-700 font-medium">• {gap.skill}</span>
                              <span className="text-xs text-gray-600 bg-gray-100 px-2 py-1 rounded font-medium">{gap.priority} priority</span>
                            </div>
                            <p className="text-xs text-gray-700 ml-2 mt-1">{gap.suggestion}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
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
                        onClick={() => handleExport(generatedDocuments.document_id, 'pdf')}
                        className="bg-blue-600 hover:bg-blue-700 text-white"
                      >
                        <Download className="w-3 h-3 mr-1" />
                        PDF
                      </Button>
                      <Button 
                        size="sm" 
                        variant="outline" 
                        onClick={() => handleExport(generatedDocuments.document_id, 'docx')}
                      >
                        <Download className="w-3 h-3 mr-1" />
                        DOCX
                      </Button>
                      <Button 
                        size="sm" 
                        variant="outline" 
                        onClick={() => handleExport(generatedDocuments.document_id, 'md')}
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
                  <p className="text-gray-500">Select a profile, paste a job description, and click "Generate" to create your tailored resume and cover letter.</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
