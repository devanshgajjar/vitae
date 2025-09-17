'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { ProfileFormData } from '@/types';
import { isFeatureEnabled } from '@/lib/feature-flags';
import { 
  Upload, 
  Linkedin, 
  FileText, 
  Loader2, 
  CheckCircle, 
  AlertCircle,
  Download,
  Edit3
} from 'lucide-react';

interface ImportSectionProps {
  onImportData: (data: Partial<ProfileFormData>) => void;
  className?: string;
}

export default function ImportSection({ onImportData, className = '' }: ImportSectionProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [importMethod, setImportMethod] = useState<'linkedin' | 'resume' | 'manual' | null>(null);
  const [manualText, setManualText] = useState('');

  const handleLinkedInImport = async () => {
    setIsLoading(true);
    setError(null);

    try {
      // Check if LinkedIn OAuth is configured
      const response = await fetch(`/api/import/linkedin?user_id=demo-check`);
      const data = await response.json();
      
      if (!response.ok && data.error === 'LinkedIn OAuth not configured') {
        setError('LinkedIn OAuth is not configured. Using demo data instead.');
        // Fall back to demo data
      }

      // For demo purposes - in production you'd handle OAuth properly
      // This simulates importing LinkedIn data
      const mockLinkedInData = {
        header: {
          name: 'John Doe',
          email: 'john.doe@example.com',
          phone: '+1 (555) 123-4567',
          location: 'San Francisco, CA',
          links: ['https://linkedin.com/in/johndoe', 'https://github.com/johndoe']
        },
        experience: [
          {
            title: 'Senior Software Engineer',
            company: 'Tech Corp',
            start: 'Jan 2022',
            end: 'present',
            scope: 'Lead full-stack development of web applications using React and Node.js',
            top_achievements: [
              'Increased application performance by 40%',
              'Led team of 5 developers on critical project',
              'Implemented CI/CD pipeline reducing deployment time by 60%'
            ],
            tools: ['React', 'Node.js', 'TypeScript', 'AWS', 'PostgreSQL', 'Docker']
          },
          {
            title: 'Software Engineer',
            company: 'StartupXYZ',
            start: 'Jun 2020',
            end: 'Dec 2021',
            scope: 'Developed scalable backend systems and RESTful APIs',
            top_achievements: [
              'Built microservices architecture serving 1M+ users',
              'Reduced API response time by 50%'
            ],
            tools: ['Python', 'Django', 'Redis', 'MongoDB', 'Kubernetes']
          }
        ],
        education: [
          {
            degree: 'Bachelor of Science in Computer Science',
            school: 'University of California, Berkeley',
            year: '2020',
            highlights: ['Magna Cum Laude', 'Dean\'s List for 6 semesters']
          }
        ],
        skills: {
          hard_skills: ['JavaScript', 'TypeScript', 'React', 'Node.js', 'Python', 'AWS', 'Docker', 'PostgreSQL', 'MongoDB', 'Git', 'Linux', 'Kubernetes'],
          soft_skills: ['Leadership', 'Communication', 'Problem Solving', 'Team Collaboration', 'Project Management', 'Mentoring']
        },
        projects: [
          {
            name: 'E-commerce Platform',
            role: 'Full-Stack Developer',
            scope: 'Built a complete e-commerce platform with React frontend and Node.js backend',
            top_achievements: [
              'Implemented secure payment processing with Stripe',
              'Achieved 99.9% uptime with proper error handling',
              'Scaled to handle 10K+ concurrent users'
            ],
            tools: ['React', 'Node.js', 'PostgreSQL', 'Stripe', 'AWS'],
            url: 'https://github.com/johndoe/ecommerce-platform'
          },
          {
            name: 'AI Chat Assistant',
            role: 'Lead Developer',
            scope: 'Developed an AI-powered chat assistant using OpenAI API and React',
            top_achievements: [
              'Integrated OpenAI GPT-4 for natural conversations',
              'Built real-time chat interface with WebSocket',
              'Implemented context-aware response generation'
            ],
            tools: ['React', 'TypeScript', 'OpenAI API', 'WebSocket', 'Node.js'],
            url: 'https://github.com/johndoe/ai-chat-assistant'
          }
        ],
        evidence: []
      };

      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 2000));

      onImportData(mockLinkedInData);
      setSuccess('LinkedIn profile imported successfully!');
      setImportMethod(null);
    } catch (err) {
      setError('Failed to import LinkedIn profile. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsLoading(true);
    setError(null);

    try {
      // Simulate file processing
      await new Promise(resolve => setTimeout(resolve, 3000));

      const mockResumeData = {
        header: {
          name: 'Jane Smith',
          email: 'jane.smith@example.com',
          phone: '+1 (555) 987-6543',
          location: 'New York, NY',
          links: ['https://linkedin.com/in/janesmith', 'https://portfolio.janesmith.com']
        },
        experience: [
          {
            title: 'Product Manager',
            company: 'InnovateCorp',
            start: 'Mar 2021',
            end: 'present',
            scope: 'Lead product development for B2B SaaS platform',
            top_achievements: [
              'Increased user engagement by 35%',
              'Launched 3 major features ahead of schedule',
              'Managed $2M product budget'
            ],
            tools: ['Figma', 'Jira', 'Analytics', 'SQL', 'Tableau', 'Slack']
          }
        ],
        education: [
          {
            degree: 'MBA in Technology Management',
            school: 'Stanford University',
            year: '2021',
            highlights: ['Beta Gamma Sigma Honor Society']
          }
        ],
        skills: {
          hard_skills: ['Product Management', 'Data Analysis', 'SQL', 'Figma', 'Jira', 'Tableau', 'A/B Testing', 'Agile', 'Scrum'],
          soft_skills: ['Strategic Thinking', 'Leadership', 'Communication', 'Cross-functional Collaboration']
        },
        projects: [],
        evidence: []
      };

      onImportData(mockResumeData);
      setSuccess('Resume imported successfully!');
      setImportMethod(null);
    } catch (err) {
      setError('Failed to process resume file. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleManualImport = async () => {
    if (!manualText.trim()) {
      setError('Please enter some resume content');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      // Basic text parsing simulation
      await new Promise(resolve => setTimeout(resolve, 1500));

      // Extract email
      const emailMatch = manualText.match(/[\w\.-]+@[\w\.-]+\.\w+/);
      const email = emailMatch ? emailMatch[0] : '';

      // Extract name (rough heuristic)
      const lines = manualText.split('\n').map(line => line.trim()).filter(line => line);
      const nameCandidate = lines.find(line => 
        line.length > 5 && line.length < 50 && 
        !line.includes('@') && !line.includes('http') &&
        /^[A-Za-z\s]+$/.test(line)
      ) || '';

      const parsedData = {
        header: {
          name: nameCandidate,
          email: email,
          phone: '',
          location: '',
          links: []
        },
        experience: [
          {
            title: 'Please edit this entry',
            company: 'Extracted from your resume',
            start: 'Month Year',
            end: 'Month Year',
            scope: 'Please add role description based on your resume content',
            top_achievements: ['Please add your key achievements'],
            tools: []
          }
        ],
        education: [],
        skills: {
          hard_skills: [],
          soft_skills: []
        },
        projects: [],
        evidence: []
      };

      onImportData(parsedData);
      setSuccess('Resume content processed! Please review and edit the imported information.');
      setImportMethod(null);
      setManualText('');
    } catch (err) {
      setError('Failed to process resume content. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const clearMessages = () => {
    setError(null);
    setSuccess(null);
  };

  return (
    <div className={`modern-card bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200 p-8 ${className}`}>
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
            <Download className="w-5 h-5 text-blue-600" />
          </div>
          <h3 className="text-xl font-bold text-gray-900">🚀 Quick Import</h3>
        </div>
        {(error || success) && (
          <button 
            onClick={clearMessages}
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
          >
            ×
          </button>
        )}
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-start">
          <AlertCircle className="w-4 h-4 text-red-500 mt-0.5 mr-2 flex-shrink-0" />
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}

      {success && (
        <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg flex items-start">
          <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 mr-2 flex-shrink-0" />
          <p className="text-sm text-green-700">{success}</p>
        </div>
      )}

      {!importMethod ? (
        <div>
          {/* Show manual entry promotion for MVP */}
          {!isFeatureEnabled('enableLinkedInImport') && !isFeatureEnabled('enableResumeImport') ? (
            <div>
              <p className="text-blue-800 mb-4 text-sm">
                Create your profile with our streamlined manual entry wizard:
              </p>
              <Button
                variant="outline"
                size="sm"
                onClick={() => window.location.href = '/create'}
                className="bg-white border-blue-300 text-blue-700 hover:bg-blue-50"
              >
                <Edit3 className="w-4 h-4 mr-2" />
                Start Manual Entry
              </Button>
            </div>
          ) : (
            <div>
              <p className="text-blue-800 mb-4 text-sm">
                Save time by importing your existing profile information:
              </p>
              <div className="flex flex-wrap gap-2">
                {isFeatureEnabled('enableLinkedInImport') && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setImportMethod('linkedin')}
                    className="bg-white border-blue-300 text-blue-700 hover:bg-blue-50"
                  >
                    <Linkedin className="w-4 h-4 mr-2" />
                    LinkedIn
                  </Button>
                )}
                {isFeatureEnabled('enableResumeImport') && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setImportMethod('resume')}
                    className="bg-white border-blue-300 text-blue-700 hover:bg-blue-50"
                  >
                    <Upload className="w-4 h-4 mr-2" />
                    Resume File
                  </Button>
                )}
                {isFeatureEnabled('enableResumeImport') && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setImportMethod('manual')}
                    className="bg-white border-blue-300 text-blue-700 hover:bg-blue-50"
                  >
                    <FileText className="w-4 h-4 mr-2" />
                    Paste Text
                  </Button>
                )}
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setImportMethod(null)}
            className="text-blue-600 p-0 h-auto font-normal"
          >
            ← Back to import options
          </Button>

          {importMethod === 'linkedin' && (
            <div>
              <p className="text-sm text-blue-800 mb-3">
                Import your LinkedIn profile information (demo version):
              </p>
              <Button
                onClick={handleLinkedInImport}
                disabled={isLoading}
                className="w-full bg-blue-600 hover:bg-blue-700"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Importing LinkedIn Profile...
                  </>
                ) : (
                  <>
                    <Linkedin className="w-4 h-4 mr-2" />
                    Import LinkedIn Profile (Demo)
                  </>
                )}
              </Button>
            </div>
          )}

          {importMethod === 'resume' && (
            <div>
              <p className="text-sm text-blue-800 mb-3">
                Upload your resume file (PDF, DOC, DOCX, or TXT):
              </p>
              <Input
                type="file"
                accept=".pdf,.doc,.docx,.txt"
                onChange={handleFileUpload}
                disabled={isLoading}
                className="bg-white"
              />
              {isLoading && (
                <div className="flex items-center mt-2 text-sm text-blue-600">
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Processing resume file...
                </div>
              )}
            </div>
          )}

          {importMethod === 'manual' && (
            <div>
              <p className="text-sm text-blue-800 mb-3">
                Paste your resume content below:
              </p>
              <Textarea
                value={manualText}
                onChange={(e) => setManualText(e.target.value)}
                placeholder="Paste your resume text here..."
                className="bg-white min-h-[120px]"
                disabled={isLoading}
              />
              <Button
                onClick={handleManualImport}
                disabled={!manualText.trim() || isLoading}
                className="w-full mt-2 bg-blue-600 hover:bg-blue-700"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Processing content...
                  </>
                ) : (
                  <>
                    <FileText className="w-4 h-4 mr-2" />
                    Process Resume Content
                  </>
                )}
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
