'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { 
  FileText, 
  Plus, 
  Settings, 
  Download, 
  Eye, 
  Calendar,
  User,
  ArrowRight,
  Target,
  TrendingUp,
  CheckCircle,
  Loader2,
  LogOut,
  ChevronDown
} from 'lucide-react';
import Link from 'next/link';
import { useProfile } from '@/contexts/ProfileContext';
import { useAuth } from '@/contexts/AuthContext';
import ProfileSwitcher from '@/components/profile/ProfileSwitcher';
import { getCompletionColor, getCompletionBgColor } from '@/lib/profile-completion';
import MarkdownPreview from '@/components/ui/markdown-preview';
import CompletionBadge from '@/components/ui/completion-badge';

interface Document {
  id: string;
  kind: 'resume' | 'cover_letter';
  created_at: string;
  jd_hash: string;
  profile_id: string; // Added for filtering
  profile: { name: string };
  content_md: string; // Fixed field name
  fit_score?: number;
  company_name?: string;
  position_title?: string;
}

interface Profile {
  id: string;
  name: string;
  header: any;
  created_at: string;
}

export default function DashboardPage() {
  const { user, loading: authLoading, signOut } = useAuth();
  const router = useRouter();
  const { activeProfile, profiles } = useProfile();
  const [documents, setDocuments] = useState<Document[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [viewingDocument, setViewingDocument] = useState<{id: string, content: string, kind: string} | null>(null);
  const [showUserMenu, setShowUserMenu] = useState(false);

  // Redirect to sign-in if not authenticated
  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/auth/sign-in');
    }
  }, [user, authLoading, router]);

  // Get user ID from auth context
  const userId = user?.id || 'demo-user-123';

  useEffect(() => {
    if (user) {
      loadDocuments();
    }
  }, [activeProfile, user]); // Reload documents when active profile changes or user loads

  // Close user menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element;
      if (showUserMenu && !target.closest('.user-menu')) {
        setShowUserMenu(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showUserMenu]);

  const loadDocuments = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/documents?user_id=${userId}`, {
        credentials: 'include'
      });
      if (response.ok) {
        const data = await response.json();
        let allDocuments = data.documents || [];
        
        // Filter documents by active profile if one is selected
        if (activeProfile) {
          allDocuments = allDocuments.filter((doc: Document) => {
            // Check if document was generated from the active profile
            return doc.profile_id === activeProfile.id;
          });
        }
        
        setDocuments(allDocuments);
      } else {
        console.error('Failed to load documents:', response.status);
      }
    } catch (error) {
      console.error('Failed to load documents:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = async () => {
    await signOut();
  };

  const handleViewDocument = async (documentId: string) => {
    try {
      const response = await fetch(`/api/documents/${documentId}`, {
        credentials: 'include'
      });
      if (response.ok) {
        const document = await response.json();
        setViewingDocument({
          id: documentId,
          content: document.content_md,
          kind: document.kind
        });
      } else {
        alert('Failed to load document');
      }
    } catch (error) {
      console.error('Error loading document:', error);
      alert('Failed to load document');
    }
  };

  const handleExport = async (documentId: string, format: 'pdf' | 'docx' | 'md') => {
    try {
      const response = await fetch('/api/export', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
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
      const profileName = 'Resume'; // You could get this from the document data
      
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
        link.download = `${profileName}_${format.toUpperCase()}_${timestamp}.${format === 'md' ? 'md' : format}`;
        
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

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  // Group documents by pairs (resume + cover letter)
  const documentPairs = documents.reduce((pairs: any[], doc) => {
    const existingPair = pairs.find(pair => pair.jd_hash === doc.jd_hash);
    if (existingPair) {
      if (doc.kind === 'resume') {
        existingPair.resume = doc;
      } else {
        existingPair.cover_letter = doc;
      }
    } else {
      const newPair: any = { jd_hash: doc.jd_hash };
      if (doc.kind === 'resume') {
        newPair.resume = doc;
      } else {
        newPair.cover_letter = doc;
      }
      pairs.push(newPair);
    }
    return pairs;
  }, []);

  // Show loading screen while checking authentication
  if (authLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-blue-600" />
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  // Don't render anything if not authenticated (redirect is in useEffect)
  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900" style={{colorScheme: 'light'}}>
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-6">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-sm">V</span>
                </div>
                <h1 className="text-lg font-semibold text-gray-900">Vitae Dashboard</h1>
              </div>
              
              {/* Profile Switcher */}
              <div>
                <ProfileSwitcher showManageButton={true} />
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              {activeProfile ? (
                <Link href={`/create?profile_id=${activeProfile.id}`}>
                  <Button className="bg-blue-600 hover:bg-blue-700 text-white font-medium">
                    <FileText className="w-4 h-4 mr-2" />
                    Create Resume & Cover Letter
                  </Button>
                </Link>
              ) : (
                <Link href="/import">
                  <Button className="bg-blue-600 hover:bg-blue-700 text-white font-medium">
                    <Plus className="w-4 h-4 mr-2" />
                    Create First Profile
                  </Button>
                </Link>
              )}
              
              {/* User Menu */}
              <div className="relative user-menu">
                <button
                  onClick={() => setShowUserMenu(!showUserMenu)}
                  className="flex items-center space-x-2 text-gray-700 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                    <span className="text-white text-sm font-medium">
                      {user?.name?.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <span className="hidden md:block">{user?.name}</span>
                  <ChevronDown className="w-4 h-4" />
                </button>

                {/* Dropdown Menu */}
                {showUserMenu && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-50 border border-gray-200">
                    <div className="px-4 py-2 text-sm text-gray-500 border-b border-gray-100">
                      {user?.email}
                    </div>
                    <button
                      onClick={handleLogout}
                      className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center"
                    >
                      <LogOut className="w-4 h-4 mr-2" />
                      Sign Out
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

        {/* Active Profile Overview */}
        {activeProfile ? (
          <div className="bg-white dark:bg-white rounded-lg shadow-sm border border-gray-200 dark:border-gray-200 mb-8">
            <div className="px-6 py-6">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl flex items-center justify-center">
                    <User className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-gray-900">{activeProfile.name}</h2>
                    <p className="text-sm text-gray-600">Profile Overview</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <p className="text-2xl font-bold text-green-600">{activeProfile.completion.percentage}%</p>
                    <p className="text-xs text-gray-500 uppercase tracking-wide">Complete</p>
                  </div>
                  <div className="relative w-16 h-16">
                    <svg className="w-16 h-16 transform -rotate-90" viewBox="0 0 36 36">
                      <path
                        d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                        fill="none"
                        stroke="#f3f4f6"
                        strokeWidth="2"
                      />
                      <path
                        d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                        fill="none"
                        stroke="#10b981"
                        strokeWidth="2"
                        strokeDasharray={`${activeProfile.completion.percentage}, 100`}
                        strokeLinecap="round"
                      />
                    </svg>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <CheckCircle className="w-6 h-6 text-green-600" />
                    </div>
                  </div>
                </div>
              </div>

              {/* Profile Status */}
              {activeProfile.completion.missingFields.length > 0 && (
                <div className="mb-6">
                  <h3 className="font-semibold text-gray-900 mb-4">Complete Your Profile</h3>
                  <p className="text-sm text-gray-600 mb-3">Add these fields to improve your profile:</p>
                  <div className="flex flex-wrap gap-2">
                    {activeProfile.completion.missingFields.map((field, index) => (
                      <span key={index} className="px-3 py-1 bg-orange-100 text-orange-700 text-xs font-medium rounded-full">
                        {field}
                      </span>
                    ))}
                  </div>
                </div>
              )}

            </div>
          </div>
        ) : (
          <div className="bg-white dark:bg-white rounded-lg shadow-sm border border-gray-200 dark:border-gray-200 mb-8">
            <div className="p-8 text-center">
              <User className="w-12 h-12 mx-auto text-gray-300 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No Profile Selected</h3>
              <p className="text-gray-500 mb-4">Create your first profile to start generating resumes and cover letters.</p>
              <Link href="/import">
                <Button className="bg-blue-600 hover:bg-blue-700 text-white font-medium">
                  <Plus className="w-4 h-4 mr-2" />
                  Create First Profile
                </Button>
              </Link>
            </div>
          </div>
        )}

        {/* Documents Table */}
        <div className="bg-white dark:bg-white rounded-lg shadow-sm border border-gray-200 dark:border-gray-200">
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-lg font-semibold text-gray-900">Generated Documents</h2>
                <p className="text-sm text-gray-600 mt-1">
                  {activeProfile 
                    ? `Documents generated from "${activeProfile.name}" profile`
                    : 'Your previously generated resumes and cover letters'
                  }
                </p>
              </div>
            </div>
          </div>

          {isLoading ? (
            <div className="p-8 text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
              <p className="text-gray-500 mt-2">Loading documents...</p>
            </div>
          ) : documentPairs.length === 0 ? (
            <div className="p-8 text-center">
              <FileText className="w-12 h-12 mx-auto text-gray-300 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                {activeProfile ? `No documents from "${activeProfile.name}"` : 'No documents yet'}
              </h3>
              <p className="text-gray-500 mb-4">
                {activeProfile 
                  ? `Generate your first resume and cover letter for this profile`
                  : 'Select a profile and create your first resume and cover letter'
                }
              </p>
              {!activeProfile && (
                <Link href="/import">
                  <Button className="bg-blue-600 hover:bg-blue-700 text-white font-medium">
                    <Plus className="w-4 h-4 mr-2" />
                    Create First Profile
                  </Button>
                </Link>
              )}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-100 dark:bg-gray-100 border-b border-gray-200 dark:border-gray-200">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 dark:text-gray-700 uppercase tracking-wider">
                      Profile
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 dark:text-gray-700 uppercase tracking-wider">
                      Company / Position
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 dark:text-gray-700 uppercase tracking-wider">
                      Fit Score
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 dark:text-gray-700 uppercase tracking-wider">
                      Created
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 dark:text-gray-700 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-white divide-y divide-gray-200 dark:divide-gray-200">
                  {documentPairs.map((pair, index) => {
                    const doc = pair.resume || pair.cover_letter;
                    return (
                  <tr key={pair.jd_hash} className="hover:bg-gray-50 dark:hover:bg-gray-50 border-b border-gray-100 dark:border-gray-100">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <User className="w-5 h-5 text-gray-500 dark:text-gray-500 mr-3" />
                        <div>
                          <div className="text-sm font-semibold text-gray-900 dark:text-gray-900">
                            {doc.profile.name}
                          </div>
                          <div className="text-sm text-gray-600 dark:text-gray-600 font-medium">
                            {pair.resume && pair.cover_letter ? 'Resume + Cover Letter' : 
                             pair.resume ? 'Resume Only' : 'Cover Letter Only'}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-semibold text-gray-900 dark:text-gray-900">
                        {doc.company_name || 'Tech Company'}
                      </div>
                      <div className="text-sm text-gray-700 dark:text-gray-700">
                        {doc.position_title || 'Software Engineer'}
                      </div>
                    </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {doc.fit_score ? (
                            <div className="flex items-center">
                              <div className="text-sm font-semibold text-gray-900 dark:text-gray-900">
                                {doc.fit_score}%
                              </div>
                              <div className="ml-3 w-20 bg-gray-200 dark:bg-gray-200 rounded-full h-3">
                                <div 
                                  className="bg-blue-600 dark:bg-blue-600 h-3 rounded-full transition-all duration-300" 
                                  style={{ width: `${doc.fit_score}%` }}
                                ></div>
                              </div>
                            </div>
                          ) : (
                            <span className="text-gray-500 dark:text-gray-500 font-medium">-</span>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center text-sm text-gray-700 dark:text-gray-700">
                            <Calendar className="w-4 h-4 mr-2 text-gray-500 dark:text-gray-500" />
                            <span className="font-medium">{formatDate(doc.created_at)}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center gap-1">
                            {pair.resume && (
                              <>
                                <Button 
                                  size="sm" 
                                  variant="ghost" 
                                  onClick={() => handleViewDocument(pair.resume.id)}
                                  className="h-8 px-2"
                                >
                                  <Eye className="w-3 h-3" />
                                </Button>
                                <Button 
                                  size="sm" 
                                  variant="outline" 
                                  onClick={() => handleExport(pair.resume.id, 'pdf')}
                                  className="h-8 px-2 text-blue-600 border-blue-300 hover:bg-blue-50"
                                >
                                  PDF
                                </Button>
                                <Button 
                                  size="sm" 
                                  variant="outline" 
                                  onClick={() => handleExport(pair.resume.id, 'docx')}
                                  className="h-8 px-2"
                                >
                                  DOCX
                                </Button>
                              </>
                            )}
                            {pair.cover_letter && (
                              <>
                                <Button 
                                  size="sm" 
                                  variant="ghost" 
                                  onClick={() => handleViewDocument(pair.cover_letter.id)}
                                  className="h-8 px-2"
                                >
                                  <Eye className="w-3 h-3" />
                                </Button>
                                <Button 
                                  size="sm" 
                                  variant="outline" 
                                  onClick={() => handleExport(pair.cover_letter.id, 'pdf')}
                                  className="h-8 px-2 text-green-600 border-green-300 hover:bg-green-50"
                                >
                                  PDF
                                </Button>
                              </>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Document Viewer Modal */}
      {viewingDocument && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] flex flex-col">
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-900">
                {viewingDocument.kind === 'resume' ? 'Resume' : 'Cover Letter'} Preview
              </h2>
              <div className="flex items-center space-x-4">
                <Button 
                  size="sm" 
                  variant="outline" 
                  onClick={() => handleExport(viewingDocument.id, 'pdf')}
                  className="border-blue-300 text-blue-700 hover:bg-blue-50 hover:text-blue-800 hover:border-blue-400 font-medium"
                >
                  <Download className="w-3 h-3 mr-1" />
                  Download PDF
                </Button>
                <Button 
                  size="sm" 
                  variant="outline" 
                  onClick={() => setViewingDocument(null)}
                  className="border-gray-300 text-gray-700 hover:bg-gray-50 hover:text-gray-900 hover:border-gray-400 font-medium"
                >
                  Close
                </Button>
              </div>
            </div>
            <div className="flex-1 overflow-y-auto p-6">
              {viewingDocument.kind === 'resume' ? (
                <MarkdownPreview content={viewingDocument.content} />
              ) : (
                <div className="bg-white p-6 rounded-lg border border-gray-200">
                  <div className="prose prose-sm max-w-none">
                    {viewingDocument.content.split('\n').map((line: string, index: number) => (
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
      )}
    </div>
  );
}