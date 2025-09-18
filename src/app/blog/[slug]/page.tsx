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
    <article className="prose prose-zinc mx-auto p-6">
      <h1>{(md.frontmatter.title as string) || 'Blog'}</h1>
      <div dangerouslySetInnerHTML={{ __html: md.html }} />
      {md.jsonLd && (
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: md.jsonLd }} />
      )}
    </article>
  );
}


