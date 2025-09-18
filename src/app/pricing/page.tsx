export default function PricingPage() {
  return (
    <main className="max-w-5xl mx-auto px-6 py-12">
      <h1 className="text-3xl font-bold mb-2">Pricing</h1>
      <p className="text-gray-600 mb-8">ATS-first resumes at honest micro-pricing. Free for the first 20 users.</p>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="rounded-xl border p-6 bg-white">
          <h2 className="text-2xl font-semibold mb-2">$1 / month</h2>
          <p className="text-gray-600 mb-4">1 profile • Resume + Cover Letter • PDF/DOCX/MD export</p>
          <a href="/auth/sign-in" className="inline-block bg-blue-600 text-white px-5 py-2 rounded-md">Start for $1</a>
        </div>
        <div className="rounded-xl border p-6 bg-white">
          <h2 className="text-2xl font-semibold mb-2">$3 / month</h2>
          <p className="text-gray-600 mb-4">5 profiles • Resume + Cover Letter • PDF/DOCX/MD export</p>
          <a href="/auth/sign-in" className="inline-block bg-blue-600 text-white px-5 py-2 rounded-md">Start for $3</a>
        </div>
      </div>
      <div className="mt-8 rounded-lg bg-blue-50 border border-blue-200 p-4 text-blue-900">
        Try Vitae (MVP) — $1/mo (1 profile) · $3/mo (5 profiles). Free for the first 20 users. Cancel anytime.
      </div>
    </main>
  );
}


