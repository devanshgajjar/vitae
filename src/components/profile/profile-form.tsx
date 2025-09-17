'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import SkillsInput from '@/components/ui/skills-input';
import { ProfileFormData, Experience, Education, Project, Evidence } from '@/types';
import { Plus, Trash2, Save, CheckCircle, Clock, X } from 'lucide-react';
import ImportSection from './import-section';
import { useAutosave } from '@/hooks/useAutosave';

interface ProfileFormProps {
  initialData?: Partial<ProfileFormData>;
  onSave: (data: ProfileFormData) => void;
  isLoading?: boolean;
  profileId?: string;
  enableAutosave?: boolean;
}

export default function ProfileForm({ 
  initialData = {}, 
  onSave, 
  isLoading = false, 
  profileId,
  enableAutosave = true 
}: ProfileFormProps) {
  const [formData, setFormData] = useState<ProfileFormData>({
    header: {
      name: '',
      email: '',
      phone: '',
      location: '',
      links: []
    },
    experience: [],
    education: [],
    skills: {
      hard_skills: [],
      soft_skills: []
    },
    projects: [],
    evidence: [],
    ...initialData
  });

  const [autosaveStatus, setAutosaveStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');

  // Autosave functionality
  const autosaveKey = profileId || `profile_draft_${Date.now()}`;
  const { manualSave, restoreFromAutosave, clearAutosave } = useAutosave(
    formData,
    async (data) => {
      if (enableAutosave) {
        setAutosaveStatus('saving');
        try {
          await onSave(data);
          setAutosaveStatus('saved');
          setTimeout(() => setAutosaveStatus('idle'), 2000);
        } catch (error) {
          setAutosaveStatus('error');
          setTimeout(() => setAutosaveStatus('idle'), 3000);
          console.error('Autosave failed:', error);
        }
      }
    },
    {
      key: autosaveKey,
      delay: 2000,
      enabled: enableAutosave && !isLoading
    }
  );

  // Restore from autosave on component mount
  useEffect(() => {
    if (enableAutosave && !profileId) {
      const restored = restoreFromAutosave();
      if (restored && Object.keys(initialData).length === 0) {
        // Only restore if no initial data was provided
        setFormData(restored);
      }
    }
  }, [enableAutosave, profileId, restoreFromAutosave, initialData]);

  const addExperience = () => {
    setFormData(prev => ({
      ...prev,
      experience: [...prev.experience, {
        title: '',
        company: '',
        start: '',
        end: '',
        scope: '',
        top_achievements: [''],
        tools: []
      }]
    }));
  };

  const removeExperience = (index: number) => {
    setFormData(prev => ({
      ...prev,
      experience: prev.experience.filter((_, i) => i !== index)
    }));
  };

  const updateExperience = (index: number, field: keyof Experience, value: any) => {
    setFormData(prev => ({
      ...prev,
      experience: prev.experience.map((exp, i) => 
        i === index ? { ...exp, [field]: value } : exp
      )
    }));
  };

  const addEducation = () => {
    setFormData(prev => ({
      ...prev,
      education: [...prev.education, {
        degree: '',
        school: '',
        year: '',
        highlights: ['']
      }]
    }));
  };

  const removeEducation = (index: number) => {
    setFormData(prev => ({
      ...prev,
      education: prev.education.filter((_, i) => i !== index)
    }));
  };

  const updateEducation = (index: number, field: keyof Education, value: any) => {
    setFormData(prev => ({
      ...prev,
      education: prev.education.map((edu, i) => 
        i === index ? { ...edu, [field]: value } : edu
      )
    }));
  };

  const addProject = () => {
    setFormData(prev => ({
      ...prev,
      projects: [...prev.projects, {
        name: '',
        role: '',
        scope: '',
        top_achievements: [],
        tools: [],
        url: ''
      }]
    }));
  };

  const removeProject = (index: number) => {
    setFormData(prev => ({
      ...prev,
      projects: prev.projects.filter((_, i) => i !== index)
    }));
  };

  const updateProject = (index: number, field: keyof Project, value: any) => {
    setFormData(prev => ({
      ...prev,
      projects: prev.projects.map((proj, i) => 
        i === index ? { ...proj, [field]: value } : proj
      )
    }));
  };


  const handleLinksChange = (value: string) => {
    const links = value.split('\n').map(s => s.trim()).filter(s => s);
    setFormData(prev => ({
      ...prev,
      header: {
        ...prev.header,
        links
      }
    }));
  };

  const handleImportData = (importedData: Partial<ProfileFormData>) => {
    setFormData(prev => ({
      ...prev,
      ...importedData,
      // Merge arrays instead of replacing
      experience: importedData.experience ? [...prev.experience, ...importedData.experience] : prev.experience,
      education: importedData.education ? [...prev.education, ...importedData.education] : prev.education,
      projects: importedData.projects ? [...prev.projects, ...importedData.projects] : prev.projects,
      evidence: importedData.evidence ? [...prev.evidence, ...importedData.evidence] : prev.evidence,
      // Merge skills
      skills: importedData.skills ? {
        hard_skills: [...new Set([...prev.skills.hard_skills, ...importedData.skills.hard_skills])],
        soft_skills: [...new Set([...prev.skills.soft_skills, ...importedData.skills.soft_skills])]
      } : prev.skills,
      // Merge header links
      header: importedData.header ? {
        ...prev.header,
        ...importedData.header,
        links: [...new Set([...prev.header.links, ...(importedData.header.links || [])])]
      } : prev.header
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <form onSubmit={handleSubmit} className="max-w-5xl mx-auto p-6 space-y-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Professional Profile</h1>
          <p className="text-gray-600">Build your comprehensive professional profile</p>
        </div>
        
        {/* Import Section */}
        <ImportSection onImportData={handleImportData} className="mb-8" />
        
        <div className="modern-card p-8 fade-in">{/* Main form content will go here */}
        
        {/* Header Section */}
        <div className="space-y-6 mb-12">
          <div className="flex items-center space-x-3 mb-6">
            <div className="w-2 h-8 bg-blue-600 rounded-full"></div>
            <h3 className="text-xl font-bold text-gray-900">Basic Information</h3>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label htmlFor="name" className="block text-sm font-semibold text-gray-700 mb-2">
                Full Name *
              </label>
              <input
                id="name"
                value={formData.header.name}
                onChange={(e) => setFormData(prev => ({
                  ...prev,
                  header: { ...prev.header, name: e.target.value }
                }))}
                required
                className="modern-input w-full"
                placeholder="Enter your full name"
              />
            </div>
            
            <div className="space-y-2">
              <label htmlFor="email" className="block text-sm font-semibold text-gray-700 mb-2">
                Email Address *
              </label>
              <input
                id="email"
                type="email"
                value={formData.header.email}
                onChange={(e) => setFormData(prev => ({
                  ...prev,
                  header: { ...prev.header, email: e.target.value }
                }))}
                required
                className="modern-input w-full"
                placeholder="your.email@example.com"
              />
            </div>
            
            <div className="space-y-2">
              <label htmlFor="phone" className="block text-sm font-semibold text-gray-700 mb-2">
                Phone Number
              </label>
              <input
                id="phone"
                value={formData.header.phone}
                onChange={(e) => setFormData(prev => ({
                  ...prev,
                  header: { ...prev.header, phone: e.target.value }
                }))}
                className="modern-input w-full"
                placeholder="+1 (555) 000-0000"
              />
            </div>
            
            <div className="space-y-2">
              <label htmlFor="location" className="block text-sm font-semibold text-gray-700 mb-2">
                Location *
              </label>
              <input
                id="location"
                placeholder="City, Country"
                value={formData.header.location}
                onChange={(e) => setFormData(prev => ({
                  ...prev,
                  header: { ...prev.header, location: e.target.value }
                }))}
                required
                className="modern-input w-full"
              />
            </div>
          </div>
          
          <div className="space-y-2">
            <label htmlFor="links" className="block text-sm font-semibold text-gray-700 mb-2">
              Professional Links
            </label>
            <textarea
              id="links"
              placeholder="LinkedIn profile&#10;GitHub profile&#10;Portfolio website&#10;(One per line)"
              value={formData.header.links.join('\n')}
              onChange={(e) => handleLinksChange(e.target.value)}
              className="modern-input w-full min-h-[100px] resize-none"
            />
            <p className="text-xs text-gray-500 mt-2">Add your professional links, one per line</p>
          </div>
        </div>

        {/* Skills Section */}
        <div className="space-y-6 mb-12">
          <div className="flex items-center space-x-3 mb-6">
            <div className="w-2 h-8 bg-green-600 rounded-full"></div>
            <h3 className="text-xl font-bold text-gray-900">Skills & Expertise</h3>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                <label className="block text-sm font-semibold text-gray-700">
                  Technical Skills (max 12)
                </label>
              </div>
              <SkillsInput
                value={formData.skills.hard_skills}
                onChange={(skills) => setFormData(prev => ({
                  ...prev,
                  skills: { ...prev.skills, hard_skills: skills }
                }))}
                type="hard"
                maxSkills={12}
                placeholder="Type to search technical skills..."
              />
            </div>
            
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
                <label className="block text-sm font-semibold text-gray-700">
                  Soft Skills (max 6)
                </label>
              </div>
              <SkillsInput
                value={formData.skills.soft_skills}
                onChange={(skills) => setFormData(prev => ({
                  ...prev,
                  skills: { ...prev.skills, soft_skills: skills }
                }))}
                type="soft"
                maxSkills={6}
                placeholder="Type to search soft skills..."
              />
            </div>
          </div>
        </div>

        {/* Experience Section */}
        <div className="space-y-6 mb-12">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-2 h-8 bg-orange-600 rounded-full"></div>
              <h3 className="text-xl font-bold text-gray-900">Work Experience</h3>
            </div>
            <button
              type="button"
              onClick={addExperience}
              className="flex items-center space-x-2 px-4 py-2 bg-orange-50 text-orange-700 rounded-lg hover:bg-orange-100 transition-colors border border-orange-200"
            >
              <Plus className="w-4 h-4" />
              <span className="font-medium">Add Experience</span>
            </button>
          </div>
          
          {formData.experience.map((exp, index) => (
            <div key={index} className="modern-card p-6 space-y-6 slide-up">
              <div className="flex justify-between items-start">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center">
                    <span className="text-orange-700 font-semibold text-sm">{index + 1}</span>
                  </div>
                  <h4 className="text-lg font-semibold text-gray-900">Work Experience</h4>
                </div>
                <button 
                  type="button" 
                  onClick={() => removeExperience(index)}
                  className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                  title="Remove this experience"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Job Title *</label>
                  <input
                    value={exp.title}
                    onChange={(e) => updateExperience(index, 'title', e.target.value)}
                    required
                    className="modern-input w-full"
                    placeholder="e.g., Senior Software Engineer"
                  />
                </div>
                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Company *</label>
                  <input
                    value={exp.company}
                    onChange={(e) => updateExperience(index, 'company', e.target.value)}
                    required
                    className="modern-input w-full"
                    placeholder="e.g., Google Inc."
                  />
                </div>
                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Start Date *</label>
                  <input
                    placeholder="e.g., Jan 2020"
                    value={exp.start}
                    onChange={(e) => updateExperience(index, 'start', e.target.value)}
                    required
                    className="modern-input w-full"
                  />
                </div>
                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-gray-700 mb-2">End Date</label>
                  <Input
                    placeholder="MMM YYYY or 'present'"
                    value={exp.end}
                    onChange={(e) => updateExperience(index, 'end', e.target.value)}
                  />
                </div>
              </div>
              
              <div>
                <Label>Role Description (1-2 lines)</Label>
                <Textarea
                  value={exp.scope}
                  onChange={(e) => updateExperience(index, 'scope', e.target.value)}
                  placeholder="Brief description of your role and responsibilities"
                />
              </div>
              
              <div>
                <Label>Key Achievements (max 3)</Label>
                <Textarea
                  value={exp.top_achievements.join('\n')}
                  onChange={(e) => updateExperience(index, 'top_achievements', 
                    e.target.value.split('\n').filter(a => a.trim())
                  )}
                  placeholder="• Increased sales by 25% through strategic initiatives&#10;• Led team of 5 developers on critical project&#10;• Implemented system that reduced processing time by 40%"
                />
              </div>
              
              <div>
                <Label>Tools & Technologies (max 6)</Label>
                <Input
                  value={exp.tools.join(', ')}
                  onChange={(e) => updateExperience(index, 'tools', 
                    e.target.value.split(',').map(t => t.trim()).filter(t => t)
                  )}
                  placeholder="React, Node.js, PostgreSQL, AWS, etc."
                />
              </div>
            </div>
          ))}
        </div>

        {/* Education Section */}
        <div className="space-y-4 mb-8">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold">Education</h3>
            <Button type="button" onClick={addEducation} variant="outline" size="sm">
              <Plus className="w-4 h-4 mr-2" />
              Add Education
            </Button>
          </div>
          
          {formData.education.map((edu, index) => (
            <div key={index} className="border rounded-lg p-4 space-y-4">
              <div className="flex justify-between items-start">
                <h4 className="font-medium">Education #{index + 1}</h4>
                <Button 
                  type="button" 
                  onClick={() => removeEducation(index)}
                  variant="outline"
                  size="sm"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label>Degree *</Label>
                  <Input
                    value={edu.degree}
                    onChange={(e) => updateEducation(index, 'degree', e.target.value)}
                    placeholder="Bachelor of Science in Computer Science"
                    required
                  />
                </div>
                <div>
                  <Label>School *</Label>
                  <Input
                    value={edu.school}
                    onChange={(e) => updateEducation(index, 'school', e.target.value)}
                    placeholder="University Name"
                    required
                  />
                </div>
                <div>
                  <Label>Year *</Label>
                  <Input
                    value={edu.year}
                    onChange={(e) => updateEducation(index, 'year', e.target.value)}
                    placeholder="2020"
                    required
                  />
                </div>
              </div>
              
              <div>
                <Label>Highlights (max 2)</Label>
                <Textarea
                  value={edu.highlights.join('\n')}
                  onChange={(e) => updateEducation(index, 'highlights', 
                    e.target.value.split('\n').filter(h => h.trim())
                  )}
                  placeholder="Magna Cum Laude&#10;Dean's List for 3 semesters"
                />
              </div>
            </div>
          ))}
        </div>

        {/* Projects Section */}
        <div className="space-y-4 mb-8">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold">Notable Projects</h3>
            <Button type="button" onClick={addProject} variant="outline" size="sm">
              <Plus className="w-4 h-4 mr-2" />
              Add Project
            </Button>
          </div>
          
          {formData.projects.map((proj, index) => (
            <div key={index} className="border rounded-lg p-4 space-y-4">
              <div className="flex justify-between items-start">
                <h4 className="font-medium">Project #{index + 1}</h4>
                <Button 
                  type="button" 
                  onClick={() => removeProject(index)}
                  variant="outline"
                  size="sm"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label>Project Name *</Label>
                  <Input
                    value={proj.name}
                    onChange={(e) => updateProject(index, 'name', e.target.value)}
                    required
                  />
                </div>
                <div>
                  <Label>Your Role *</Label>
                  <Input
                    value={proj.role}
                    onChange={(e) => updateProject(index, 'role', e.target.value)}
                    placeholder="Lead Developer, Project Manager, etc."
                    required
                  />
                </div>
              </div>
              
              <div>
                <Label>Project Description</Label>
                <Textarea
                  value={proj.scope}
                  onChange={(e) => updateProject(index, 'scope', e.target.value)}
                  placeholder="Brief description of the project and your contributions"
                />
              </div>
              
              <div>
                <Label>Key Achievements</Label>
                <Textarea
                  value={proj.top_achievements?.join('\n') || ''}
                  onChange={(e) => updateProject(index, 'top_achievements', e.target.value.split('\n').filter(a => a.trim()))}
                  placeholder="List your key achievements for this project, one per line"
                  rows={3}
                />
              </div>
              
              <div>
                <Label>Technologies Used</Label>
                <Input
                  value={proj.tools?.join(', ') || ''}
                  onChange={(e) => updateProject(index, 'tools', e.target.value.split(',').map(t => t.trim()).filter(t => t))}
                  placeholder="React, Node.js, PostgreSQL, AWS"
                />
              </div>
              
              <div>
                <Label>Project URL (optional)</Label>
                <Input
                  value={proj.url || ''}
                  onChange={(e) => updateProject(index, 'url', e.target.value)}
                  placeholder="https://github.com/username/project or https://project-demo.com"
                />
              </div>
            </div>
          ))}
        </div>

        </div>
        
        {/* Save Button */}
        <div className="sticky bottom-0 bg-white border-t border-gray-200 px-8 py-6 -mx-8 -mb-8 rounded-b-2xl">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-4">
              <div className="text-sm text-gray-500">
                {enableAutosave ? 'Changes auto-save every 2 seconds' : 'Make sure to save your changes before leaving'}
              </div>
              {enableAutosave && (
                <div className="flex items-center space-x-2 text-xs">
                  {autosaveStatus === 'saving' && (
                    <>
                      <Clock className="w-3 h-3 text-yellow-500 animate-pulse" />
                      <span className="text-yellow-600">Saving...</span>
                    </>
                  )}
                  {autosaveStatus === 'saved' && (
                    <>
                      <CheckCircle className="w-3 h-3 text-green-500" />
                      <span className="text-green-600">Saved</span>
                    </>
                  )}
                  {autosaveStatus === 'error' && (
                    <>
                      <X className="w-3 h-3 text-red-500" />
                      <span className="text-red-600">Save failed</span>
                    </>
                  )}
                </div>
              )}
            </div>
            <div className="flex items-center space-x-3">
              {enableAutosave && (
                <button
                  type="button"
                  onClick={manualSave}
                  disabled={isLoading || autosaveStatus === 'saving'}
                  className="px-4 py-2 text-sm text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50"
                >
                  Save Now
                </button>
              )}
              <button 
                type="submit" 
                disabled={isLoading}
                className="modern-button px-8 py-3 text-base font-semibold flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    <span>Saving Profile...</span>
                  </>
                ) : (
                  <>
                    <Save className="w-5 h-5" />
                    <span>{enableAutosave ? 'Finalize Profile' : 'Save Profile'}</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}
