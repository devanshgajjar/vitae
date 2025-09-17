# Quick Setup Guide

## 🚀 Getting Started in 5 Minutes

### 1. Install Dependencies
```bash
npm install
```

### 2. Environment Setup
Copy `env.example` to `.env.local` and fill in your values:

```bash
cp env.example .env.local
```

**Required Environment Variables:**
- `DATABASE_URL` - PostgreSQL connection string
- `OPENAI_API_KEY` - Your OpenAI API key

### 3. Database Setup
```bash
# Generate Prisma client
npm run db:generate

# Run migrations (creates tables)
npm run db:migrate
```

### 4. Start Development Server
```bash
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000)

## 🎯 Quick Test Flow

1. **Visit Landing Page** - [http://localhost:3000](http://localhost:3000)
2. **Click "Get Started"** - Go to onboarding
3. **Create Profile** - Fill out the form with your info
4. **Go to Dashboard** - Should redirect automatically
5. **Paste Job Description** - Use any job posting
6. **Click "Analyze Fit"** - See fit analysis
7. **Click "Generate"** - Create resume and cover letter
8. **Export Documents** - Download PDF/DOCX

## 🔧 Database Setup Options

### Option 1: Local PostgreSQL
```bash
# Install PostgreSQL locally
brew install postgresql  # macOS
sudo apt install postgresql  # Ubuntu

# Create database
createdb vitae_db

# Set DATABASE_URL
DATABASE_URL="postgresql://username:password@localhost:5432/vitae_db"
```

### Option 2: Supabase (Free)
1. Go to [supabase.com](https://supabase.com)
2. Create new project
3. Copy Database URL from Settings > Database
4. Use in `.env.local`

### Option 3: Neon (Free)
1. Go to [neon.tech](https://neon.tech)
2. Create new project
3. Copy connection string
4. Use in `.env.local`

## 🤖 OpenAI API Key

1. Go to [platform.openai.com](https://platform.openai.com)
2. Create account / Sign in
3. Go to API Keys section
4. Create new secret key
5. Add to `.env.local` as `OPENAI_API_KEY`

**Note**: You'll need to add billing information for API usage.

## 🐛 Common Issues

### "Module not found" errors
```bash
npm run db:generate
```

### Database connection errors
- Check DATABASE_URL format
- Ensure database exists
- Verify credentials

### OpenAI API errors
- Check API key is correct
- Ensure billing is set up
- Verify API quota

### Build errors
```bash
# Clear cache and reinstall
rm -rf .next node_modules
npm install
npm run dev
```

## 📱 Demo Data

For testing, you can use this sample job description:

```
Software Engineer - Frontend
Tech Company

We are looking for a skilled Frontend Developer to join our team.

Requirements:
- 3+ years of React experience
- TypeScript proficiency
- Experience with modern build tools
- Strong CSS/HTML skills
- Git version control

Nice to have:
- Next.js experience
- GraphQL knowledge
- Testing frameworks
- AWS deployment experience

Responsibilities:
- Build user-facing features
- Collaborate with design team
- Optimize application performance
- Write clean, maintainable code
```

## 🚀 Deployment

### Vercel (Recommended)
```bash
# Install Vercel CLI
npm i -g vercel

# Login and deploy
vercel login
vercel --prod
```

Add environment variables in Vercel dashboard.

### Other Platforms
- Railway: Connect GitHub repo
- Netlify: Build with `npm run build`
- DigitalOcean App Platform: Node.js app

## 📞 Need Help?

- Check the main [README.md](README.md) for detailed documentation
- Open an issue on GitHub
- Contact: support@vitae-ai.com
