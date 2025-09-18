import { Metadata } from 'next';
import { getAllSlugs, loadMarkdownBySlug } from '@/lib/md';

type Params = { params: { slug: string } };

export async function generateStaticParams() {
  return getAllSlugs('migrate').map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const md = loadMarkdownBySlug('migrate', params.slug);
  const title = (md?.frontmatter?.title as string) || 'Migrate — Vitae';
  const description = (md?.frontmatter?.description as string) || 'Vitae migration';
  return { title, description, openGraph: { title, description }, twitter: { card: 'summary_large_image' } };
}

export default function MigratePage({ params }: Params) {
  const md = loadMarkdownBySlug('migrate', params.slug);
  if (!md) return <div className="prose mx-auto p-6">Not found</div>;
  return (
    <article className="prose prose-zinc mx-auto p-6">
      <h1>{(md.frontmatter.title as string) || 'Migrate'}</h1>
      <div dangerouslySetInnerHTML={{ __html: md.html }} />
    </article>
  );
}


