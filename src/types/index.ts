// Core data types for the AI Resume & Cover Letter Generator

export interface UserHeader {
  name: string;
  email: string;
  phone?: string;
  location: string; // "City, Country"
  links: string[]; // LinkedIn, portfolio, GitHub, etc.
}

export interface Experience {
  id: string;
  title: string;
  company: string;
  start: string; // "MMM YYYY"
  end: string | 'present'; // "MMM YYYY" or "present"
  scope: string; // 1-2 line description
  top_achievements: string[]; // <=3 bullet points
  tools: string[]; // <=6 tools/technologies
}

export interface Education {
  id: string;
  degree: string;
  school: string;
  year: string; // "YYYY" or "MMM YYYY"
  highlights: string[]; // <=2 highlights
}

export interface Skills {
  hard_skills: string[]; // <=12 technical skills
  soft_skills: string[]; // <=6 soft skills
}

export interface Project {
  id: string;
  name: string;
  role: string;
  scope: string; // 1-2 line description
  top_achievements: string[]; // <=3 bullet points
  tools: string[]; // <=6 tools/technologies
  url?: string; // Optional project URL
}

export interface Evidence {
  id: string;
  type: 'proof_link' | 'reference' | 'certification' | 'other';
  title: string;
  url?: string;
  description: string;
  linked_to: string[]; // IDs of experiences/projects this validates
}

export interface Profile {
  id: string;
  user_id: string;
  header: UserHeader;
  experience: Experience[];
  education: Education[];
  skills: Skills;
  projects: Project[];
  evidence: Evidence[];
  created_at: Date;
  updated_at: Date;
}

// Job Description related types
export interface JobDescription {
  must_haves: string[];
  nice_to_haves: string[];
  responsibilities: string[];
  keywords: string[];
  company: string;
  role: string;
  seniority?: string;
  location?: string;
  raw_text: string;
}

export interface FitAnalysis {
  overall_score: number; // 0-100
  skill_matches: {
    skill: string;
    status: 'exact' | 'related' | 'missing';
    confidence: number;
  }[];
  gaps: string[];
  red_flags: string[];
  recommendations: string[];
}

// Document generation types
export type DocumentKind = 'resume' | 'cover_letter' | 'linkedin_summary';

export interface GenerationOptions {
  resume_style: 'reverse_chronological' | 'hybrid' | 'functional';
  length: '1p' | '2p';
  tone: 'factual' | 'impact_forward' | 'concise' | 'narrative';
  include_summary: boolean;
  ats_safe: boolean;
}

export interface TraceMapping {
  output_bullet: string;
  source_id: string;
  source_type: 'experience' | 'project' | 'education' | 'evidence';
  confidence: 'verified' | 'derived' | 'unverifiable';
}

export interface GeneratedDocument {
  id: string;
  user_id: string;
  profile_id: string;
  kind: DocumentKind;
  jd_hash: string;
  content_md: string; // Markdown content
  trace_mapping: TraceMapping[];
  options: GenerationOptions;
  fit_analysis: FitAnalysis;
  created_at: Date;
  updated_at: Date;
}

export interface DocumentVersion {
  id: string;
  document_id: string;
  version_number: number;
  content_md: string;
  changes_summary: string;
  created_at: Date;
}

// API request/response types
export interface ParseJDRequest {
  job_description: string;
}

export interface ParseJDResponse {
  jd: JobDescription;
  fit_analysis?: FitAnalysis; // If profile_id provided
}

export interface GenerateRequest {
  profile_id: string;
  job_description: JobDescription;
  options: GenerationOptions;
}

export interface GenerateResponse {
  resume_md: string;
  cover_letter_md: string;
  trace_mapping: TraceMapping[];
  fit_analysis: FitAnalysis;
  document_id: string;
}

export interface ExportRequest {
  document_id: string;
  format: 'pdf' | 'docx' | 'md';
  theme?: string;
}

// Guardrail and validation types
export interface GuardrailPolicy {
  no_fabrication: boolean;
  trace_required: boolean;
  ats_safe: boolean;
  max_inflation_factor: number; // e.g., 1.2 for 20% inflation max
}

export interface GuardrailViolation {
  type: 'fabrication' | 'inflation' | 'untraceable' | 'bias';
  severity: 'error' | 'warning';
  message: string;
  suggested_fix?: string;
  affected_content: string;
}

export interface ValidationResult {
  is_valid: boolean;
  violations: GuardrailViolation[];
  safety_score: number; // 0-100
}

// UI state types
export interface UIState {
  current_step: 'onboarding' | 'dashboard' | 'jd_workspace' | 'export';
  active_profile_id?: string;
  active_document_id?: string;
  sidebar_open: boolean;
  theme: 'light' | 'dark' | 'system';
}

// Form validation schemas (for Zod)
export interface ProfileFormData {
  header: UserHeader;
  experience: Omit<Experience, 'id'>[];
  education: Omit<Education, 'id'>[];
  skills: Skills;
  projects: Omit<Project, 'id'>[];
  evidence: Omit<Evidence, 'id'>[];
}

// Import/export types
export interface ImportSource {
  type: 'linkedin' | 'resume_pdf' | 'manual';
  data: Record<string, unknown>; // Platform-specific data
}

export interface ExportTheme {
  name: string;
  fonts: {
    primary: string;
    secondary: string;
  };
  colors: {
    primary: string;
    secondary: string;
    text: string;
  };
  spacing: {
    margin: string;
    line_height: number;
  };
  ats_compliant: boolean;
}
