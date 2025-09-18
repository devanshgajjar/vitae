import { Metadata } from 'next';
import { loadMarkdownBySlug } from '@/lib/md';

export const dynamic = 'force-dynamic';

type Params = { params: { slug: string } };

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const md = loadMarkdownBySlug('blog', params.slug);
  const title = (md?.frontmatter?.title as string) || 'Blog — Vitae';
  const description = (md?.frontmatter?.description as string) || 'Vitae blog';
  return { title, description, openGraph: { title, description }, twitter: { card: 'summary_large_image' } };
}

export default function BlogPage({ params }: Params) {
  const md = loadMarkdownBySlug('blog', params.slug);
  if (!md) return <div className="prose mx-auto p-6">Not found</div>;
  return (
    <main>
      <header className="bg-white border-b">
        <div className="max-w-5xl mx-auto px-6 py-10">
          <h1 className="text-3xl font-semibold">{(md.frontmatter.title as string) || 'Blog'}</h1>
          <p className="text-gray-600 mt-2">{(md.frontmatter.description as string) || ''}</p>
        </div>
      </header>
      <article className="max-w-5xl mx-auto px-6 py-8">
        <div className="prose">
          <div dangerouslySetInnerHTML={{ __html: md.html }} />
        </div>
        {md.jsonLd && (
          <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: md.jsonLd }} />
        )}
      </article>
    </main>
  );
}


