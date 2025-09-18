import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function HomePage() {
  return (
    <main className="bg-white">
      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center">
        <h1 className="text-5xl font-semibold tracking-tight mb-4">ATS‑first resumes in minutes</h1>
        <p className="text-lg text-gray-600 mb-6">$1/mo (1 profile) · $3/mo (5 profiles). Free for the first 20 users.</p>
        <div className="flex justify-center gap-3">
          <Link href="/auth/sign-in"><Button className="px-6">Start for Free</Button></Link>
          <Link href="/create"><Button variant="outline" className="px-6">Try the Demo</Button></Link>
        </div>
      </section>

      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12 grid md:grid-cols-3 gap-6">
        <div className="rounded-lg border p-5">
          <h3 className="font-semibold mb-2">ATS-first by default</h3>
          <p className="text-gray-600">Clean headings, single column, export to PDF/DOCX/MD.</p>
        </div>
        <div className="rounded-lg border p-5">
          <h3 className="font-semibold mb-2">Tailor to any JD</h3>
          <p className="text-gray-600">Paste a job description and align in minutes.</p>
        </div>
        <div className="rounded-lg border p-5">
          <h3 className="font-semibold mb-2">Fair micro‑pricing</h3>
          <p className="text-gray-600">$1 for 1 profile or $3 for 5. Cancel anytime.</p>
        </div>
      </section>

      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12 grid md:grid-cols-2 gap-6">
        <div className="rounded-lg border p-6">
          <h3 className="font-semibold mb-2">Compare Vitae</h3>
          <p className="text-gray-600 mb-4">See how we differ from Zety, Canva, and more.</p>
          <Link href="/compare" className="text-blue-600">Explore comparisons →</Link>
        </div>
        <div className="rounded-lg border p-6">
          <h3 className="font-semibold mb-2">Switch to Vitae</h3>
          <p className="text-gray-600 mb-4">Step-by-step migration guides from other builders.</p>
          <Link href="/migrate" className="text-blue-600">View migration guides →</Link>
        </div>
      </section>

      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
        <h2 className="text-2xl font-semibold mb-3">Ready?</h2>
        <p className="text-gray-600 mb-5">Generate your resume and cover letter now.</p>
        <Link href="/auth/sign-in"><Button className="px-6">Start for Free</Button></Link>
      </section>
    </main>
  );
}