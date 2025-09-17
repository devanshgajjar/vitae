import { openai, AI_MODELS } from './ai-client';
import { Profile, JobDescription, FitAnalysis } from '@/types';

export async function analyzeFit(profile: Profile, jd: JobDescription): Promise<FitAnalysis> {
  // If no OpenAI API key, return mock analysis
  if (!openai) {
    console.log('Using mock fit analysis (no OpenAI API key)');
    
    // Calculate basic skill matches
    const profileSkills = [
      ...profile.skills.hard_skills,
      ...profile.skills.soft_skills,
      ...profile.experience.flatMap(exp => exp.tools)
    ].map(skill => skill.toLowerCase());

    const skillMatches = jd.must_haves.map(requirement => {
      const reqLower = requirement.toLowerCase();
      const hasExact = profileSkills.some(skill => skill === reqLower);
      const hasRelated = profileSkills.some(skill => 
        skill.includes(reqLower) || reqLower.includes(skill)
      );
      
      return {
        skill: requirement,
        status: hasExact ? 'exact' as const : hasRelated ? 'related' as const : 'missing' as const,
        confidence: hasExact ? 0.9 : hasRelated ? 0.7 : 0.0
      };
    });

    const exactMatches = skillMatches.filter(m => m.status === 'exact').length;
    const relatedMatches = skillMatches.filter(m => m.status === 'related').length;
    const overallScore = Math.round(
      ((exactMatches * 100) + (relatedMatches * 60)) / jd.must_haves.length
    );

    const gaps = skillMatches
      .filter(m => m.status === 'missing')
      .map(m => m.skill);

    return {
      overall_score: Math.min(100, overallScore),
      skill_matches: skillMatches,
      gaps,
      red_flags: [],
      recommendations: gaps.length > 0 ? [
        'Consider highlighting transferable skills',
        'Look for online courses to fill skill gaps'
      ] : ['Strong match - proceed with application']
    };
  }

  const systemPrompt = `You are an expert career counselor analyzing job fit. Compare a candidate's profile against job requirements.

Return a JSON object with these exact fields:
- overall_score: Number 0-100 representing overall fit
- skill_matches: Array of objects with {skill, status: "exact"|"related"|"missing", confidence: 0-1}
- gaps: Array of strings listing missing critical requirements
- red_flags: Array of strings noting potential issues (visa, location, clearance, etc.)
- recommendations: Array of strings with actionable advice

Be honest and constructive. Focus on factual matching, not speculation.`;

  const userPrompt = `Analyze fit between this profile and job:

PROFILE:
Name: ${profile.header.name}
Experience:
${profile.experience.map(exp => 
  `- ${exp.title} at ${exp.company} (${exp.start} - ${exp.end})\n  ${exp.scope}\n  Achievements: ${exp.top_achievements.join('; ')}\n  Tools: ${exp.tools.join(', ')}`
).join('\n')}

Skills:
Hard: ${profile.skills.hard_skills.join(', ')}
Soft: ${profile.skills.soft_skills.join(', ')}

Education:
${profile.education.map(edu => 
  `- ${edu.degree} from ${edu.school} (${edu.year})`
).join('\n')}

Projects:
${profile.projects.map(proj => 
  `- ${proj.name}: ${proj.scope} (${proj.role})`
).join('\n')}

JOB REQUIREMENTS:
Company: ${jd.company}
Role: ${jd.role}
Must-haves: ${jd.must_haves.join(', ')}
Nice-to-haves: ${jd.nice_to_haves.join(', ')}
Responsibilities: ${jd.responsibilities.join('; ')}

Analyze the fit and return structured JSON.`;

  try {
    const response = await openai.chat.completions.create({
      model: AI_MODELS.GPT_4O,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt }
      ],
      temperature: 0.2
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
    const fitAnalysis: FitAnalysis = {
      overall_score: Math.max(0, Math.min(100, parsed.overall_score || 0)),
      skill_matches: Array.isArray(parsed.skill_matches) ? parsed.skill_matches.map((match: any) => ({
        skill: match.skill || '',
        status: ['exact', 'related', 'missing'].includes(match.status) ? match.status : 'missing',
        confidence: Math.max(0, Math.min(1, match.confidence || 0))
      })) : [],
      gaps: Array.isArray(parsed.gaps) ? parsed.gaps : [],
      red_flags: Array.isArray(parsed.red_flags) ? parsed.red_flags : [],
      recommendations: Array.isArray(parsed.recommendations) ? parsed.recommendations : []
    };

    return fitAnalysis;
  } catch (error) {
    console.error('Error analyzing fit:', error);
    throw new Error('Failed to analyze job fit');
  }
}

export function calculateSkillGaps(profile: Profile, jd: JobDescription): string[] {
  const profileSkills = [
    ...profile.skills.hard_skills,
    ...profile.skills.soft_skills,
    ...profile.experience.flatMap(exp => exp.tools)
  ].map(skill => skill.toLowerCase());

  const requiredSkills = jd.must_haves.map(skill => skill.toLowerCase());
  
  const gaps = requiredSkills.filter(required => 
    !profileSkills.some(profileSkill => 
      profileSkill.includes(required) || required.includes(profileSkill)
    )
  );

  return gaps;
}

export function identifyRedFlags(profile: Profile, jd: JobDescription): string[] {
  const flags: string[] = [];
  
  // Location mismatch
  if (jd.location && profile.header.location) {
    const profileLocation = profile.header.location.toLowerCase();
    const jobLocation = jd.location.toLowerCase();
    if (!profileLocation.includes(jobLocation) && !jobLocation.includes('remote')) {
      flags.push(`Location mismatch: Profile shows ${profile.header.location}, job requires ${jd.location}`);
    }
  }

  // Visa/authorization mentions
  if (jd.raw_text.toLowerCase().includes('authorized to work') || 
      jd.raw_text.toLowerCase().includes('visa sponsorship')) {
    flags.push('May require work authorization verification');
  }

  // Security clearance
  if (jd.raw_text.toLowerCase().includes('security clearance') || 
      jd.raw_text.toLowerCase().includes('classified')) {
    flags.push('Requires security clearance');
  }

  // Travel requirements
  const travelMatch = jd.raw_text.match(/(\d+)%\s+travel/i);
  if (travelMatch && parseInt(travelMatch[1]) > 25) {
    flags.push(`High travel requirement: ${travelMatch[0]}`);
  }

  return flags;
}
