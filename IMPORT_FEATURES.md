# Import Functionality Documentation

## Overview

The Vitae AI application now includes comprehensive import functionality that allows users to quickly populate their profiles from existing sources instead of manually entering all information.

## Features

### 1. LinkedIn Import
- **OAuth Integration**: Secure LinkedIn authentication flow
- **Profile Data Extraction**: Automatically imports basic profile information, work experience, education, and skills
- **AI Enhancement**: Optional AI-powered enhancement of imported data for better descriptions and categorization

### 2. Resume File Upload
- **Supported Formats**: PDF, DOCX, DOC, and TXT files
- **Smart Parsing**: Intelligent text extraction and parsing using NLP techniques
- **Contact Information**: Automatically extracts name, email, phone, location, and social links
- **Experience Extraction**: Identifies work experience with companies, roles, dates, and achievements
- **Education Parsing**: Finds educational background including degrees, schools, and years
- **Skills Detection**: Categorizes skills into hard/technical and soft skills
- **Project Recognition**: Identifies notable projects and their descriptions

### 3. Manual Text Import
- **Copy-Paste Functionality**: Users can paste resume content directly
- **Same Parsing Engine**: Uses the same intelligent parsing as file uploads
- **Quick Processing**: Immediate analysis and extraction of structured data

## API Endpoints

### LinkedIn Import
- `GET /api/import/linkedin?user_id={id}` - Initiate OAuth flow
- `GET /api/import/linkedin/callback` - OAuth callback handler
- `POST /api/import/linkedin` - Process LinkedIn data manually

### Resume Import
- `POST /api/import/resume` - Upload and parse resume files

## Usage

### From Dashboard
1. Click "Import Profile" button in the dashboard header
2. Choose your preferred import method
3. Follow the prompts for LinkedIn OAuth or file upload
4. Review and edit the imported data

### From Onboarding
1. On the onboarding page, select "Import Profile" option
2. Choose LinkedIn, file upload, or manual text entry
3. Complete the import process
4. Optionally continue with manual form editing

### In Profile Form
1. While editing a profile, use the "Quick Import" section
2. Import additional data that will be merged with existing information
3. Skills and links are automatically deduplicated

## Configuration

### Environment Variables
```bash
# LinkedIn OAuth
LINKEDIN_CLIENT_ID="your_linkedin_client_id"
LINKEDIN_CLIENT_SECRET="your_linkedin_client_secret"
LINKEDIN_REDIRECT_URI="http://localhost:3000/api/import/linkedin/callback"

# AI Enhancement (Optional)
OPENAI_API_KEY="your_openai_api_key"

# Application URLs
NEXT_PUBLIC_BASE_URL="http://localhost:3000"
```

### LinkedIn App Setup
1. Create a LinkedIn App at https://www.linkedin.com/developers/
2. Configure OAuth redirect URLs
3. Request necessary permissions:
   - `openid`
   - `profile`
   - `email`
   - `w_member_social` (for extended profile data)

## Data Processing

### Contact Information Extraction
- **Name**: Identifies likely candidate names using position, formatting, and common patterns
- **Email**: Uses regex to find valid email addresses
- **Phone**: Detects various phone number formats including international
- **Location**: Finds city, state/country patterns
- **Social Links**: Extracts LinkedIn, GitHub, and portfolio URLs

### Experience Parsing
- **Section Detection**: Identifies experience sections using keywords
- **Role Identification**: Finds job titles using common title patterns
- **Company Extraction**: Associates companies with roles
- **Date Parsing**: Extracts start and end dates in various formats
- **Achievement Recognition**: Identifies bullet points and accomplishments

### Education Processing
- **Degree Recognition**: Identifies various degree types and levels
- **Institution Detection**: Finds university and college names
- **Date Extraction**: Determines graduation years or date ranges
- **Honors Recognition**: Extracts academic achievements and honors

### Skills Categorization
- **Hard Skills**: Technical skills, programming languages, tools, platforms
- **Soft Skills**: Interpersonal skills, leadership qualities, communication abilities
- **Automatic Categorization**: Uses keyword matching and AI enhancement for better classification

## Error Handling

### File Upload Errors
- Unsupported file types return specific error messages
- File size limits (10MB) are enforced
- Parsing failures provide helpful fallback suggestions

### LinkedIn OAuth Errors
- Authorization denials are handled gracefully
- Invalid tokens or expired sessions redirect to error pages
- Network failures are caught and reported

### Data Validation
- Required fields are validated before saving
- Email formats are verified
- Profile data structure is validated against schema

## Testing

### Manual Testing
1. Test LinkedIn OAuth flow (requires LinkedIn developer app)
2. Upload various resume formats (PDF, DOCX, TXT)
3. Try manual text import with different resume styles
4. Verify data accuracy and completeness

### File Format Testing
- **PDF**: Complex layouts, scanned documents, different fonts
- **DOCX**: Various templates, formatting styles, embedded content
- **TXT**: Plain text, different structures, encoding variations

## Security

### Data Privacy
- LinkedIn data is only accessed with explicit user consent
- No profile data is stored without user confirmation
- File uploads are processed temporarily and not permanently stored

### OAuth Security
- State parameters prevent CSRF attacks
- Redirect URIs are validated
- Access tokens are handled securely

## Limitations

### LinkedIn API
- Basic permissions provide limited profile data
- Extended data requires special LinkedIn partnership
- Rate limiting may apply for high-volume usage

### File Parsing
- OCR is not implemented for scanned PDFs
- Complex document layouts may not parse perfectly
- Non-English content may have reduced accuracy

### AI Enhancement
- Requires OpenAI API key for full functionality
- Processing time increases with AI enhancement enabled
- AI responses may occasionally need human review

## Future Enhancements

1. **OCR Support**: Add optical character recognition for scanned documents
2. **More File Formats**: Support for additional formats like RTF, HTML
3. **Batch Import**: Allow importing multiple files at once
4. **Import Templates**: Pre-defined parsing templates for common resume formats
5. **Industry-Specific Parsing**: Specialized parsing for different industries
6. **Multi-Language Support**: Enhanced parsing for non-English resumes
7. **Integration with Job Boards**: Direct import from job board profiles
8. **AI-Powered Suggestions**: Intelligent suggestions for missing or incomplete data

## Troubleshooting

### Common Issues
1. **LinkedIn OAuth Fails**: Check client ID/secret and redirect URI configuration
2. **File Upload Errors**: Verify file format and size requirements
3. **Poor Parsing Results**: Try converting to text format or manual entry
4. **Missing Data**: Review and manually add information as needed

### Debug Information
- Check browser console for detailed error messages
- Verify network connectivity for OAuth flows
- Ensure environment variables are properly configured

## Support

For issues or questions regarding the import functionality:
1. Check this documentation for common solutions
2. Review error messages for specific guidance
3. Test with different file formats or import methods
4. Consider manual profile creation as a fallback option
