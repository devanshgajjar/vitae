import Link from 'next/link';
import { getAllSlugs, loadMarkdownBySlug } from '@/lib/md';

export default function BlogIndexPage() {
  const slugs = getAllSlugs('blog');
  const items = slugs.map((slug) => {
    const md = loadMarkdownBySlug('blog', slug);
    const title = (md?.frontmatter?.title as string) || slug;
    const description = (md?.frontmatter?.description as string) || '';
    const isPillar = title.toLowerCase().includes('guide') || title.toLowerCase().includes('2025') || title.toLowerCase().includes('pillar');
    return { slug, title, description, isPillar };
  });

  const pillars = items.filter(i => i.isPillar);
  const playbooks = items.filter(i => !i.isPillar);

  return (
    <main>
      <header className="bg-white border-b">
        <div className="max-w-5xl mx-auto px-6 py-10">
          <h1 className="text-3xl font-semibold mb-2">Vitae Blog</h1>
          <p className="text-gray-600">ATS-first resumes, cover letters, and job-seeker playbooks.</p>
        </div>
      </header>
      <section className="max-w-5xl mx-auto px-6 py-8">
        <h2 className="text-2xl font-semibold mb-4">Pillars</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {pillars.map((it) => (
            <Link key={it.slug} href={`/blog/${it.slug}`} className="rounded-lg border p-5 bg-white hover:shadow-sm">
              <h3 className="text-lg font-semibold mb-1">{it.title}</h3>
              <p className="text-gray-600 text-sm">{it.description}</p>
            </Link>
          ))}
        </div>
      </section>
      <section className="max-w-5xl mx-auto px-6 pb-10">
        <h2 className="text-2xl font-semibold mb-4">Playbooks</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {playbooks.map((it) => (
            <Link key={it.slug} href={`/blog/${it.slug}`} className="rounded-lg border p-5 bg-white hover:shadow-sm">
              <h3 className="text-lg font-semibold mb-1">{it.title}</h3>
              <p className="text-gray-600 text-sm">{it.description}</p>
            </Link>
          ))}
        </div>
      </section>
    </main>
  );
}


