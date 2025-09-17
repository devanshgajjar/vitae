import { ProfileFormData } from '@/types';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

export interface LinkedInProfileData {
  localizedFirstName?: string;
  localizedLastName?: string;
  formattedName?: string;
  emailAddress?: string;
  phoneNumbers?: Array<{ number: string }>;
  location?: { name: string };
  publicProfileUrl?: string;
  headline?: string;
  summary?: string;
  positions?: {
    values: Array<{
      title: string;
      company?: { name: string };
      startDate?: { month: number; year: number };
      endDate?: { month: number; year: number };
      isCurrent?: boolean;
      summary?: string;
      description?: string;
    }>;
  };
  educations?: {
    values: Array<{
      schoolName: string;
      degree?: string;
      fieldOfStudy?: string;
      startDate?: { month: number; year: number };
      endDate?: { month: number; year: number };
      notes?: string;
    }>;
  };
  skills?: {
    values: Array<{
      skill?: { name: string };
    }>;
  };
  projects?: {
    values: Array<{
      name: string;
      description?: string;
      url?: string;
    }>;
  };
}

export function transformLinkedInData(linkedinData: LinkedInProfileData): ProfileFormData {
  const profile: ProfileFormData = {
    header: {
      name: linkedinData.localizedFirstName && linkedinData.localizedLastName 
        ? `${linkedinData.localizedFirstName} ${linkedinData.localizedLastName}`
        : linkedinData.formattedName || '',
      email: linkedinData.emailAddress || '',
      phone: linkedinData.phoneNumbers?.[0]?.number || '',
      location: linkedinData.location?.name || '',
      links: linkedinData.publicProfileUrl ? [linkedinData.publicProfileUrl] : []
    },
    experience: [],
    education: [],
    skills: {
      hard_skills: [],
      soft_skills: []
    },
    projects: [],
    evidence: []
  };

  // Transform positions (work experience)
  if (linkedinData.positions?.values) {
    profile.experience = linkedinData.positions.values.map((position) => ({
      title: position.title || '',
      company: position.company?.name || '',
      start: formatLinkedInDate(position.startDate),
      end: position.isCurrent ? 'present' : formatLinkedInDate(position.endDate),
      scope: position.summary || position.description || '',
      top_achievements: position.summary ? [position.summary] : [],
      tools: []
    }));
  }

  // Transform education
  if (linkedinData.educations?.values) {
    profile.education = linkedinData.educations.values.map((education) => ({
      degree: education.degree || education.fieldOfStudy || '',
      school: education.schoolName || '',
      year: formatLinkedInDate(education.endDate) || formatLinkedInDate(education.startDate) || '',
      highlights: education.notes ? [education.notes] : []
    }));
  }

  // Transform skills
  if (linkedinData.skills?.values) {
    const skills = linkedinData.skills.values
      .map((skill) => skill.skill?.name)
      .filter(Boolean) as string[];
    
    // Categorize skills using AI or heuristics
    profile.skills.hard_skills = categorizeHardSkills(skills).slice(0, 12);
    profile.skills.soft_skills = categorizeSoftSkills(skills).slice(0, 6);
  }

  // Transform projects/publications
  if (linkedinData.projects?.values) {
    profile.projects = linkedinData.projects.values.map((project) => ({
      name: project.name || '',
      role: 'Contributor', // Default role since LinkedIn doesn't specify
      scope: project.description || '',
      top_achievements: [],
      tools: [],
      url: project.url || ''
    }));
  }

  return profile;
}

export async function enhanceProfileWithAI(profileData: ProfileFormData): Promise<ProfileFormData> {
  if (!process.env.OPENAI_API_KEY) {
    console.warn('OpenAI API key not found, skipping AI enhancement');
    return profileData;
  }

  try {
    const prompt = createEnhancementPrompt(profileData);
    
    const response = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [
        {
          role: 'system',
          content: 'You are an expert career counselor and resume writer. Your task is to enhance profile data by improving descriptions, extracting achievements, and categorizing skills appropriately. Return only valid JSON.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      temperature: 0.3,
      max_tokens: 2000
    });

    const enhancedData = JSON.parse(response.choices[0].message.content || '{}');
    
    // Merge enhanced data with original, preserving structure
    return mergeEnhancedData(profileData, enhancedData);
  } catch (error) {
    console.error('AI enhancement failed:', error);
    return profileData;
  }
}

function formatLinkedInDate(dateObj: any): string {
  if (!dateObj) return '';
  
  const month = dateObj.month ? String(dateObj.month).padStart(2, '0') : '01';
  const year = dateObj.year || '';
  
  if (!year) return '';
  
  const monthNames = [
    'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
    'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
  ];
  
  const monthIndex = parseInt(month) - 1;
  const monthName = monthNames[monthIndex] || 'Jan';
  
  return `${monthName} ${year}`;
}

function categorizeHardSkills(skills: string[]): string[] {
  const hardSkillKeywords = [
    'programming', 'software', 'development', 'engineering', 'technical',
    'javascript', 'python', 'java', 'react', 'node', 'sql', 'database',
    'aws', 'cloud', 'docker', 'kubernetes', 'api', 'framework', 'library',
    'analysis', 'data', 'machine learning', 'ai', 'analytics', 'statistics'
  ];
  
  return skills.filter(skill => {
    const skillLower = skill.toLowerCase();
    return hardSkillKeywords.some(keyword => 
      skillLower.includes(keyword) || 
      skillLower.match(/^[a-z]+\.[a-z]+$/) || // Technical formats like node.js
      skillLower.match(/\d/) // Contains numbers (version numbers, etc.)
    );
  });
}

function categorizeSoftSkills(skills: string[]): string[] {
  const softSkillKeywords = [
    'leadership', 'communication', 'management', 'teamwork', 'collaboration',
    'problem solving', 'creative', 'strategic', 'analytical', 'presentation',
    'negotiation', 'mentoring', 'coaching', 'planning', 'organization'
  ];
  
  return skills.filter(skill => {
    const skillLower = skill.toLowerCase();
    return softSkillKeywords.some(keyword => skillLower.includes(keyword));
  });
}

function createEnhancementPrompt(profileData: ProfileFormData): string {
  return `
Please enhance this professional profile data by:
1. Improving job descriptions and achievements
2. Better categorizing skills into hard/technical vs soft skills
3. Extracting quantifiable achievements where possible
4. Ensuring consistent formatting

Current profile data:
${JSON.stringify(profileData, null, 2)}

Return only a JSON object with the same structure but enhanced content. Focus on:
- More compelling achievement descriptions with metrics when possible
- Better skill categorization
- Improved project descriptions
- Professional language and formatting

Maintain all original data but enhance readability and impact.
  `.trim();
}

function mergeEnhancedData(original: ProfileFormData, enhanced: any): ProfileFormData {
  return {
    header: { ...original.header, ...enhanced.header },
    experience: enhanced.experience || original.experience,
    education: enhanced.education || original.education,
    skills: {
      hard_skills: enhanced.skills?.hard_skills || original.skills.hard_skills,
      soft_skills: enhanced.skills?.soft_skills || original.skills.soft_skills
    },
    projects: enhanced.projects || original.projects,
    evidence: original.evidence // Keep evidence as-is
  };
}
