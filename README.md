# Vitae AI - Ethical Resume & Cover Letter Generator

> **AI-powered resume and cover letter generation with ethical guardrails**

Vitae AI helps job seekers create tailored, ATS-safe resumes and cover letters from their profile data. The system uses ethical AI that never fabricates information—it only enhances what you've actually accomplished.

## 🚀 Features

### Core Functionality
- **One-Time Profile Setup**: Enter your professional information once
- **Job Description Analysis**: Paste any JD and get instant fit analysis
- **Tailored Generation**: AI creates customized resumes and cover letters
- **Multiple Formats**: Export to PDF, DOCX, or Markdown
- **Version Control**: Save and manage multiple document versions

### Ethical Guardrails
- **No Fabrication**: Never invents experience, roles, or qualifications
- **Traceability**: Every statement links back to verified profile data
- **Transparency**: Clear provenance for all generated content
- **Bias Prevention**: Removes age, gender, and other sensitive information

### ATS Optimization
- **Clean Formatting**: Simple, readable layouts that ATS systems can parse
- **Keyword Integration**: Strategic placement of relevant keywords
- **Standard Sections**: Proper headers and structure
- **Multiple Themes**: Professional templates while maintaining ATS safety

## 🛠 Tech Stack

- **Frontend**: Next.js 14, TypeScript, Tailwind CSS
- **Backend**: Next.js API Routes, Prisma ORM
- **Database**: PostgreSQL
- **AI**: OpenAI GPT-4 for content generation
- **Export**: DOCX.js for Word documents, HTML-to-PDF for PDFs
- **Authentication**: Supabase (planned)

## 📋 Prerequisites

- Node.js 18+ 
- PostgreSQL database
- OpenAI API key

## 🏃‍♂️ Quick Start

### 1. Clone and Install

```bash
git clone <repository-url>
cd vitae-1
npm install
```

### 2. Environment Setup

Create a `.env.local` file:

```env
# Database
DATABASE_URL="postgresql://username:password@localhost:5432/vitae_db"

# AI Services
OPENAI_API_KEY="your_openai_api_key"

# Application
NEXT_PUBLIC_APP_URL="http://localhost:3000"
```

### 3. Database Setup

```bash
# Generate Prisma client
npx prisma generate

# Run database migrations
npx prisma migrate dev --name init

# (Optional) Seed with sample data
npx prisma db seed
```

### 4. Start Development Server

```bash
npm run dev
```

Visit `http://localhost:3000` to see the application.

## 📁 Project Structure

```
src/
├── app/                    # Next.js App Router
│   ├── api/               # API endpoints
│   │   ├── generate/      # Document generation
│   │   ├── parse-jd/      # Job description parsing
│   │   ├── profiles/      # Profile management
│   │   └── export/        # Document export
│   ├── dashboard/         # Main dashboard page
│   ├── onboarding/        # Profile setup flow
│   └── page.tsx          # Landing page
├── components/            # React components
│   ├── ui/               # Base UI components
│   └── profile/          # Profile-specific components
├── lib/                  # Utility libraries
│   ├── ai-client.ts      # OpenAI integration
│   ├── jd-parser.ts      # Job description analysis
│   ├── resume-generator.ts # Document generation
│   ├── fit-analysis.ts   # Job fit analysis
│   ├── guardrails.ts     # Ethical validation
│   ├── export-service.ts # Document export
│   └── prisma.ts         # Database client
├── types/                # TypeScript definitions
└── prisma/               # Database schema
```

## 🔄 User Journey

1. **Landing Page** → Learn about features and benefits
2. **Onboarding** → Create profile (manual entry, LinkedIn import, or file upload)
3. **Dashboard** → Main workspace for document generation
4. **JD Analysis** → Paste job description and analyze fit
5. **Generation** → Create tailored resume and cover letter
6. **Preview & Edit** → Review documents with guardrail validation
7. **Export** → Download in preferred format (PDF/DOCX/MD)
8. **Library** → Access previous documents and versions

## 🎯 API Endpoints

### Profiles
- `GET /api/profiles` - List user profiles
- `POST /api/profiles` - Create new profile
- `GET /api/profiles/[id]` - Get specific profile
- `PUT /api/profiles/[id]` - Update profile
- `DELETE /api/profiles/[id]` - Delete profile

### Job Description Analysis
- `POST /api/parse-jd` - Parse and analyze job description

### Document Generation
- `POST /api/generate` - Generate resume and cover letter
- `GET /api/generate` - List generated documents

### Export
- `POST /api/export` - Export document in specified format

## 🔒 Ethical Guardrails

The system implements several layers of validation to ensure ethical content generation:

### Fabrication Prevention
- All content must trace back to profile data
- No invention of roles, companies, or dates
- Metrics only included if provided by user

### Bias Mitigation
- Removes age-related information
- Avoids gendered language
- Excludes personal details unrelated to job performance

### Transparency
- Every bullet point has source mapping
- Clear confidence indicators
- User can see what profile data was used

### Validation Levels
- **Error**: Blocks export (fabricated information)
- **Warning**: Allows export with notice (unverifiable claims)
- **Info**: Best practice suggestions

## 📊 Data Model

### Profile Structure
```typescript
interface Profile {
  header: UserHeader;           // Name, contact, links
  experience: Experience[];     // Work history with achievements
  education: Education[];       // Degrees and certifications
  skills: Skills;              // Technical and soft skills
  projects: Project[];         // Notable projects
  evidence: Evidence[];        // Proof links and validations
}
```

### Document Generation
```typescript
interface GenerateRequest {
  profile_id: string;
  job_description: JobDescription;
  options: GenerationOptions;
}
```

### Guardrail Validation
```typescript
interface ValidationResult {
  is_valid: boolean;
  violations: GuardrailViolation[];
  safety_score: number;
}
```

## 🎨 Themes and Formatting

### ATS-Safe Defaults
- Standard fonts (Arial, Calibri)
- Simple formatting (no tables or graphics)
- Consistent section headers
- Proper spacing and margins

### Export Options
- **PDF**: Printer-friendly with consistent layout
- **DOCX**: Editable Word document
- **Markdown**: Plain text with formatting

## 🧪 Testing

```bash
# Run all tests
npm test

# Run with coverage
npm run test:coverage

# Run specific test suite
npm test -- --grep "resume generation"
```

## 🚀 Deployment

### Vercel (Recommended)
```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel --prod
```

### Docker
```bash
# Build image
docker build -t vitae-ai .

# Run container
docker run -p 3000:3000 vitae-ai
```

## 🔮 Roadmap

### v0.1 (Current)
- [x] Basic profile management
- [x] Job description parsing
- [x] Resume/cover letter generation
- [x] Ethical guardrails
- [x] PDF/DOCX export

### v0.2 (Next)
- [ ] User authentication
- [ ] LinkedIn profile import
- [ ] Resume file upload parsing
- [ ] Enhanced themes

### v1.0 (Future)
- [ ] Skills taxonomy integration
- [ ] Advanced fit analysis
- [ ] Team/coach features
- [ ] Regional compliance packs

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

- **Documentation**: [docs.vitae-ai.com](https://docs.vitae-ai.com)
- **Email**: support@vitae-ai.com
- **Issues**: [GitHub Issues](https://github.com/vitae-ai/vitae-1/issues)

## 🙏 Acknowledgments

- OpenAI for GPT-4 capabilities
- Vercel for deployment platform
- All contributors and beta testers

---

**Made with ❤️ for ethical AI and better job searches**