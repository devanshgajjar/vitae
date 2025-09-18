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
    <main className="max-w-5xl mx-auto px-6 py-12">
      <h1 className="text-3xl font-bold mb-6">Vitae Blog</h1>
      <section className="mb-10">
        <h2 className="text-2xl font-semibold mb-4">Pillars</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {pillars.map((it) => (
            <Link key={it.slug} href={`/blog/${it.slug}`} className="block rounded-lg border p-5 hover:shadow-md bg-white">
              <h3 className="text-xl font-semibold mb-2">{it.title}</h3>
              <p className="text-gray-600">{it.description}</p>
            </Link>
          ))}
        </div>
      </section>
      <section>
        <h2 className="text-2xl font-semibold mb-4">Playbooks</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {playbooks.map((it) => (
            <Link key={it.slug} href={`/blog/${it.slug}`} className="block rounded-lg border p-5 hover:shadow-md bg-white">
              <h3 className="text-xl font-semibold mb-2">{it.title}</h3>
              <p className="text-gray-600">{it.description}</p>
            </Link>
          ))}
        </div>
      </section>
    </main>
  );
}


