import Link from 'next/link';

export function NavBar() {
  return (
    <nav className="w-full border-b bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-14 flex items-center justify-between">
        <Link href="/" className="font-semibold">Vitae</Link>
        <div className="flex items-center gap-4 text-sm">
          <Link href="/compare" className="text-gray-700 hover:text-black">Compare</Link>
          <Link href="/migrate" className="text-gray-700 hover:text-black">Migrate</Link>
          <Link href="/blog" className="text-gray-700 hover:text-black">Blog</Link>
          <Link href="/pricing" className="text-gray-700 hover:text-black">Pricing</Link>
          <Link href="/faq" className="text-gray-700 hover:text-black">FAQ</Link>
          <Link href="/auth/sign-in" className="ml-2 inline-block bg-blue-600 text-white px-3 py-1.5 rounded-md">Start for Free</Link>
        </div>
      </div>
    </nav>
  );
}


