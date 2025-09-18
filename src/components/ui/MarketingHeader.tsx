'use client';

import { usePathname } from 'next/navigation';
import { NavBar } from './NavBar';

export function MarketingHeader() {
  const pathname = usePathname();
  const isProductRoute = pathname.startsWith('/dashboard') || pathname.startsWith('/create') || pathname.startsWith('/profile');
  if (isProductRoute) return null;
  return <NavBar />;
}


