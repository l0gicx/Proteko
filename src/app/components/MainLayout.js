// app/components/MainLayout.js
"use client";

import { usePathname } from 'next/navigation';
import Header from './Header';

// These are the routes where the main header should NOT be displayed
const HIDDEN_HEADER_ROUTES = ['/editor'];

export default function MainLayout({ children }) {
  const pathname = usePathname();
  
  // Check if the current route is one of the hidden routes
  const isHeaderHidden = HIDDEN_HEADER_ROUTES.includes(pathname);

  return (
    <>
      {!isHeaderHidden && <Header />}
      {children}
    </>
  );
}