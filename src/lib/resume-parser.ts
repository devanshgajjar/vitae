import { ProfileFormData } from '@/types';

// Import parsing libraries dynamically to avoid build issues
let pdfParse: any = null;
let mammoth: any = null;

async function loadParsers() {
  if (typeof window === 'undefined') {
    try {
      pdfParse = (await import('pdf-parse' as any)).default;
      // Note: mammoth is for converting DOCX to HTML, not extracting text
      // For DOCX text extraction, we'll use a simpler approach
    } catch (error) {
      console.warn('Failed to load parsing libraries:', error);
    }
  }
}

export async function extractTextFromFile(file: File): Promise<string> {
  await loadParsers();

  if (file.type === 'text/plain') {
    return await file.text();
  }

  if (file.type === 'application/pdf') {
    return await extractTextFromPDF(file);
  }

  if (file.type.includes('word') || file.type.includes('document')) {
    return await extractTextFromDOCX(file);
  }

  throw new Error('Unsupported file type');
}

async function extractTextFromPDF(file: File): Promise<string> {
  if (!pdfParse) {
    // Return a helpful message instead of throwing an error
    return `[PDF File: ${file.name}]

PDF parsing is not available in this environment.

To import your resume, please:
1. Convert your PDF to a text file, or
2. Copy and paste the text content using the "Paste Resume Text" option

You can convert PDF to text using:
- Online converters (pdf-to-text.com, etc.)
- Adobe Reader (Save As Text)
- Google Docs (Upload PDF, then copy text)
`;
  }

  try {
    const arrayBuffer = await file.arrayBuffer();
    const result = await pdfParse(Buffer.from(arrayBuffer));
    
    if (!result.text || result.text.trim().length < 10) {
      throw new Error('PDF appears to be empty or contains no readable text');
    }
    
    return result.text;
  } catch (error) {
    console.error('PDF parsing error:', error);
    return `[PDF File: ${file.name}]

Could not extract text from this PDF file.

This might happen if:
- The PDF is scanned/image-based (no selectable text)
- The PDF is password protected
- The PDF has unusual formatting

To import your resume, please:
1. Try copy-pasting the text using the "Paste Resume Text" option
2. Convert to a different format (TXT, DOCX)
3. Save as plain text from your PDF viewer
`;
  }
}

