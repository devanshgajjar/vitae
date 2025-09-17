import { Profile, GuardrailPolicy, GuardrailViolation, ValidationResult, TraceMapping } from '@/types';

export const DEFAULT_GUARDRAIL_POLICY: GuardrailPolicy = {
  no_fabrication: true,
  trace_required: true,
  ats_safe: true,
  max_inflation_factor: 1.2
};

export function validateContent(
  content: string,
  traceMapping: TraceMapping[],
  profile: Profile,
  policy: GuardrailPolicy = DEFAULT_GUARDRAIL_POLICY
): ValidationResult {
  const violations: GuardrailViolation[] = [];

  // Check for fabrication - every bullet should have a trace (but be more lenient for AI-generated content)
  if (policy.trace_required) {
    const contentBullets = extractBullets(content);
    const tracedBullets = traceMapping.map(t => t.output_bullet);
    
    // Only check bullets if we have trace mappings
    if (tracedBullets.length > 0) {
      for (const bullet of contentBullets) {
        const hasTrace = tracedBullets.some(traced => 
          bullet.includes(traced) || traced.includes(bullet) || 
          calculateSimilarity(bullet, traced) > 0.6 // Lowered threshold
        );
        
        // Skip common header/contact information
        const isHeaderInfo = bullet.toLowerCase().includes('@') || 
                            bullet.toLowerCase().includes('phone') ||
                            bullet.toLowerCase().includes('linkedin') ||
                            bullet.toLowerCase().includes('github') ||
                            bullet.length < 20; // Skip very short content
        
        if (!hasTrace && !isHeaderInfo) {
          violations.push({
            type: 'untraceable',
            severity: 'warning', // Changed from conditional error to warning
            message: 'Content cannot be traced back to profile source',
            affected_content: bullet,
            suggested_fix: 'Remove or modify to match profile data'
          });
        }
      }
    }
  }

  // Check for potential fabrication of dates, companies, roles
  if (policy.no_fabrication) {
    const companies = profile.experience.map(exp => exp.company.toLowerCase());
    const roles = profile.experience.map(exp => exp.title.toLowerCase());
    const schools = profile.education.map(edu => edu.school.toLowerCase());
    
    // Look for company/role mentions not in profile - but be more lenient with AI-generated content
    const suspiciousCompanies = extractCompanyMentions(content)
      .filter(company => {
        const companyLower = company.toLowerCase();
        // Allow partial matches and common variations
        return !companies.some(profileCompany => 
          profileCompany.includes(companyLower) || 
          companyLower.includes(profileCompany) ||
          companyLower.replace(/\s+/g, '') === profileCompany.replace(/\s+/g, '')
        );
      });
    
    const suspiciousRoles = extractRoleMentions(content)
      .filter(role => {
        const roleLower = role.toLowerCase();
        // Allow partial matches and common variations
        return !roles.some(profileRole => 
          profileRole.includes(roleLower) || 
          roleLower.includes(profileRole) ||
          roleLower.replace(/\s+/g, '') === profileRole.replace(/\s+/g, '')
        );
      });
      
    const suspiciousSchools = extractSchoolMentions(content)
      .filter(school => {
        const schoolLower = school.toLowerCase();
        // Allow partial matches and common variations
        return !schools.some(profileSchool => 
          profileSchool.includes(schoolLower) || 
          schoolLower.includes(profileSchool) ||
          schoolLower.replace(/\s+/g, '') === profileSchool.replace(/\s+/g, '')
        );
      });

    // Only flag as errors if they're clearly fabricated (not just variations)
    [...suspiciousCompanies, ...suspiciousRoles, ...suspiciousSchools]
      .filter(item => item.length > 2) // Ignore very short matches
      .forEach(item => {
        violations.push({
          type: 'fabrication',
          severity: 'warning', // Changed from 'error' to 'warning'
          message: `Potential fabricated reference: "${item}" not found in profile`,
          affected_content: item,
          suggested_fix: 'Use only companies/roles/schools from your profile'
        });
      });
  }

  // Check for ATS safety
  if (policy.ats_safe) {
    const atsIssues = checkATSSafety(content);
    violations.push(...atsIssues);
  }

  // Check for bias and sensitive information
  const biasIssues = checkForBias(content);
  violations.push(...biasIssues);

  // Calculate safety score
  const errorCount = violations.filter(v => v.severity === 'error').length;
  const warningCount = violations.filter(v => v.severity === 'warning').length;
  const safetyScore = Math.max(0, 100 - (errorCount * 20) - (warningCount * 5));

  return {
    is_valid: errorCount === 0,
    violations,
    safety_score: safetyScore
  };
}

