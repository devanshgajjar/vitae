/**
 * Non-blocking form validation utilities
 * Provides warnings and suggestions without blocking form submission
 */

export interface ValidationResult {
  isValid: boolean;
  warnings: ValidationWarning[];
  suggestions: string[];
}

export interface ValidationWarning {
  field: string;
  type: 'format' | 'length' | 'completeness' | 'recommendation';
  severity: 'low' | 'medium' | 'high';
  message: string;
}

/**
 * Email validation with non-blocking approach
 */
export function validateEmail(email: string): ValidationResult {
  const warnings: ValidationWarning[] = [];
  const suggestions: string[] = [];

  if (!email) {
    return { isValid: true, warnings, suggestions };
  }

  // Basic email format check
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    warnings.push({
      field: 'email',
      type: 'format',
      severity: 'medium',
      message: 'Email format appears invalid'
    });
    suggestions.push('Check email format (example: name@domain.com)');
  }

  // Common typos check
  const commonDomains = ['gmail.com', 'yahoo.com', 'hotmail.com', 'outlook.com', 'icloud.com'];
  const domain = email.split('@')[1]?.toLowerCase();
  
  if (domain) {
    const similarDomain = commonDomains.find(d => {
      // Check for common typos
      const distance = levenshteinDistance(domain, d);
      return distance === 1 && domain.length > 3;
    });

    if (similarDomain) {
      warnings.push({
        field: 'email',
        type: 'format',
        severity: 'low',
        message: `Did you mean ${email.split('@')[0]}@${similarDomain}?`
      });
    }
  }

  return { isValid: true, warnings, suggestions };
}

/**
 * Phone number validation
 */
export function validatePhone(phone: string): ValidationResult {
  const warnings: ValidationWarning[] = [];
  const suggestions: string[] = [];

  if (!phone) {
    return { isValid: true, warnings, suggestions };
  }

  // Remove all non-digit characters for analysis
  const digitsOnly = phone.replace(/\D/g, '');

  // Check length
  if (digitsOnly.length < 10) {
    warnings.push({
      field: 'phone',
      type: 'format',
      severity: 'medium',
      message: 'Phone number seems too short'
    });
    suggestions.push('Include area code (e.g., +1 555-123-4567)');
  } else if (digitsOnly.length > 15) {
    warnings.push({
      field: 'phone',
      type: 'format',
      severity: 'low',
      message: 'Phone number seems unusually long'
    });
  }

  // Suggest formatting if no formatting detected
  if (phone === digitsOnly && digitsOnly.length >= 10) {
    suggestions.push('Consider formatting: +1 (555) 123-4567');
  }

  return { isValid: true, warnings, suggestions };
}

/**
 * URL validation
 */
export function validateUrl(url: string): ValidationResult {
  const warnings: ValidationWarning[] = [];
  const suggestions: string[] = [];

  if (!url) {
    return { isValid: true, warnings, suggestions };
  }

  try {
    new URL(url);
  } catch {
    // Try with https:// prefix
    try {
      new URL(`https://${url}`);
      warnings.push({
        field: 'url',
        type: 'format',
        severity: 'low',
        message: 'URL missing protocol'
      });
      suggestions.push(`Try: https://${url}`);
    } catch {
      warnings.push({
        field: 'url',
        type: 'format',
        severity: 'medium',
        message: 'URL format appears invalid'
      });
      suggestions.push('Include protocol (https://) and check spelling');
    }
  }

  return { isValid: true, warnings, suggestions };
}

/**
 * Name validation
 */
export function validateName(name: string): ValidationResult {
  const warnings: ValidationWarning[] = [];
  const suggestions: string[] = [];

  if (!name.trim()) {
    warnings.push({
      field: 'name',
      type: 'completeness',
      severity: 'high',
      message: 'Name is required for professional documents'
    });
    return { isValid: true, warnings, suggestions };
  }

  // Check for common issues
  if (name.length < 2) {
    warnings.push({
      field: 'name',
      type: 'length',
      severity: 'medium',
      message: 'Name seems too short'
    });
  }

  // Check for all caps
  if (name === name.toUpperCase() && name.length > 3) {
    warnings.push({
      field: 'name',
      type: 'format',
      severity: 'low',
      message: 'Consider using proper capitalization'
    });
    suggestions.push('Use title case (e.g., John Smith)');
  }

  // Check for all lowercase
  if (name === name.toLowerCase() && name.length > 3) {
    warnings.push({
      field: 'name',
      type: 'format',
      severity: 'low',
      message: 'Consider capitalizing first letters'
    });
    suggestions.push('Use title case (e.g., John Smith)');
  }

  return { isValid: true, warnings, suggestions };
}

/**
 * Text content validation (for descriptions, achievements, etc.)
 */
