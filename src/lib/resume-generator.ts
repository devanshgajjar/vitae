import { openai, AI_MODELS } from './ai-client';
import { Profile, JobDescription, GenerationOptions, TraceMapping } from '@/types';

export async function generateResume(
  profile: Profile,
  jd: JobDescription,
  options: GenerationOptions
): Promise<{ content: string; traceMapping: TraceMapping[] }> {
  
  // If no OpenAI API key, return mock resume
  if (!openai) {
    console.log('Using mock resume generator (no OpenAI API key)');
    
    const mockResume = `# ${profile.header.name}

**${profile.header.email} | ${profile.header.location}**
${profile.header.links.join(' | ')}

## Professional Summary

Experienced ${profile.experience[0]?.title || 'Professional'} with ${profile.experience.length}+ years of experience in ${profile.skills.hard_skills.slice(0, 3).join(', ')}. Proven track record of delivering results and collaborating with cross-functional teams.

## Core Skills

**Technical:** ${profile.skills.hard_skills.join(' • ')}

**Soft Skills:** ${profile.skills.soft_skills.join(' • ')}

## Professional Experience

${profile.experience.map(exp => `
### ${exp.title}
**${exp.company}** | ${exp.start} - ${exp.end}

${exp.scope}

${exp.top_achievements.map(achievement => `• ${achievement}`).join('\n')}

**Technologies:** ${exp.tools.join(', ')}
`).join('\n')}

## Education

${profile.education.map(edu => `
**${edu.degree}**
${edu.school} | ${edu.year}
${edu.highlights.length > 0 ? edu.highlights.map(h => `• ${h}`).join('\n') : ''}
`).join('\n')}

${profile.projects.length > 0 ? `## Notable Projects

${profile.projects.map(proj => `
### ${proj.name}
**Role:** ${proj.role}
${proj.scope}
${proj.top_achievements.length > 0 ? `**Key Achievements:**
${proj.top_achievements.map(achievement => `• ${achievement}`).join('\n')}` : ''}
${proj.tools.length > 0 ? `**Technologies:** ${proj.tools.join(', ')}` : ''}
${proj.url ? `**Link:** ${proj.url}` : ''}
`).join('\n')}` : ''}`;

    const mockTraceMapping: TraceMapping[] = [
      {
        output_bullet: profile.experience[0]?.top_achievements[0] || 'Mock achievement',
        source_id: profile.experience[0]?.id || 'exp_1',
        source_type: 'experience',
        confidence: 'verified'
      }
    ];

    return {
      content: mockResume,
      traceMapping: mockTraceMapping
    };
  }
  
  const systemPrompt = `You are an expert ATS-safe resume writer. Create a tailored resume using ONLY the candidate's profile data. Follow these rules:

STRICT GUIDELINES:
1. NO FABRICATION: Use only information from the provided profile
2. TRACEABILITY: Every bullet point must map to profile source data
3. ATS SAFETY: Use standard formatting, no tables, simple text
4. KEYWORD OPTIMIZATION: Include JD keywords only where genuinely applicable
5. QUANTIFY: Prefer metrics and specific achievements

STRUCTURE:
- Professional Summary (2-3 lines, JD-aligned)
- Core Skills (grouped logically, max 12)
- Professional Experience (reverse chronological)
- Education
- Projects (if relevant)
- Certifications/Additional (if applicable)

FORMAT:
- Use standard section headers
- Bullet points with action verbs
- Dates in "MMM YYYY" format
- One page preferred unless 10+ years experience
- No personal information (age, marital status, photo)

BULLET FORMULA: Action Verb + Scope + Result (with metrics if available)

Return JSON with:
{
  "resume_md": "markdown content with proper escaping",
  "trace_mapping": [{"output_bullet": "text", "source_id": "experience_id", "source_type": "experience", "confidence": "verified"}]
}

IMPORTANT: Ensure all newlines in the markdown content are properly escaped as \\n in the JSON.`;

  const userPrompt = `Create a tailored resume for this job:

JOB DETAILS:
Company: ${jd.company}
Role: ${jd.role}
Must-haves: ${jd.must_haves.join(', ')}
Nice-to-haves: ${jd.nice_to_haves.join(', ')}
Keywords: ${jd.keywords.join(', ')}

CANDIDATE PROFILE:
${JSON.stringify(profile, null, 2)}

OPTIONS:
Style: ${options.resume_style}
Length: ${options.length}
Tone: ${options.tone}
Include Summary: ${options.include_summary}

Create the resume following all guidelines and return structured JSON.`;

  try {
    const response = await openai.chat.completions.create({
      model: AI_MODELS.GPT_4O,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt }
      ],
      temperature: 0.3
    });

    const content = response.choices[0]?.message?.content;
    if (!content) {
      throw new Error('No response from AI');
    }

    // Extract JSON from the response (might be wrapped in markdown or text)
    let jsonContent = content;
    const jsonMatch = content.match(/```(?:json)?\s*(\{[\s\S]*?\})\s*```/);
    if (jsonMatch) {
      jsonContent = jsonMatch[1];
    } else if (content.includes('{') && content.includes('}')) {
      const startIndex = content.indexOf('{');
      const lastIndex = content.lastIndexOf('}');
      jsonContent = content.substring(startIndex, lastIndex + 1);
    }

    // Clean up potential control characters and fix common JSON issues
    jsonContent = jsonContent
      .replace(/[\u0000-\u001F\u007F-\u009F]/g, '') // Remove control characters
      .replace(/\n/g, '\\n') // Escape newlines
      .replace(/\r/g, '\\r') // Escape carriage returns
      .replace(/\t/g, '\\t') // Escape tabs
      .replace(/"/g, '"') // Fix smart quotes
      .replace(/"/g, '"') // Fix smart quotes
      .replace(/'/g, "'") // Fix smart quotes
      .replace(/'/g, "'"); // Fix smart quotes

    let parsed;
    try {
      parsed = JSON.parse(jsonContent);
    } catch (parseError) {
      console.error('JSON parsing failed for resume, using fallback:', parseError);
      console.error('Problematic JSON content:', jsonContent.substring(0, 200) + '...');
      
      // Fallback: return the mock resume format
      const fallbackResume = `# ${profile.header.name}

**${profile.header.email} | ${profile.header.location}**
${profile.header.links.join(' | ')}

## Professional Summary

${profile.experience[0]?.title || 'Professional'} with ${profile.experience.length}+ years of experience in ${profile.skills.hard_skills.slice(0, 3).join(', ')}. Proven track record of delivering results.

## Core Skills

**Technical:** ${profile.skills.hard_skills.join(' • ')}

**Soft Skills:** ${profile.skills.soft_skills.join(' • ')}

## Professional Experience

${profile.experience.map(exp => `
### ${exp.title}
**${exp.company}** | ${exp.start} - ${exp.end}

${exp.scope}

${exp.top_achievements.map(achievement => `• ${achievement}`).join('\n')}

**Technologies:** ${exp.tools.join(', ')}
`).join('\n')}

## Education

${profile.education.map(edu => `
**${edu.degree}**
${edu.school} | ${edu.year}
${edu.highlights.length > 0 ? edu.highlights.map(h => `• ${h}`).join('\n') : ''}
`).join('\n')}`;

      return {
        content: fallbackResume,
        traceMapping: [{
          output_bullet: profile.experience[0]?.top_achievements[0] || 'Experience reference',
          source_id: profile.experience[0]?.id || 'exp_1',
          source_type: 'experience',
          confidence: 'derived'
        }]
      };
    }
    
    return {
      content: parsed.resume_md || '',
      traceMapping: Array.isArray(parsed.trace_mapping) ? parsed.trace_mapping : []
    };
  } catch (error) {
    console.error('Error generating resume:', error);
    throw new Error('Failed to generate resume');
  }
}

export async function generateCoverLetter(
  profile: Profile,
  jd: JobDescription,
  options: GenerationOptions
): Promise<{ content: string; traceMapping: TraceMapping[] }> {
  
  // If no OpenAI API key, return mock cover letter
  if (!openai) {
    console.log('Using mock cover letter generator (no OpenAI API key)');
    
    const mockCoverLetter = `# Cover Letter

**${profile.header.name}**
${profile.header.email}
${profile.header.location}

---

Dear Hiring Manager,

I am writing to express my strong interest in the ${jd.role} position at ${jd.company}. With my background as a ${profile.experience[0]?.title || 'Professional'} and expertise in ${profile.skills.hard_skills.slice(0, 3).join(', ')}, I am excited about the opportunity to contribute to your team.

In my current role at ${profile.experience[0]?.company || 'Previous Company'}, I have ${profile.experience[0]?.top_achievements[0] || 'achieved significant results'}. This experience has strengthened my skills in ${profile.skills.hard_skills.slice(0, 2).join(' and ')}, which directly align with your requirements for ${jd.must_haves.slice(0, 2).join(' and ')}.

${profile.experience[0]?.top_achievements[1] ? `Additionally, ${profile.experience[0].top_achievements[1].toLowerCase()}. ` : ''}I am particularly drawn to ${jd.company} because of your focus on ${jd.responsibilities[0]?.toLowerCase() || 'innovation and excellence'}.

I would welcome the opportunity to discuss how my experience with ${profile.skills.hard_skills[0]} and ${profile.skills.hard_skills[1]} can contribute to your team's success. Thank you for considering my application.

Best regards,
${profile.header.name}`;

    const mockTraceMapping: TraceMapping[] = [
      {
        output_bullet: profile.experience[0]?.top_achievements[0] || 'Mock achievement',
        source_id: profile.experience[0]?.id || 'exp_1',
        source_type: 'experience',
        confidence: 'verified'
      }
    ];

    return {
      content: mockCoverLetter,
      traceMapping: mockTraceMapping
    };
  }
  
  const systemPrompt = `You are an expert cover letter writer. Create a compelling, personalized cover letter using ONLY the candidate's profile data.

STRUCTURE:
1. HOOK (1-2 sentences): Why this company/role excites you
2. MATCH (2-3 paragraphs): Map your achievements to JD requirements
3. CLOSE (1 paragraph): Availability and call-to-action

GUIDELINES:
- 250-350 words total
- Professional but engaging tone
- Specific achievements with metrics when possible
- Address the company by name
- No generic templates
- Use only verified information from profile

Return JSON with:
{
  "cover_letter_md": "markdown content with proper escaping",
  "trace_mapping": [{"output_bullet": "text", "source_id": "source", "source_type": "experience", "confidence": "verified"}]
}

IMPORTANT: Ensure all newlines in the markdown content are properly escaped as \\n in the JSON.`;

  const userPrompt = `Create a cover letter for this opportunity:

JOB DETAILS:
Company: ${jd.company}
Role: ${jd.role}
Responsibilities: ${jd.responsibilities.join('; ')}
Must-haves: ${jd.must_haves.join(', ')}

CANDIDATE PROFILE:
Name: ${profile.header.name}
Email: ${profile.header.email}

Recent Experience:
${profile.experience.slice(0, 3).map(exp => 
  `${exp.title} at ${exp.company} (${exp.start} - ${exp.end}): ${exp.scope}\nKey achievements: ${exp.top_achievements.join('; ')}`
).join('\n\n')}

Key Skills: ${profile.skills.hard_skills.slice(0, 8).join(', ')}

Notable Projects:
${profile.projects.slice(0, 2).map(proj => 
  `${proj.name}: ${proj.scope} (${proj.role})`
).join('\n')}

Create a compelling cover letter that maps the candidate's experience to this specific role.`;

  try {
    const response = await openai.chat.completions.create({
      model: AI_MODELS.GPT_4O,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt }
      ],
      temperature: 0.4
    });

    const content = response.choices[0]?.message?.content;
    if (!content) {
      throw new Error('No response from AI');
    }

    // Extract JSON from the response (might be wrapped in markdown or text)
    let jsonContent = content;
    const jsonMatch = content.match(/```(?:json)?\s*(\{[\s\S]*?\})\s*```/);
    if (jsonMatch) {
      jsonContent = jsonMatch[1];
    } else if (content.includes('{') && content.includes('}')) {
      const startIndex = content.indexOf('{');
      const lastIndex = content.lastIndexOf('}');
      jsonContent = content.substring(startIndex, lastIndex + 1);
    }

    // Clean up potential control characters and fix common JSON issues
    jsonContent = jsonContent
      .replace(/[\u0000-\u001F\u007F-\u009F]/g, '') // Remove control characters
      .replace(/\n/g, '\\n') // Escape newlines
      .replace(/\r/g, '\\r') // Escape carriage returns
      .replace(/\t/g, '\\t') // Escape tabs
      .replace(/"/g, '"') // Fix smart quotes
      .replace(/"/g, '"') // Fix smart quotes
      .replace(/'/g, "'") // Fix smart quotes
      .replace(/'/g, "'"); // Fix smart quotes

    let parsed;
    try {
      parsed = JSON.parse(jsonContent);
    } catch (parseError) {
      console.error('JSON parsing failed for cover letter, using fallback:', parseError);
      console.error('Problematic JSON content:', jsonContent.substring(0, 200) + '...');
      
      // Fallback: return a simple cover letter based on the raw content
      const fallbackCoverLetter = `# Cover Letter

**${profile.header.name}**
${profile.header.email}
${profile.header.location}

---

Dear Hiring Manager,

I am writing to express my interest in the ${jd.role} position at ${jd.company}. With my background in ${profile.skills.hard_skills.slice(0, 3).join(', ')}, I believe I would be a valuable addition to your team.

${profile.experience[0]?.top_achievements[0] ? `In my recent role, ${profile.experience[0].top_achievements[0].toLowerCase()}.` : ''} This experience has given me strong skills in ${profile.skills.hard_skills.slice(0, 2).join(' and ')}, which align well with your requirements.

I would welcome the opportunity to discuss how my experience can contribute to ${jd.company}'s success. Thank you for your consideration.

Best regards,
${profile.header.name}`;

      return {
        content: fallbackCoverLetter,
        traceMapping: [{
          output_bullet: profile.experience[0]?.top_achievements[0] || 'Experience reference',
          source_id: profile.experience[0]?.id || 'exp_1',
          source_type: 'experience',
          confidence: 'derived'
        }]
      };
    }
    
    return {
      content: parsed.cover_letter_md || '',
      traceMapping: Array.isArray(parsed.trace_mapping) ? parsed.trace_mapping : []
    };
  } catch (error) {
    console.error('Error generating cover letter:', error);
    throw new Error('Failed to generate cover letter');
  }
}

export function optimizeForATS(content: string): string {
  // Remove problematic formatting for ATS systems
  let optimized = content;

  // Convert complex markdown to simple formatting
  optimized = optimized.replace(/\*\*\*(.*?)\*\*\*/g, '**$1**'); // Remove triple asterisks
  optimized = optimized.replace(/_{3,}/g, '---'); // Standardize horizontal rules
  
  // Ensure standard section headers
  optimized = optimized.replace(/^#+\s*(professional\s+)?summary/gim, '## PROFESSIONAL SUMMARY');
  optimized = optimized.replace(/^#+\s*(core\s+)?skills/gim, '## CORE SKILLS');
  optimized = optimized.replace(/^#+\s*(professional\s+)?experience/gim, '## PROFESSIONAL EXPERIENCE');
  optimized = optimized.replace(/^#+\s*education/gim, '## EDUCATION');
  optimized = optimized.replace(/^#+\s*projects/gim, '## PROJECTS');

  // Standardize date formatting
  optimized = optimized.replace(/\b(\w{3})\s+(\d{4})\b/g, '$1 $2');
  
  // Remove tables and convert to lists
  const lines = optimized.split('\n');
  const processedLines = lines.map(line => {
    if (line.includes('|') && line.split('|').length > 2) {
      // Convert table row to bullet point
      const cells = line.split('|').map(cell => cell.trim()).filter(cell => cell);
      return cells.length > 0 ? `• ${cells.join(' - ')}` : line;
    }
    return line;
  });

  return processedLines.join('\n');
}

export function formatForLength(content: string, targetLength: '1p' | '2p'): string {
  const lines = content.split('\n');
  const estimatedLinesPerPage = 35; // Rough estimate
  const maxLines = targetLength === '1p' ? estimatedLinesPerPage : estimatedLinesPerPage * 2;

  if (lines.length <= maxLines) {
    return content;
  }

  // Trim content intelligently
  // 1. Reduce bullet points in experience section
  // 2. Shorten descriptions
  // 3. Remove less relevant projects/experience

  let trimmed = content;
  
  // Reduce number of bullets per experience entry
  trimmed = trimmed.replace(/(## PROFESSIONAL EXPERIENCE[\s\S]*?)(?=##|$)/g, (match) => {
    return match.replace(/^([-•*]\s+.+$)/gm, (bullet, ...groups) => {
      // Keep first 2-3 bullets per role for 1-page, 3-4 for 2-page
      const maxBullets = targetLength === '1p' ? 3 : 4;
      // This is a simplified approach - would need more sophisticated logic
      return bullet;
    });
  });

  return trimmed;
}
