import { useMemo } from 'react';
import { 
  validateEmail, 
  validatePhone, 
  validateUrl, 
  validateName, 
  validateTextContent, 
  validateDate, 
  validateSkills,
  ValidationResult,
  ValidationWarning
} from '@/lib/validation';
import { ProfileFormData } from '@/types';

export interface FormValidationResults {
  header: {
    name: ValidationResult;
    email: ValidationResult;
    phone: ValidationResult;
    location: ValidationResult;
    links: ValidationResult[];
  };
  experience: Array<{
    title: ValidationResult;
    company: ValidationResult;
    start: ValidationResult;
    end: ValidationResult;
    scope: ValidationResult;
    achievements: ValidationResult;
    tools: ValidationResult;
  }>;
  education: Array<{
    degree: ValidationResult;
    school: ValidationResult;
    year: ValidationResult;
    highlights: ValidationResult;
  }>;
  skills: {
    hard_skills: ValidationResult;
    soft_skills: ValidationResult;
  };
  projects: Array<{
    name: ValidationResult;
    role: ValidationResult;
    scope: ValidationResult;
    top_achievements: ValidationResult;
    tools: ValidationResult;
    url: ValidationResult;
  }>;
  overall: {
    completeness: ValidationResult;
    readiness: ValidationResult;
  };
}

/**
 * Hook for comprehensive form validation
 */