async function extractTextFromDOCX(file: File): Promise<string> {
  try {
    // Basic DOCX text extraction - very limited but safe
    const arrayBuffer = await file.arrayBuffer();
    
    // Try to extract readable text (this is a very basic approach)
    const text = new TextDecoder().decode(arrayBuffer);
    const readableText = text.replace(/[^\x20-\x7E\n]/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();
    
    if (readableText.length < 50) {
      // Return helpful message instead of throwing error
      return `[DOCX File: ${file.name}]

Could not extract readable text from this DOCX file.

To import your resume, please:
1. Open the file and copy the text content
2. Use the "Paste Resume Text" option below
3. Or save the file as plain text (.txt) and upload again

This ensures we can properly parse your resume content.`;
    }
    
    return readableText;
  } catch (error) {
    console.error('DOCX parsing error:', error);
    return `[DOCX File: ${file.name}]

Could not process this DOCX file.

To import your resume, please:
1. Open the file in Word or Google Docs
2. Select all text and copy it
3. Use the "Paste Resume Text" option instead
4. Or save as a plain text file (.txt)

This will ensure accurate text extraction.`;
  }
}

export async function parseResumeText(text: string): Promise<ProfileFormData> {
  // Check if this is an instructional message (from file parsing issues)
  if (text.includes('[PDF File:') || text.includes('[DOCX File:') || text.includes('PDF parsing is not available')) {
    // Return a basic profile with the instructional message in the experience
    return {
      header: {
        name: 'Please Update',
        email: '',
        phone: '',
        location: '',
        links: []
      },
      experience: [
        {
          title: 'File Import Notice',
          company: 'Please read the instructions below',
          start: '',
          end: '',
          scope: text,
          top_achievements: ['Follow the instructions above to properly import your resume'],
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
  }

  const lines = text.split('\n').map(line => line.trim()).filter(line => line);
  
  const profileData: ProfileFormData = {
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
    evidence: []
  };

  // Extract contact information
  extractContactInfo(lines, profileData);
  
  // Extract experience
  extractExperience(lines, profileData);
  
  // Extract education
  extractEducation(lines, profileData);
  
  // Extract skills
  extractSkills(text, profileData);
  
  // Extract projects
  extractProjects(lines, profileData);

  return profileData;
}

function extractContactInfo(lines: string[], profileData: ProfileFormData) {
  for (const line of lines) {
    // Extract email
    const emailMatch = line.match(/[\w\.-]+@[\w\.-]+\.\w+/);
    if (emailMatch && !profileData.header.email) {
      profileData.header.email = emailMatch[0];
    }

    // Extract phone
    const phoneMatch = line.match(/[\+]?[1-9]?[\d\s\-\(\)]{10,15}/);
    if (phoneMatch && !profileData.header.phone && !line.includes('@')) {
      profileData.header.phone = phoneMatch[0].trim();
    }

    // Extract name (heuristic: likely to be early in document, proper case, no special chars)
    if (!profileData.header.name && line.length > 3 && line.length < 50 && 
        !line.includes('@') && !line.includes('http') && !line.includes('://') &&
        /^[A-Za-z\s\.]+$/.test(line) && /[A-Z]/.test(line)) {
      profileData.header.name = line;
    }

    // Extract LinkedIn URL
    const linkedinMatch = line.match(/linkedin\.com\/in\/[\w\-]+/i);
    if (linkedinMatch) {
      const url = linkedinMatch[0].startsWith('http') ? linkedinMatch[0] : `https://${linkedinMatch[0]}`;
      profileData.header.links.push(url);
    }

    // Extract GitHub URL
    const githubMatch = line.match(/github\.com\/[\w\-]+/i);
    if (githubMatch) {
      const url = githubMatch[0].startsWith('http') ? githubMatch[0] : `https://${githubMatch[0]}`;
      profileData.header.links.push(url);
    }

    // Extract location (look for city, state/country patterns)
    const locationMatch = line.match(/([A-Za-z\s]+),\s*([A-Za-z\s]{2,})/);
    if (locationMatch && !profileData.header.location && 
        !line.includes('@') && !line.includes('http')) {
      profileData.header.location = locationMatch[0];
    }
  }
}

function extractExperience(lines: string[], profileData: ProfileFormData) {
  const experienceKeywords = ['experience', 'work', 'employment', 'career', 'professional'];
  const commonTitles = ['engineer', 'developer', 'manager', 'director', 'analyst', 'consultant', 'specialist', 'coordinator', 'lead', 'senior', 'junior'];
  
  let inExperienceSection = false;
  let currentExp: any = null;
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].toLowerCase();
    
    // Check if we're entering experience section
    if (experienceKeywords.some(keyword => line.includes(keyword)) && line.length < 30) {
      inExperienceSection = true;
      continue;
    }
    
    // Check if we're leaving experience section
    if (inExperienceSection && 
        (line.includes('education') || line.includes('skills') || line.includes('projects'))) {
      inExperienceSection = false;
    }
    
    if (inExperienceSection || !profileData.experience.length) {
      const originalLine = lines[i];
      
      // Look for job titles
      if (commonTitles.some(title => line.includes(title))) {
        if (currentExp) {
          profileData.experience.push(currentExp);
        }
        
        currentExp = {
          title: originalLine,
          company: '',
          start: '',
          end: '',
          scope: '',
          top_achievements: [],
          tools: []
        };
        
        // Look for company name in next few lines
        for (let j = i + 1; j < Math.min(i + 3, lines.length); j++) {
          const nextLine = lines[j];
          if (nextLine.length > 2 && nextLine.length < 50 && 
              !nextLine.match(/\d{4}/) && // Not a date
              !nextLine.includes('•') && // Not a bullet point
              /^[A-Za-z\s&,\.]+$/.test(nextLine)) { // Only letters and basic punctuation
            currentExp.company = nextLine;
            break;
          }
        }
      }
      
      // Look for dates
      const dateMatch = originalLine.match(/(\w{3,9}\s+\d{4})\s*[-–—]\s*(\w{3,9}\s+\d{4}|present)/i);
      if (dateMatch && currentExp) {
        currentExp.start = dateMatch[1];
        currentExp.end = dateMatch[2];
      }
      
      // Look for bullet points (achievements)
      if ((originalLine.startsWith('•') || originalLine.startsWith('-') || originalLine.startsWith('*')) && currentExp) {
        const achievement = originalLine.replace(/^[•\-*]\s*/, '').trim();
        if (achievement.length > 10) {
          currentExp.top_achievements.push(achievement);
        }
      }
    }
  }
  
  if (currentExp) {
    profileData.experience.push(currentExp);
  }
  
  // If no experience found, add a placeholder
  if (profileData.experience.length === 0) {
    profileData.experience.push({
      title: 'Please update this entry',
      company: 'Company Name',
      start: 'Month Year',
      end: 'Month Year',
      scope: 'Add your role description here',
      top_achievements: ['Add your key achievements here'],
      tools: []
    });
  }
}

function extractEducation(lines: string[], profileData: ProfileFormData) {
  const educationKeywords = ['education', 'academic', 'university', 'college', 'school', 'degree'];
  const degreeTypes = ['bachelor', 'master', 'phd', 'doctorate', 'associate', 'certificate', 'diploma'];
  
  let inEducationSection = false;
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].toLowerCase();
    const originalLine = lines[i];
    
    // Check if we're entering education section
    if (educationKeywords.some(keyword => line.includes(keyword)) && line.length < 30) {
      inEducationSection = true;
      continue;
    }
    
    // Check if we're leaving education section
    if (inEducationSection && 
        (line.includes('experience') || line.includes('skills') || line.includes('projects'))) {
      inEducationSection = false;
    }
    
    // Look for degree information
    if (inEducationSection || degreeTypes.some(degree => line.includes(degree))) {
      const yearMatch = originalLine.match(/\b(19|20)\d{2}\b/);
      const year = yearMatch ? yearMatch[0] : '';
      
      if (degreeTypes.some(degree => line.includes(degree))) {
        const education = {
          degree: originalLine,
          school: '',
          year: year,
          highlights: []
        };
        
        // Look for school name in surrounding lines
        for (let j = Math.max(0, i - 2); j < Math.min(i + 3, lines.length); j++) {
          if (j !== i) {
            const candidateLine = lines[j];
            if (candidateLine.length > 3 && candidateLine.length < 80 &&
                (candidateLine.toLowerCase().includes('university') || 
                 candidateLine.toLowerCase().includes('college') ||
                 candidateLine.toLowerCase().includes('institute'))) {
              education.school = candidateLine;
              break;
            }
          }
        }
        
        profileData.education.push(education);
      }
    }
  }
}

