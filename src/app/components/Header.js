// app/components/Header.js
"use client";

import { useState, useEffect, useRef } from 'react';
import { useSession, signOut } from 'next-auth/react';
import Link from 'next/link';
import styles from './Header.module.css';

export default function Header() {
  const { data: session, status } = useSession();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef(null); // Create a ref for the dropdown container

  // This effect handles the "click outside" logic to close the dropdown
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    }
    // Add the event listener when the component mounts
    document.addEventListener("mousedown", handleClickOutside);
    // Clean up the event listener when the component unmounts
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [dropdownRef]);

  if (status === "loading") {
    return <header className={styles.header}></header>;
  }

  return (
    <header className={styles.header}>
      <Link href="/" className={styles.logo}>
        PROTEKO
      </Link>
      
      <nav className={styles.navLinks}>
        {session && (
          <Link href="/game" className={styles.navLink}>Play Game</Link>
        )}
        {session?.user.role === 'ADMIN' && (
          <Link href="/editor" className={styles.navLink}>City Editor</Link>
        )}
      </nav>

      <div className={styles.profileContainer}>
        {session ? (
          // The ref is attached to this main container
          <div className={styles.dropdownWrapper} ref={dropdownRef}>
            <button 
              className={styles.avatar}
              // The button now toggles the dropdown on click
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            >
              {session.user.name?.charAt(0).toUpperCase()}
            </button>

            {isDropdownOpen && (
              <div className={styles.dropdown}>
                <div className={styles.dropdownInfo}>
                  <strong>{session.user.name}</strong>
                  <small>{session.user.email}</small>
                </div>
                <button 
                  onClick={() => {
                    setIsDropdownOpen(false); // Close dropdown on click
                    signOut({ callbackUrl: '/' });
                  }} 
                  className={styles.logoutButton}
                >
                  Log Out
                </button>
              </div>
            )}
          </div>
        ) : (
          <Link href="/login" className={styles.loginButton}>
            Login / Register
          </Link>
        )}
      </div>
    </header>
  );
}