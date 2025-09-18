import Link from 'next/link';
import { getAllSlugs, loadMarkdownBySlug } from '@/lib/md';

export default function CompareIndexPage() {
  const slugs = getAllSlugs('compare');
  const items = slugs.map((slug) => {
    const md = loadMarkdownBySlug('compare', slug);
    return { slug, title: md?.frontmatter?.title as string, description: md?.frontmatter?.description as string };
  });

  return (
    <main className="max-w-5xl mx-auto px-6 py-12">
      <h1 className="text-3xl font-bold mb-6">Compare Resume Builders vs Vitae</h1>
      <p className="text-gray-600 mb-8">See how Vitae differs on ATS results, tailoring speed, and pricing.</p>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {items.map((it) => (
          <Link key={it.slug} href={`/compare/${it.slug}`} className="block rounded-lg border p-5 hover:shadow-md bg-white">
            <h2 className="text-xl font-semibold mb-2">{it.title || it.slug}</h2>
            <p className="text-gray-600">{it.description}</p>
          </Link>
        ))}
      </div>
    </main>
  );
}


