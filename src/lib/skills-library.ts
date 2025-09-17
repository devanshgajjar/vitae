/**
 * Comprehensive skills library with categorization and synonyms
 */

export interface Skill {
  name: string;
  category: string;
  synonyms: string[];
  relatedSkills: string[];
}

export interface SkillCategory {
  name: string;
  skills: string[];
}

// Hard Skills Categories
export const HARD_SKILL_CATEGORIES: SkillCategory[] = [
  {
    name: "Programming Languages",
    skills: [
      "JavaScript", "TypeScript", "Python", "Java", "C#", "C++", "C", "Go", "Rust", "Ruby", 
      "PHP", "Swift", "Kotlin", "Dart", "Scala", "R", "MATLAB", "Perl", "Bash", "PowerShell"
    ]
  },
  {
    name: "Frontend Development",
    skills: [
      "React", "Vue.js", "Angular", "Next.js", "Nuxt.js", "Svelte", "HTML", "CSS", "SASS", "SCSS",
      "Tailwind CSS", "Bootstrap", "Material-UI", "Ant Design", "Chakra UI", "Styled Components",
      "Webpack", "Vite", "Parcel", "Rollup", "Babel"
    ]
  },
  {
    name: "Backend Development",
    skills: [
      "Node.js", "Express.js", "Django", "Flask", "FastAPI", "Spring Boot", "ASP.NET", "Ruby on Rails",
      "Laravel", "Symfony", "NestJS", "Koa.js", "Hapi.js", "Gin", "Echo", "Fiber"
    ]
  },
  {
    name: "Databases",
    skills: [
      "PostgreSQL", "MySQL", "MongoDB", "Redis", "Elasticsearch", "SQLite", "Oracle", "SQL Server",
      "DynamoDB", "Cassandra", "CouchDB", "Neo4j", "InfluxDB", "TimescaleDB", "Prisma", "TypeORM",
      "Sequelize", "Mongoose", "Knex.js"
    ]
  },
  {
    name: "Cloud & DevOps",
    skills: [
      "AWS", "Azure", "Google Cloud", "Docker", "Kubernetes", "Jenkins", "GitLab CI", "GitHub Actions",
      "CircleCI", "Travis CI", "Terraform", "Ansible", "Chef", "Puppet", "Nginx", "Apache",
      "Load Balancing", "CDN", "Microservices", "Serverless"
    ]
  },
  {
    name: "Data & Analytics",
    skills: [
      "SQL", "NoSQL", "Data Analysis", "Machine Learning", "TensorFlow", "PyTorch", "Pandas", "NumPy",
      "Scikit-learn", "Jupyter", "Power BI", "Tableau", "Looker", "Apache Spark", "Hadoop",
      "ETL", "Data Warehousing", "Data Mining", "Statistics", "A/B Testing"
    ]
  },
  {
    name: "Mobile Development",
    skills: [
      "React Native", "Flutter", "iOS Development", "Android Development", "Xamarin", "Ionic",
      "Swift", "Objective-C", "Kotlin", "Java", "Dart", "Cordova", "PhoneGap"
    ]
  },
  {
    name: "Testing & Quality",
    skills: [
      "Unit Testing", "Integration Testing", "E2E Testing", "Test Automation", "Jest", "Cypress",
      "Selenium", "Playwright", "Mocha", "Chai", "JUnit", "TestNG", "PyTest", "Postman", "Insomnia"
    ]
  },
  {
    name: "Version Control & Collaboration",
    skills: [
      "Git", "GitHub", "GitLab", "Bitbucket", "SVN", "Mercurial", "Code Review", "Pull Requests",
      "Branching Strategies", "Git Flow"
    ]
  },
  {
    name: "Project Management & Tools",
    skills: [
      "Agile", "Scrum", "Kanban", "Jira", "Trello", "Asana", "Monday.com", "Notion", "Confluence",
      "Slack", "Microsoft Teams", "Zoom", "Linear", "ClickUp"
    ]
  }
];

// Soft Skills
export const SOFT_SKILLS: string[] = [
  "Leadership", "Communication", "Problem Solving", "Critical Thinking", "Teamwork", "Collaboration",
  "Adaptability", "Creativity", "Innovation", "Time Management", "Project Management", "Strategic Thinking",
  "Decision Making", "Conflict Resolution", "Negotiation", "Presentation Skills", "Public Speaking",
  "Writing", "Documentation", "Mentoring", "Training", "Coaching", "Emotional Intelligence",
  "Empathy", "Customer Service", "Client Relations", "Stakeholder Management", "Cross-functional Collaboration",
  "Remote Work", "Virtual Teams", "Multitasking", "Organization", "Planning", "Prioritization",
  "Attention to Detail", "Quality Assurance", "Continuous Learning", "Research", "Analysis",
  "Data-driven Decision Making", "Business Acumen", "Industry Knowledge", "Market Research",
  "Competitive Analysis", "User Experience", "Design Thinking", "Process Improvement", "Optimization"
];

