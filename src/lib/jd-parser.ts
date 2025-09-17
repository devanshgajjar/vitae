import { openai, AI_MODELS } from './ai-client';
import { JobDescription } from '@/types';
import crypto from 'crypto';

export function hashJobDescription(jdText: string): string {
  return crypto.createHash('sha256').update(jdText.trim()).digest('hex');
}

export async function parseJobDescription(jobDescriptionText: string): Promise<JobDescription> {
  // If no OpenAI API key, return mock data for testing
  if (!openai) {
    console.log('Using mock JD parser (no OpenAI API key)');
    return {
      must_haves: ['3+ years experience', 'React', 'TypeScript', 'JavaScript'],
      nice_to_haves: ['Next.js', 'Node.js', 'GraphQL', 'AWS'],
      responsibilities: ['Build user interfaces', 'Collaborate with team', 'Write clean code'],
      keywords: ['frontend', 'react', 'typescript', 'javascript', 'ui', 'responsive'],
      company: 'Tech Company',
      role: 'Frontend Developer',
      seniority: 'mid',
      location: 'Remote',
      raw_text: jobDescriptionText
    };
  }

  const systemPrompt = `You are an expert job description parser. Extract structured information from job postings.

Return a JSON object with these exact fields:
- must_haves: Array of required skills, experience, or qualifications
- nice_to_haves: Array of preferred/bonus skills or qualifications  
- responsibilities: Array of key job responsibilities/duties
- keywords: Array of important keywords for ATS optimization
- company: Company name (if mentioned)
- role: Job title/role name
- seniority: Seniority level (entry, mid, senior, staff, principal, etc.) if determinable
- location: Location if mentioned

Be precise and factual. Extract only what's explicitly stated. For must_haves vs nice_to_haves, look for language like "required vs preferred", "must have vs nice to have", etc.`;

  const userPrompt = `Parse this job description and return the structured JSON:

${jobDescriptionText}`;

  try {
    const response = await openai.chat.completions.create({
      model: AI_MODELS.GPT_4O,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt }
      ],
      temperature: 0.1
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

    const parsed = JSON.parse(jsonContent);
    
    // Validate and normalize the response
    const jd: JobDescription = {
      must_haves: Array.isArray(parsed.must_haves) ? parsed.must_haves : [],
      nice_to_haves: Array.isArray(parsed.nice_to_haves) ? parsed.nice_to_haves : [],
      responsibilities: Array.isArray(parsed.responsibilities) ? parsed.responsibilities : [],
      keywords: Array.isArray(parsed.keywords) ? parsed.keywords : [],
      company: parsed.company || '',
      role: parsed.role || '',
      seniority: parsed.seniority || undefined,
      location: parsed.location || undefined,
      raw_text: jobDescriptionText
    };

    return jd;
  } catch (error) {
    console.error('Error parsing job description:', error);
    throw new Error('Failed to parse job description');
  }
}

export function extractKeyMetrics(jdText: string): {
  experienceYears?: number;
  teamSize?: number;
  budgetRange?: string;
  travelPercentage?: number;
} {
  const metrics: any = {};
  
  // Extract years of experience
  const expMatch = jdText.match(/(\d+)\+?\s*years?\s+(?:of\s+)?experience/i);
  if (expMatch) {
    metrics.experienceYears = parseInt(expMatch[1]);
  }

  // Extract team size
  const teamMatch = jdText.match(/(?:team\s+of\s+|leading\s+|managing\s+)(\d+)/i);
  if (teamMatch) {
    metrics.teamSize = parseInt(teamMatch[1]);
  }

  // Extract travel percentage
  const travelMatch = jdText.match(/(\d+)%\s+travel/i);
  if (travelMatch) {
    metrics.travelPercentage = parseInt(travelMatch[1]);
  }

  // Extract budget mentions
  const budgetMatch = jdText.match(/budget.*\$[\d,]+[kmb]?/i);
  if (budgetMatch) {
    metrics.budgetRange = budgetMatch[0];
  }

  return metrics;
}