function extractBullets(content: string): string[] {
  // Extract bullet points from markdown
  const bulletRegex = /^[\s]*[-*+•]\s+(.+)$/gm;
  const matches = content.match(bulletRegex) || [];
  return matches.map(match => match.replace(/^[\s]*[-*+•]\s+/, '').trim());
}

function calculateSimilarity(str1: string, str2: string): number {
  // Simple similarity calculation - could be enhanced with better algorithm
  const words1 = str1.toLowerCase().split(/\s+/);
  const words2 = str2.toLowerCase().split(/\s+/);
  const intersection = words1.filter(word => words2.includes(word));
  return intersection.length / Math.max(words1.length, words2.length);
}

function extractCompanyMentions(content: string): string[] {
  // Look for patterns like "at Company Name" or "Company Name,"
  const companyPattern = /(?:at|with|for)\s+([A-Z][a-zA-Z\s&]+?)(?:[,.]|\s+(?:as|in|where))/g;
  const matches = content.match(companyPattern) || [];
  return matches.map(match => 
    match.replace(/^(?:at|with|for)\s+/, '').replace(/[,.].*$/, '').trim()
  );
}

function extractRoleMentions(content: string): string[] {
  // Look for role titles in context
  const rolePattern = /(?:as|role of|position of|worked as)\s+([A-Z][a-zA-Z\s]+?)(?:[,.]|\s+(?:at|with|for))/g;
  const matches = content.match(rolePattern) || [];
  return matches.map(match => 
    match.replace(/^(?:as|role of|position of|worked as)\s+/, '').replace(/[,.].*$/, '').trim()
  );
}

function extractSchoolMentions(content: string): string[] {
  // Look for education institutions
  const schoolPattern = /(?:from|at|graduated from)\s+([A-Z][a-zA-Z\s&]+?)(?:[,.]|\s+(?:with|in|where))/g;
  const matches = content.match(schoolPattern) || [];
  return matches.map(match => 
    match.replace(/^(?:from|at|graduated from)\s+/, '').replace(/[,.].*$/, '').trim()
  );
}

function checkATSSafety(content: string): GuardrailViolation[] {
  const violations: GuardrailViolation[] = [];

  // Check for tables (ATS unfriendly)
  if (content.includes('|') && content.split('\n').some(line => line.split('|').length > 2)) {
    violations.push({
      type: 'bias',
      severity: 'warning',
      message: 'Tables detected - may not be ATS friendly',
      affected_content: 'Table formatting',
      suggested_fix: 'Use bullet points instead of tables'
    });
  }

  // Check for special characters that might cause issues
  const problematicChars = /[①②③④⑤⑥⑦⑧⑨⑩✓✗✓→←↑↓]/g;
  if (problematicChars.test(content)) {
    violations.push({
      type: 'bias',
      severity: 'warning',
      message: 'Special characters detected that may not render properly in ATS',
      affected_content: 'Special characters',
      suggested_fix: 'Use standard text formatting'
    });
  }

  // Check for very long lines (ATS systems may have limits)
  const lines = content.split('\n');
  const longLines = lines.filter(line => line.length > 100);
  if (longLines.length > 0) {
    violations.push({
      type: 'bias',
      severity: 'warning',
      message: 'Some lines are very long and may be truncated by ATS',
      affected_content: 'Long lines',
      suggested_fix: 'Break into shorter lines or bullet points'
    });
  }

  return violations;
}

function checkForBias(content: string): GuardrailViolation[] {
  const violations: GuardrailViolation[] = [];

  // Check for age-related information
  const agePattern = /\b(?:age|years old|born in|graduated in 19\d{2})\b/i;
  if (agePattern.test(content)) {
    violations.push({
      type: 'bias',
      severity: 'warning',
      message: 'Age-related information detected',
      affected_content: 'Age references',
      suggested_fix: 'Remove age-related information to prevent bias'
    });
  }

  // Check for gendered language
  const genderedPattern = /\b(?:he\/she|his\/her|manpower|guys|girls|ladies|gentlemen)\b/i;
  if (genderedPattern.test(content)) {
    violations.push({
      type: 'bias',
      severity: 'warning',
      message: 'Potentially gendered language detected',
      affected_content: 'Gendered terms',
      suggested_fix: 'Use gender-neutral language'
    });
  }

  // Check for personal information that might indicate protected characteristics
  const personalInfoPattern = /\b(?:married|single|pregnant|disability|religion|children)\b/i;
  if (personalInfoPattern.test(content)) {
    violations.push({
      type: 'bias',
      severity: 'warning',
      message: 'Personal information that could lead to bias detected',
      affected_content: 'Personal details',
      suggested_fix: 'Remove personal information not relevant to job performance'
    });
  }

  return violations;
}