export function useFormValidation(formData: ProfileFormData): FormValidationResults {
  return useMemo(() => {
    // Header validation
    const headerValidation = {
      name: validateName(formData.header.name || ''),
      email: validateEmail(formData.header.email || ''),
      phone: validatePhone(formData.header.phone || ''),
      location: validateTextContent(formData.header.location || '', {
        field: 'location',
        minLength: 5,
        maxLength: 100
      }),
      links: formData.header.links.map(link => validateUrl(link))
    };

    // Experience validation
    const experienceValidation = formData.experience.map(exp => ({
      title: validateTextContent(exp.title, {
        field: 'job title',
        minLength: 5,
        maxLength: 80,
        recommendedLength: { min: 10, max: 60 }
      }),
      company: validateTextContent(exp.company, {
        field: 'company name',
        minLength: 2,
        maxLength: 60
      }),
      start: validateDate(exp.start, 'start date'),
      end: validateDate(exp.end, 'end date'),
      scope: validateTextContent(exp.scope, {
        field: 'role description',
        minLength: 50,
        maxLength: 300,
        recommendedLength: { min: 80, max: 200 }
      }),
      achievements: {
        isValid: true,
        warnings: exp.top_achievements.length === 0 ? [{
          field: 'achievements',
          type: 'completeness' as const,
          severity: 'high' as const,
          message: 'Add 2-3 key achievements for better impact'
        }] : exp.top_achievements.length < 2 ? [{
          field: 'achievements',
          type: 'completeness' as const,
          severity: 'medium' as const,
          message: 'Consider adding more achievements (2-3 recommended)'
        }] : [],
        suggestions: exp.top_achievements.length < 3 ? [
          'Include quantified achievements (numbers, percentages, outcomes)'
        ] : []
      },
      tools: {
        isValid: true,
        warnings: exp.tools.length === 0 ? [{
          field: 'tools',
          type: 'completeness' as const,
          severity: 'medium' as const,
          message: 'Add relevant tools and technologies'
        }] : exp.tools.length > 8 ? [{
          field: 'tools',
          type: 'length' as const,
          severity: 'low' as const,
          message: 'Consider listing only the most relevant tools'
        }] : [],
        suggestions: exp.tools.length === 0 ? [
          'Include programming languages, frameworks, software, or methodologies used'
        ] : []
      }
    }));

    // Education validation
    const educationValidation = formData.education.map(edu => ({
      degree: validateTextContent(edu.degree, {
        field: 'degree',
        minLength: 10,
        maxLength: 100
      }),
      school: validateTextContent(edu.school, {
        field: 'school name',
        minLength: 5,
        maxLength: 100
      }),
      year: validateDate(edu.year, 'graduation year'),
      highlights: {
        isValid: true,
        warnings: [],
        suggestions: edu.highlights.length === 0 ? [
          'Consider adding GPA, honors, or relevant coursework'
        ] : []
      }
    }));

    // Skills validation
    const skillsValidation = {
      hard_skills: validateSkills(formData.skills.hard_skills, 'hard'),
      soft_skills: validateSkills(formData.skills.soft_skills, 'soft')
    };

    // Projects validation
    const projectsValidation = formData.projects.map(project => ({
      name: validateTextContent(project.name, {
        field: 'project name',
        minLength: 5,
        maxLength: 80
      }),
      role: validateTextContent(project.role, {
        field: 'project role',
        minLength: 5,
        maxLength: 60
      }),
      scope: validateTextContent(project.scope, {
        field: 'project scope',
        minLength: 50,
        maxLength: 300,
        recommendedLength: { min: 80, max: 200 }
      }),
      top_achievements: {
        isValid: project.top_achievements && project.top_achievements.length >= 2,
        warnings: project.top_achievements && project.top_achievements.length < 3 ? [{
          field: 'project achievements',
          type: 'completeness',
          severity: 'medium',
          message: 'Consider adding more achievements to strengthen your project'
        }] : [],
        suggestions: project.top_achievements && project.top_achievements.length === 0 ? ['Add at least 2 key achievements for this project'] : []
      },
      tools: {
        isValid: project.tools && project.tools.length >= 3,
        warnings: project.tools && project.tools.length < 5 ? [{
          field: 'project tools',
          type: 'completeness',
          severity: 'medium',
          message: 'Consider adding more technologies to show your tech stack'
        }] : [],
        suggestions: project.tools && project.tools.length === 0 ? ['Add at least 3 technologies used in this project'] : []
      },
      url: project.url ? validateUrl(project.url) : {
        isValid: true,
        warnings: [],
        suggestions: []
      }
    }));

    // Overall validation
    const overallValidation = {
      completeness: calculateCompleteness(formData),
      readiness: calculateReadiness(formData, {
        header: headerValidation,
        experience: experienceValidation,
        education: educationValidation,
        skills: skillsValidation,
        projects: projectsValidation
      })
    };

    return {
      header: headerValidation,
      experience: experienceValidation,
      education: educationValidation,
      skills: skillsValidation,
      projects: projectsValidation,
      overall: overallValidation
    };
  }, [formData]);
}

function calculateCompleteness(formData: ProfileFormData): ValidationResult {
  const warnings = [];
  const suggestions = [];

  // Essential fields
  const essentialFields = [
    { value: formData.header.name, name: 'Full name' },
    { value: formData.header.email, name: 'Email address' },
    { value: formData.header.phone, name: 'Phone number' },
    { value: formData.header.location, name: 'Location' }
  ];

  const missingEssential = essentialFields.filter(field => !field.value?.trim());
  if (missingEssential.length > 0) {
    warnings.push({
      field: 'profile',
      type: 'completeness' as const,
      severity: 'high' as const,
      message: `Missing essential information: ${missingEssential.map(f => f.name).join(', ')}`
    });
  }

  // Experience
  if (formData.experience.length === 0) {
    warnings.push({
      field: 'experience',
      type: 'completeness' as const,
      severity: 'high' as const,
      message: 'Add at least one work experience entry'
    });
  }

  // Skills
  if (formData.skills.hard_skills.length === 0) {
    warnings.push({
      field: 'skills',
      type: 'completeness' as const,
      severity: 'high' as const,
      message: 'Add technical skills for better ATS matching'
    });
  }

  // Education
  if (formData.education.length === 0) {
    suggestions.push('Consider adding education background');
  }

  // Professional links
  if (formData.header.links.length === 0) {
    suggestions.push('Add LinkedIn or portfolio links to enhance your profile');
  }

  const completionScore = calculateCompletionPercentage(formData);
  if (completionScore < 60) {
    suggestions.push(`Profile is ${completionScore}% complete. Add more sections for better results.`);
  }

  return {
    isValid: true,
    warnings,
    suggestions
  };
}

