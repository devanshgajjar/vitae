import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { FileText, Users, Zap, Shield, Download, Sparkles } from 'lucide-react';

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center">
              <FileText className="h-8 w-8 text-blue-600 mr-3" />
              <h1 className="text-2xl font-bold text-gray-900">Vitae AI</h1>
            </div>
            <div className="flex space-x-4">
              <Link href="/auth/sign-in">
                <Button variant="outline">Sign In</Button>
              </Link>
              <Link href="/auth/sign-in">
                <Button>Get Started</Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center">
          <h1 className="text-5xl font-bold text-gray-900 mb-6">
            AI-Powered Resume & Cover Letter Generator
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
            Create tailored, ATS-safe resumes and cover letters from your profile data. 
            Ethical AI that never fabricates — only enhances what you&apos;ve actually accomplished.
          </p>
          <div className="flex justify-center space-x-4">
            <Link href="/auth/signin">
              <Button size="lg" className="px-8 py-4 text-lg">
                <Sparkles className="mr-2 h-5 w-5" />
                Start Building Your Profile
              </Button>
            </Link>
            <Link href="/create">
              <Button variant="outline" size="lg" className="px-8 py-4 text-lg">
                Try Demo
              </Button>
            </Link>
          </div>
        </div>

        {/* Features Grid */}
        <div className="mt-20 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center mb-4">
              <Zap className="h-8 w-8 text-blue-600 mr-3" />
              <h3 className="text-xl font-semibold">Smart Job Matching</h3>
            </div>
            <p className="text-gray-600">
              Paste any job description and get instant fit analysis plus tailored 
              resume and cover letter generation in seconds.
            </p>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center mb-4">
              <Shield className="h-8 w-8 text-green-600 mr-3" />
              <h3 className="text-xl font-semibold">Ethical Guardrails</h3>
            </div>
            <p className="text-gray-600">
              Never fabricates experience or qualifications. Every statement 
              is traceable back to your verified profile data.
            </p>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center mb-4">
              <FileText className="h-8 w-8 text-purple-600 mr-3" />
              <h3 className="text-xl font-semibold">ATS Optimized</h3>
            </div>
            <p className="text-gray-600">
              All documents are formatted for Applicant Tracking Systems 
              with proper keywords and clean, readable formatting.
            </p>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center mb-4">
              <Download className="h-8 w-8 text-orange-600 mr-3" />
              <h3 className="text-xl font-semibold">Multiple Formats</h3>
            </div>
            <p className="text-gray-600">
              Export to PDF, DOCX, or Markdown. Choose from professional 
              themes while maintaining ATS compatibility.
            </p>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center mb-4">
              <Users className="h-8 w-8 text-indigo-600 mr-3" />
              <h3 className="text-xl font-semibold">Version Control</h3>
            </div>
            <p className="text-gray-600">
              Save and manage multiple versions of your documents. 
              Track what works best for different types of positions.
            </p>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center mb-4">
              <Sparkles className="h-8 w-8 text-pink-600 mr-3" />
              <h3 className="text-xl font-semibold">Evidence Linking</h3>
            </div>
            <p className="text-gray-600">
              Optional evidence locker for proof links, certifications, 
              and portfolio pieces to validate your achievements.
            </p>
          </div>
        </div>

        {/* How It Works */}
        <div className="mt-20">
          <h2 className="text-3xl font-bold text-center mb-12">How It Works</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="bg-blue-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-blue-600">1</span>
              </div>
              <h3 className="text-lg font-semibold mb-2">Create Profile</h3>
              <p className="text-gray-600">
                Import from LinkedIn or manually enter your experience, 
                skills, and achievements once.
              </p>
            </div>

            <div className="text-center">
              <div className="bg-green-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-green-600">2</span>
              </div>
              <h3 className="text-lg font-semibold mb-2">Paste Job Description</h3>
              <p className="text-gray-600">
                Copy any job posting and our AI analyzes requirements 
                and keyword opportunities.
              </p>
            </div>

            <div className="text-center">
              <div className="bg-purple-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-purple-600">3</span>
              </div>
              <h3 className="text-lg font-semibold mb-2">Generate Documents</h3>
              <p className="text-gray-600">
                Get tailored resume and cover letter with fit analysis 
                and guardrail validation.
              </p>
            </div>

            <div className="text-center">
              <div className="bg-orange-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-orange-600">4</span>
              </div>
              <h3 className="text-lg font-semibold mb-2">Export & Apply</h3>
              <p className="text-gray-600">
                Download in your preferred format and apply with 
                confidence to the perfect job.
              </p>
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <div className="mt-20 bg-blue-600 rounded-2xl px-8 py-16 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">
            Ready to Land Your Dream Job?
          </h2>
          <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
            Join thousands of professionals who&apos;ve upgraded their job search 
            with ethical AI-powered document generation.
          </p>
          <Link href="/auth/signin">
            <Button size="lg" variant="secondary" className="px-8 py-4 text-lg">
              Get Started for Free
            </Button>
          </Link>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-gray-800 text-white py-12 mt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center mb-4">
                <FileText className="h-6 w-6 mr-2" />
                <span className="text-lg font-semibold">Vitae AI</span>
              </div>
              <p className="text-gray-300">
                Ethical AI-powered resume and cover letter generation 
                for modern job seekers.
              </p>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-4">Product</h3>
              <ul className="space-y-2">
                <li><Link href="/features" className="text-gray-300 hover:text-white">Features</Link></li>
                <li><Link href="/pricing" className="text-gray-300 hover:text-white">Pricing</Link></li>
                <li><Link href="/demo" className="text-gray-300 hover:text-white">Demo</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-4">Support</h3>
              <ul className="space-y-2">
                <li><Link href="/help" className="text-gray-300 hover:text-white">Help Center</Link></li>
                <li><Link href="/contact" className="text-gray-300 hover:text-white">Contact</Link></li>
                <li><Link href="/privacy" className="text-gray-300 hover:text-white">Privacy Policy</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-4">Company</h3>
              <ul className="space-y-2">
                <li><Link href="/about" className="text-gray-300 hover:text-white">About</Link></li>
                <li><Link href="/blog" className="text-gray-300 hover:text-white">Blog</Link></li>
                <li><Link href="/careers" className="text-gray-300 hover:text-white">Careers</Link></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-700 mt-8 pt-8 text-center">
            <p className="text-gray-300">
              © 2024 Vitae AI. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}