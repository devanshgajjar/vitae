import { ProfileFormData } from '@/types';

export interface ProfileCompletionDetails {
  percentage: number;
  missingFields: string[];
  suggestions: string[];
  isComplete: boolean;
}

export function calculateProfileCompletion(profile: any): ProfileCompletionDetails {
  const missingFields: string[] = [];
  const suggestions: string[] = [];
  let totalFields = 0;
  let completedFields = 0;

  // Helper function to check if a value is filled
  const isFilled = (value: any): boolean => {
    if (value === null || value === undefined) return false;
    if (typeof value === 'string') return value.trim().length > 0;
    if (Array.isArray(value)) return value.length > 0;
    if (typeof value === 'object') return Object.keys(value).length > 0;
    return true;
  };

  // Check header fields (30% of total weight)
  const headerFields = [
    { key: 'name', label: 'Full Name', required: true },
    { key: 'email', label: 'Email', required: true },
    { key: 'phone', label: 'Phone Number', required: false },
    { key: 'location', label: 'Location', required: true },
    { key: 'links', label: 'Professional Links', required: false }
  ];

  headerFields.forEach(field => {
    totalFields += field.required ? 2 : 1; // Required fields count more
    const value = profile.header?.[field.key];
    
    if (isFilled(value)) {
      completedFields += field.required ? 2 : 1;
    } else {
      if (field.required) {
        missingFields.push(field.label);
        suggestions.push(`Add your ${field.label.toLowerCase()}`);
      }
    }
  });

  // Check experience (25% of total weight)
  totalFields += 5; // Experience is important
  if (profile.experience && profile.experience.length > 0) {
    completedFields += 3;
    
    // Check if experiences have detailed information
    const hasDetailedExperience = profile.experience.some((exp: any) => 
      isFilled(exp.title) && isFilled(exp.company) && isFilled(exp.scope) && 
      exp.top_achievements && exp.top_achievements.length > 0
    );
    
    if (hasDetailedExperience) {
      completedFields += 2;
    } else {
      suggestions.push('Add detailed descriptions and achievements to your work experience');
    }
  } else {
    missingFields.push('Work Experience');
    suggestions.push('Add at least one work experience entry');
  }

  // Check education (15% of total weight)
  totalFields += 3;
  if (profile.education && profile.education.length > 0) {
    completedFields += 2;
    
    const hasDetailedEducation = profile.education.some((edu: any) => 
      isFilled(edu.degree) && isFilled(edu.school) && isFilled(edu.year)
    );
    
    if (hasDetailedEducation) {
      completedFields += 1;
    }
  } else {
    missingFields.push('Education');
    suggestions.push('Add your educational background');
  }

  // Check skills (20% of total weight)
  totalFields += 4;
  if (profile.skills?.hard_skills && profile.skills.hard_skills.length > 0) {
    completedFields += 2;
    if (profile.skills.hard_skills.length >= 5) {
      completedFields += 1;
    }
  } else {
    missingFields.push('Technical Skills');
    suggestions.push('Add your technical skills');
  }

  if (profile.skills?.soft_skills && profile.skills.soft_skills.length > 0) {
    completedFields += 1;
  } else {
    suggestions.push('Add soft skills to showcase your interpersonal abilities');
  }

  // Check projects (10% of total weight)
  totalFields += 2;
  if (profile.projects && profile.projects.length > 0) {
    completedFields += 1;
    
    const hasDetailedProjects = profile.projects.some((proj: any) => 
      isFilled(proj.name) && isFilled(proj.description)
    );
    
    if (hasDetailedProjects) {
      completedFields += 1;
    }
  } else {
    suggestions.push('Add notable projects to demonstrate your skills');
  }

  const percentage = Math.round((completedFields / totalFields) * 100);
  const isComplete = percentage >= 85; // Consider 85%+ as complete

  return {
    percentage,
    missingFields,
    suggestions: suggestions.slice(0, 3), // Limit to top 3 suggestions
    isComplete
  };
}

export function getCompletionColor(percentage: number): string {
  if (percentage >= 85) return 'text-green-600';
  if (percentage >= 60) return 'text-yellow-600';
  return 'text-red-600';
}

export function getCompletionBgColor(percentage: number): string {
  if (percentage >= 85) return 'bg-green-100 border-green-200';
  if (percentage >= 60) return 'bg-yellow-100 border-yellow-200';
  return 'bg-red-100 border-red-200';
}

export function getCompletionStatus(percentage: number): string {
  if (percentage >= 85) return 'Complete';
  if (percentage >= 60) return 'Good';
  if (percentage >= 40) return 'Basic';
  return 'Incomplete';
}