function calculateReadiness(
  formData: ProfileFormData, 
  validationResults: Partial<FormValidationResults>
): ValidationResult {
  const warnings = [];
  const suggestions = [];

  // Count high severity issues across all sections
  let totalHighIssues = 0;
  let totalMediumIssues = 0;

  const countIssues = (validation: ValidationResult) => {
    totalHighIssues += validation.warnings.filter(w => w.severity === 'high').length;
    totalMediumIssues += validation.warnings.filter(w => w.severity === 'medium').length;
  };

  // Count issues in all sections
  if (validationResults.header) {
    Object.values(validationResults.header).forEach(v => {
      if (Array.isArray(v)) {
        v.forEach(countIssues);
      } else {
        countIssues(v);
      }
    });
  }

  if (validationResults.experience) {
    validationResults.experience.forEach(exp => {
      Object.values(exp).forEach(countIssues);
    });
  }

  if (validationResults.skills) {
    Object.values(validationResults.skills).forEach(countIssues);
  }

  // Readiness assessment
  if (totalHighIssues > 0) {
    warnings.push({
      field: 'overall',
      type: 'completeness' as const,
      severity: 'high' as const,
      message: `${totalHighIssues} critical issues need attention before generating documents`
    });
  }

  if (totalMediumIssues > 3) {
    warnings.push({
      field: 'overall',
      type: 'recommendation' as const,
      severity: 'medium' as const,
      message: `${totalMediumIssues} formatting issues may affect ATS performance`
    });
  }

  const completionScore = calculateCompletionPercentage(formData);
  if (completionScore >= 80 && totalHighIssues === 0) {
    suggestions.push('Profile looks great! Ready for document generation.');
  } else if (completionScore >= 60) {
    suggestions.push('Good progress! Address any warnings above for optimal results.');
  } else {
    suggestions.push('Complete more sections for better document quality.');
  }

  return {
    isValid: true,
    warnings,
    suggestions
  };
}

function calculateCompletionPercentage(formData: ProfileFormData): number {
  let completed = 0;
  let total = 0;

  // Header fields (weight: 40%)
  const headerFields = [
    formData.header.name,
    formData.header.email,
    formData.header.phone,
    formData.header.location
  ];
  total += 40;
  completed += (headerFields.filter(f => f?.trim()).length / headerFields.length) * 40;

  // Experience (weight: 30%)
  total += 30;
  if (formData.experience.length > 0) {
    const expCompletion = formData.experience.reduce((acc, exp) => {
      const fields = [exp.title, exp.company, exp.start, exp.scope];
      const filledFields = fields.filter(f => f.trim()).length;
      const achievementsScore = exp.top_achievements.length > 0 ? 1 : 0;
      const toolsScore = exp.tools.length > 0 ? 1 : 0;
      return acc + (filledFields + achievementsScore + toolsScore) / 6;
    }, 0);
    completed += (expCompletion / formData.experience.length) * 30;
  }

  // Skills (weight: 20%)
  total += 20;
  const skillsScore = Math.min(
    (formData.skills.hard_skills.length + formData.skills.soft_skills.length) / 8,
    1
  );
  completed += skillsScore * 20;

  // Education (weight: 10%)
  total += 10;
  if (formData.education.length > 0) {
    const eduCompletion = formData.education.reduce((acc, edu) => {
      const fields = [edu.degree, edu.school, edu.year];
      return acc + fields.filter(f => f.trim()).length / 3;
    }, 0);
    completed += (eduCompletion / formData.education.length) * 10;
  }

  return Math.round((completed / total) * 100);
}
