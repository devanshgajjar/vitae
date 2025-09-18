import Link from 'next/link';
import { getAllSlugs, loadMarkdownBySlug } from '@/lib/md';

export default function CompareIndexPage() {
  const slugs = getAllSlugs('compare');
  const items = slugs.map((slug) => {
    const md = loadMarkdownBySlug('compare', slug);
    return { slug, title: md?.frontmatter?.title as string, description: md?.frontmatter?.description as string };
  });

  return (
    <main>
      <header className="bg-white border-b">
        <div className="max-w-5xl mx-auto px-6 py-10">
          <h1 className="text-3xl font-semibold mb-2">Compare builders</h1>
          <p className="text-gray-600">Vitae vs popular tools on ATS results, tailoring speed, and price.</p>
        </div>
      </header>
      <section className="max-w-5xl mx-auto px-6 py-8 grid grid-cols-1 md:grid-cols-2 gap-6">
        {items.map((it) => (
          <Link key={it.slug} href={`/compare/${it.slug}`} className="rounded-lg border p-5 bg-white hover:shadow-sm">
            <h2 className="text-lg font-semibold mb-1">{it.title || it.slug}</h2>
            <p className="text-gray-600 text-sm">{it.description}</p>
          </Link>
        ))}
      </section>
    </main>
  );
}