export function validateTextContent(text: string, options: {
  field: string;
  minLength?: number;
  maxLength?: number;
  recommendedLength?: { min: number; max: number };
}): ValidationResult {
  const warnings: ValidationWarning[] = [];
  const suggestions: string[] = [];

  if (!text.trim()) {
    return { isValid: true, warnings, suggestions };
  }

  const { field, minLength, maxLength, recommendedLength } = options;

  // Length checks
  if (minLength && text.length < minLength) {
    warnings.push({
      field,
      type: 'length',
      severity: 'medium',
      message: `${field} is quite short`
    });
    suggestions.push(`Consider adding more detail (current: ${text.length}, recommended: ${minLength}+ characters)`);
  }

  if (maxLength && text.length > maxLength) {
    warnings.push({
      field,
      type: 'length',
      severity: 'medium',
      message: `${field} might be too long for ATS systems`
    });
    suggestions.push(`Consider shortening (current: ${text.length}, recommended: ${maxLength} characters max)`);
  }

  if (recommendedLength) {
    if (text.length < recommendedLength.min) {
      suggestions.push(`Consider expanding to ${recommendedLength.min}-${recommendedLength.max} characters for optimal ATS parsing`);
    } else if (text.length > recommendedLength.max) {
      suggestions.push(`Consider condensing to ${recommendedLength.min}-${recommendedLength.max} characters for better readability`);
    }
  }

  // Content quality checks
  const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0);
  
  // Check for very long sentences
  const longSentences = sentences.filter(s => s.length > 100);
  if (longSentences.length > 0) {
    warnings.push({
      field,
      type: 'format',
      severity: 'low',
      message: 'Some sentences are quite long'
    });
    suggestions.push('Consider breaking long sentences for better readability');
  }

  // Check for repetitive words
  const words = text.toLowerCase().split(/\s+/);
  const wordCount = words.reduce((acc, word) => {
    acc[word] = (acc[word] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const repetitiveWords = Object.entries(wordCount)
    .filter(([word, count]) => count > 3 && word.length > 3)
    .map(([word]) => word);

  if (repetitiveWords.length > 0) {
    warnings.push({
      field,
      type: 'recommendation',
      severity: 'low',
      message: 'Some words are used frequently'
    });
    suggestions.push(`Consider varying language. Repeated words: ${repetitiveWords.join(', ')}`);
  }

  return { isValid: true, warnings, suggestions };
}

/**
 * Date validation for experience/education
 */
export function validateDate(date: string, field: string): ValidationResult {
  const warnings: ValidationWarning[] = [];
  const suggestions: string[] = [];

  if (!date.trim()) {
    return { isValid: true, warnings, suggestions };
  }

  // Check common date formats
  const formats = [
    /^(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)\s+\d{4}$/i, // "Jan 2020"
    /^\d{1,2}\/\d{4}$/,  // "1/2020"
    /^\d{4}$/,           // "2020"
    /^present$/i,        // "present"
    /^current$/i         // "current"
  ];

  const isValidFormat = formats.some(format => format.test(date.trim()));

  if (!isValidFormat) {
    warnings.push({
      field,
      type: 'format',
      severity: 'low',
      message: 'Date format not recognized'
    });
    suggestions.push('Use format like "Jan 2020", "1/2020", or "present"');
  }

  // Check for future dates (except "present")
  if (!['present', 'current'].includes(date.toLowerCase())) {
    const year = extractYear(date);
    const currentYear = new Date().getFullYear();
    
    if (year && year > currentYear + 1) {
      warnings.push({
        field,
        type: 'format',
        severity: 'medium',
        message: 'Date appears to be in the future'
      });
    }

    if (year && year < 1950) {
      warnings.push({
        field,
        type: 'format',
        severity: 'low',
        message: 'Date appears unusually old'
      });
    }
  }

  return { isValid: true, warnings, suggestions };
}

/**
 * Skills validation
 */
export function validateSkills(skills: string[], type: 'hard' | 'soft'): ValidationResult {
  const warnings: ValidationWarning[] = [];
  const suggestions: string[] = [];

  if (skills.length === 0) {
    warnings.push({
      field: `${type}_skills`,
      type: 'completeness',
      severity: 'high',
      message: `Add ${type} skills to improve ATS matching`
    });
    return { isValid: true, warnings, suggestions };
  }

  const maxSkills = type === 'hard' ? 12 : 6;
  const recommendedMin = type === 'hard' ? 6 : 3;

  if (skills.length < recommendedMin) {
    suggestions.push(`Consider adding more ${type} skills (recommended: ${recommendedMin}+ skills)`);
  }

  if (skills.length > maxSkills) {
    warnings.push({
      field: `${type}_skills`,
      type: 'length',
      severity: 'medium',
      message: `Too many ${type} skills might clutter your resume`
    });
    suggestions.push(`Consider keeping to ${maxSkills} most relevant skills`);
  }

  // Check for very short skill names
  const shortSkills = skills.filter(skill => skill.length < 3);
  if (shortSkills.length > 0) {
    warnings.push({
      field: `${type}_skills`,
      type: 'format',
      severity: 'low',
      message: 'Some skills are very short'
    });
    suggestions.push(`Expand abbreviations: ${shortSkills.join(', ')}`);
  }

  return { isValid: true, warnings, suggestions };
}

// Helper functions
function levenshteinDistance(str1: string, str2: string): number {
  const matrix = [];
  
  for (let i = 0; i <= str2.length; i++) {
    matrix[i] = [i];
  }
  
  for (let j = 0; j <= str1.length; j++) {
    matrix[0][j] = j;
  }
  
  for (let i = 1; i <= str2.length; i++) {
    for (let j = 1; j <= str1.length; j++) {
      if (str2.charAt(i - 1) === str1.charAt(j - 1)) {
        matrix[i][j] = matrix[i - 1][j - 1];
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1,
          matrix[i][j - 1] + 1,
          matrix[i - 1][j] + 1
        );
      }
    }
  }
  
  return matrix[str2.length][str1.length];
}

function extractYear(dateString: string): number | null {
  const yearMatch = dateString.match(/\d{4}/);
  return yearMatch ? parseInt(yearMatch[0], 10) : null;
}