// Skill synonyms and aliases for canonicalization
export const SKILL_SYNONYMS: Record<string, string> = {
  // JavaScript variations
  "JS": "JavaScript",
  "Javascript": "JavaScript",
  "ECMAScript": "JavaScript",
  "ES6": "JavaScript",
  "ES2015": "JavaScript",
  
  // TypeScript variations
  "TS": "TypeScript",
  "Typescript": "TypeScript",
  
  // React variations
  "ReactJS": "React",
  "React.js": "React",
  
  // Vue variations
  "Vue": "Vue.js",
  "VueJS": "Vue.js",
  
  // Angular variations
  "AngularJS": "Angular",
  "Angular.js": "Angular",
  
  // Node variations
  "Node": "Node.js",
  "NodeJS": "Node.js",
  
  // Express variations
  "Express": "Express.js",
  "ExpressJS": "Express.js",
  
  // Database variations
  "Postgres": "PostgreSQL",
  "MySQL": "MySQL",
  "Mongo": "MongoDB",
  "MongoDb": "MongoDB",
  
  // Cloud variations
  "Amazon Web Services": "AWS",
  "EC2": "AWS",
  "S3": "AWS",
  "Lambda": "AWS",
  "Microsoft Azure": "Azure",
  "GCP": "Google Cloud",
  "Google Cloud Platform": "Google Cloud",
  
  // DevOps variations
  "K8s": "Kubernetes",
  "CI/CD": "Continuous Integration",
  "Continuous Deployment": "CI/CD",
  
  // Soft skills variations
  "Problem-solving": "Problem Solving",
  "Problem-Solving": "Problem Solving",
  "Team work": "Teamwork",
  "Team Work": "Teamwork",
  "Team-work": "Teamwork",
  "Leadership Skills": "Leadership",
  "Communication Skills": "Communication",
  "Management": "Project Management",
  "People Management": "Leadership",
  "Team Management": "Leadership",
  "Team Lead": "Leadership",
  "Tech Lead": "Leadership",
  "Technical Leadership": "Leadership"
};

/**
 * Get all hard skills flattened from categories
 */
export function getAllHardSkills(): string[] {
  return HARD_SKILL_CATEGORIES.flatMap(category => category.skills);
}

/**
 * Get all skills (hard + soft)
 */
export function getAllSkills(): string[] {
  return [...getAllHardSkills(), ...SOFT_SKILLS];
}

/**
 * Canonicalize a skill name using synonyms
 */
export function canonicalizeSkill(skill: string): string {
  const trimmed = skill.trim();
  const canonical = SKILL_SYNONYMS[trimmed];
  return canonical || trimmed;
}

/**
 * Search skills by query with fuzzy matching
 */
export function searchSkills(query: string, type: 'hard' | 'soft' | 'all' = 'all', limit: number = 8): string[] {
  if (!query || query.length < 2) return [];
  
  const skills = type === 'hard' ? getAllHardSkills() : 
                 type === 'soft' ? SOFT_SKILLS : 
                 getAllSkills();
  
  const queryLower = query.toLowerCase();
  
  // Exact matches first
  const exactMatches = skills.filter(skill => 
    skill.toLowerCase() === queryLower
  );
  
  // Starts with matches
  const startsWithMatches = skills.filter(skill => 
    skill.toLowerCase().startsWith(queryLower) && 
    !exactMatches.includes(skill)
  );
  
  // Contains matches
  const containsMatches = skills.filter(skill => 
    skill.toLowerCase().includes(queryLower) && 
    !exactMatches.includes(skill) && 
    !startsWithMatches.includes(skill)
  );
  
  // Also search in synonyms
  const synonymMatches = Object.entries(SKILL_SYNONYMS)
    .filter(([synonym]) => synonym.toLowerCase().includes(queryLower))
    .map(([_, canonical]) => canonical)
    .filter(skill => skills.includes(skill) && 
            !exactMatches.includes(skill) && 
            !startsWithMatches.includes(skill) && 
            !containsMatches.includes(skill)
    );
  
  return [...exactMatches, ...startsWithMatches, ...containsMatches, ...synonymMatches]
    .slice(0, limit);
}

/**
 * Deduplicate and canonicalize a list of skills
 */
export function deduplicateSkills(skills: string[]): string[] {
  const canonical = skills.map(canonicalizeSkill);
  return [...new Set(canonical)].filter(skill => skill.length > 0);
}

/**
 * Get skill suggestions based on existing skills
 */
export function getSkillSuggestions(existingSkills: string[], type: 'hard' | 'soft' = 'hard', limit: number = 5): string[] {
  const allSkills = type === 'hard' ? getAllHardSkills() : SOFT_SKILLS;
  const existing = new Set(existingSkills.map(canonicalizeSkill));
  
  // Find skills in same categories as existing skills
  let suggestions: string[] = [];
  
  if (type === 'hard') {
    for (const category of HARD_SKILL_CATEGORIES) {
      const hasSkillInCategory = category.skills.some(skill => existing.has(skill));
      if (hasSkillInCategory) {
        const categorySuggestions = category.skills.filter(skill => !existing.has(skill));
        suggestions.push(...categorySuggestions);
      }
    }
  }
  
  // Add popular skills if not enough suggestions
  if (suggestions.length < limit) {
    const popular = allSkills.filter(skill => !existing.has(skill));
    suggestions.push(...popular);
  }
  
  return [...new Set(suggestions)].slice(0, limit);
}
