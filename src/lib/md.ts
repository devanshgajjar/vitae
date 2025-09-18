import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import MarkdownIt from 'markdown-it';

const md = new MarkdownIt({ html: true, linkify: true, breaks: false });

export interface LoadedMarkdown {
  frontmatter: Record<string, any>;
  html: string;
  raw: string;
}

export function getContentDir(subdir: 'compare' | 'migrate' | 'blog' | 'agents'): string {
  return path.join(process.cwd(), 'content', subdir);
}

export function getAllSlugs(subdir: 'compare' | 'migrate' | 'blog'): string[] {
  const dir = getContentDir(subdir);
  if (!fs.existsSync(dir)) return [];
  return fs
    .readdirSync(dir)
    .filter((f) => f.endsWith('.md'))
    .map((f) => f.replace(/\.md$/, ''));
}

export function loadMarkdownBySlug(subdir: 'compare' | 'migrate' | 'blog', slug: string): LoadedMarkdown | null {
  const filePath = path.join(getContentDir(subdir), `${slug}.md`);
  if (!fs.existsSync(filePath)) return null;
  const file = fs.readFileSync(filePath, 'utf8');
  const { data, content } = matter(file);
  const html = md.render(content);
  return { frontmatter: data || {}, html, raw: content };
}


