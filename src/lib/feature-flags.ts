/**
 * Feature flags for controlling MVP scope
 */

export const FEATURE_FLAGS = {
  // Import features - disabled for MVP
  enableLinkedInImport: false,
  enableResumeImport: false,
  
  // Core features - enabled for MVP
  enableManualEntry: true,
  enableAIRewriting: true,
  enableSkillsLibrary: true,
  enableJDTargeting: true,
  enableExport: true,
  
  // Future features - disabled for MVP
  enableMultiLanguage: false,
  enableCollaborativeEditing: false,
  enableAdvancedTemplates: false,
} as const;

export type FeatureFlag = keyof typeof FEATURE_FLAGS;

/**
 * Check if a feature is enabled
 */
export function isFeatureEnabled(flag: FeatureFlag): boolean {
  return FEATURE_FLAGS[flag];
}

/**
 * Get all enabled features
 */
export function getEnabledFeatures(): Partial<typeof FEATURE_FLAGS> {
  return Object.entries(FEATURE_FLAGS)
    .filter(([_, enabled]) => enabled)
    .reduce((acc, [key, value]) => {
      acc[key as FeatureFlag] = value;
      return acc;
    }, {} as Partial<typeof FEATURE_FLAGS>);
}
