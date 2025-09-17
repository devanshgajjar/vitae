# 🚀 Setup Environment Variables

## Quick Setup (Copy and Run)

Create the `.env.local` file in your project root:

```bash
# Copy this entire command and run it in your terminal
cat > .env.local << 'EOF'
# Database
DATABASE_URL="file:./dev.db"

# AI Services  
OPENAI_API_KEY="your_openai_api_key_here"

# Application
NEXT_PUBLIC_APP_URL="http://localhost:3000"
EOF
```

## What This Does

- ✅ Enables real OpenAI AI generation
- ✅ Sets up SQLite database path  
- ✅ Configures application URL

## After Setup

1. Restart your development server: `npm run dev`
2. Visit http://localhost:3000
3. Create a profile and test AI generation!

## Current Status

The app works in **both modes**:
- 🤖 **WITH OpenAI key**: Real AI generation
- 🎭 **WITHOUT OpenAI key**: Smart mock generation (still very useful!)

So you can test immediately even without setting up the API key.
