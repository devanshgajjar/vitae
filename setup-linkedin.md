# LinkedIn OAuth Setup Guide

## Quick Fix (Test Resume Import Instead)

If you want to test the import functionality immediately without LinkedIn setup, you can:

1. **Test Resume Import**: The resume upload and manual text import features work without any configuration
2. **Try Demo Data**: The LinkedIn import will show demo data when OAuth is not configured

## Full LinkedIn Setup (Optional)

To enable real LinkedIn integration:

### 1. Create LinkedIn Developer App

1. Go to https://www.linkedin.com/developers/
2. Click "Create App"
3. Fill in required fields:
   - **App name**: "Vitae AI Resume Builder"
   - **LinkedIn Page**: Create a company page or use personal
   - **Privacy policy URL**: Your privacy policy URL
   - **App logo**: Upload any logo (required)

### 2. Configure OAuth

1. In your LinkedIn app dashboard:
   - Go to "Auth" tab
   - Under "Authorized redirect URLs for your app", add:
     ```
     http://localhost:3000/api/import/linkedin/callback
     ```
   - Note down your Client ID and Client Secret

### 3. Update Environment Variables

Edit your `.env` file:

```bash
# LinkedIn OAuth
LINKEDIN_CLIENT_ID="your_client_id_here"
LINKEDIN_CLIENT_SECRET="your_client_secret_here"
LINKEDIN_REDIRECT_URI="http://localhost:3000/api/import/linkedin/callback"

# Required for redirects
NEXT_PUBLIC_BASE_URL="http://localhost:3000"
```

### 4. Restart Development Server

```bash
npm run dev
```

## Testing

1. **Resume Upload**: Upload PDF, DOCX, or TXT files
2. **Manual Import**: Copy-paste resume content
3. **LinkedIn Import**: Only works after OAuth setup

## Troubleshooting

- **500 Error**: Usually means environment variables are missing
- **OAuth Denied**: Check redirect URLs match exactly
- **Parsing Issues**: Try converting files to plain text

## Current Status

✅ **Resume Upload** - Ready to use  
✅ **Manual Text Import** - Ready to use  
⚠️ **LinkedIn Import** - Requires OAuth setup  

You can use the resume import features immediately while setting up LinkedIn OAuth separately.
