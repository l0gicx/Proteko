// app/components/MainLayout.js
"use client";

import { usePathname } from 'next/navigation';
import Header from './Header';

// Add '/game' to this array
const HIDDEN_HEADER_ROUTES = ['/editor', '/game'];

export default function MainLayout({ children }) {
  const pathname = usePathname();
  
  // The logic now correctly checks for both routes
  const isHeaderHidden = HIDDEN_HEADER_ROUTES.some(path => pathname.startsWith(path));

  return (
    <>
      {!isHeaderHidden && <Header />}
      {children}
    </>
  );
}