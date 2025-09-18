export default function FAQPage() {
  const faqs = [
    { q: 'Is Vitae ATS-friendly?', a: 'Yes, ATS-first by default with standard headings and clean exports.' },
    { q: 'How fast can I tailor to a JD?', a: 'In minutes using the guided tailoring flow.' },
    { q: 'Do you support cover letters?', a: 'Yes, generated alongside resumes.' },
    { q: 'What is the price?', a: '$1/mo (1 profile) or $3/mo (5 profiles).' },
    { q: 'Is there a free trial?', a: 'Free for the first 20 users. Cancel anytime.' },
  ];
  return (
    <main className="max-w-4xl mx-auto px-6 py-12">
      <h1 className="text-3xl font-bold mb-6">FAQ</h1>
      <div className="space-y-6">
        {faqs.map((f, i) => (
          <div key={i} className="rounded-lg border p-5 bg-white">
            <h2 className="text-xl font-semibold mb-2">{f.q}</h2>
            <p className="text-gray-700">{f.a}</p>
          </div>
        ))}
      </div>
    </main>
  );
}


