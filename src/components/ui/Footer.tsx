import Link from 'next/link';

export function Footer() {
  return (
    <footer className="border-t bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 text-sm text-gray-600">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="font-semibold text-gray-900">Vitae</div>
          <nav className="flex gap-4">
            <Link href="/pricing">Pricing</Link>
            <Link href="/compare">Compare</Link>
            <Link href="/migrate">Migrate</Link>
            <Link href="/blog">Blog</Link>
            <Link href="/faq">FAQ</Link>
          </nav>
        </div>
        <div className="mt-6 text-xs text-gray-500">© {new Date().getFullYear()} Vitae. All rights reserved.</div>
      </div>
    </footer>
  );
}