function extractSkills(text: string, profileData: ProfileFormData) {
  // Common technical skills
  const hardSkills = [
    'JavaScript', 'TypeScript', 'Python', 'Java', 'C++', 'C#', 'Go', 'Rust', 'PHP', 'Ruby',
    'React', 'Angular', 'Vue', 'Node.js', 'Express', 'Django', 'Flask', 'Spring', 'Laravel',
    'HTML', 'CSS', 'SASS', 'SCSS', 'Bootstrap', 'Tailwind',
    'SQL', 'MongoDB', 'PostgreSQL', 'MySQL', 'Redis', 'Firebase',
    'AWS', 'Azure', 'GCP', 'Docker', 'Kubernetes', 'Jenkins', 'GitLab', 'GitHub',
    'Git', 'Linux', 'Windows', 'macOS', 'Apache', 'Nginx',
    'Machine Learning', 'AI', 'Data Science', 'TensorFlow', 'PyTorch', 'Pandas', 'NumPy',
    'REST', 'GraphQL', 'API', 'Microservices', 'Agile', 'Scrum', 'DevOps', 'CI/CD'
  ];
  
  // Common soft skills
  const softSkills = [
    'Leadership', 'Communication', 'Problem Solving', 'Team Collaboration', 'Project Management',
    'Critical Thinking', 'Creativity', 'Adaptability', 'Time Management', 'Mentoring',
    'Strategic Planning', 'Analytical Thinking', 'Customer Service', 'Presentation Skills'
  ];
  
  const textUpper = text.toUpperCase();
  
  // Extract hard skills
  for (const skill of hardSkills) {
    if (textUpper.includes(skill.toUpperCase())) {
      profileData.skills.hard_skills.push(skill);
    }
  }
  
  // Extract soft skills
  for (const skill of softSkills) {
    if (textUpper.includes(skill.toUpperCase())) {
      profileData.skills.soft_skills.push(skill);
    }
  }
  
  // Remove duplicates and limit
  profileData.skills.hard_skills = [...new Set(profileData.skills.hard_skills)].slice(0, 12);
  profileData.skills.soft_skills = [...new Set(profileData.skills.soft_skills)].slice(0, 6);
}

function extractProjects(lines: string[], profileData: ProfileFormData) {
  const projectKeywords = ['projects', 'portfolio', 'work samples', 'github'];
  
  let inProjectSection = false;
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].toLowerCase();
    const originalLine = lines[i];
    
    // Check if we're entering projects section
    if (projectKeywords.some(keyword => line.includes(keyword)) && line.length < 30) {
      inProjectSection = true;
      continue;
    }
    
    // Check if we're leaving projects section
    if (inProjectSection && 
        (line.includes('experience') || line.includes('education') || line.includes('skills'))) {
      inProjectSection = false;
    }
    
    if (inProjectSection) {
      // Look for project names (often in title case or with special formatting)
      if (originalLine.length > 5 && originalLine.length < 100 &&
          !originalLine.startsWith('•') && !originalLine.startsWith('-') &&
          /[A-Z]/.test(originalLine)) {
        
        const project = {
          name: originalLine,
          role: 'Developer', // Default role
          description: '',
          link: ''
        };
        
        // Look for description in next few lines
        for (let j = i + 1; j < Math.min(i + 4, lines.length); j++) {
          const nextLine = lines[j];
          if (nextLine.startsWith('•') || nextLine.startsWith('-')) {
            project.description = nextLine.replace(/^[•\-]\s*/, '').trim();
            break;
          }
        }
        
        // Look for GitHub or project URLs
        const urlMatch = originalLine.match(/(https?:\/\/[^\s]+)/);
        if (urlMatch) {
          project.link = urlMatch[0];
        }
        
        profileData.projects.push(project);
      }
    }
  }
}
